import { db } from "@/server/db";
import { eventRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { invalidateDashboardCache } from "@/server/cache";
import { issueBadgeForRegistration } from "@/lib/badges";

/**
 * Auto-register a user for an event with free, paid status.
 * This is used when speakers, reviewers, communicators, or organizers
 * should be automatically registered as participants.
 *
 * Idempotent - safe to call multiple times for same user/event.
 * If user is already registered, returns existing registration ID
 * and ensures badge issuance is triggered.
 *
 * @param eventId - Event to register for
 * @param userId - User to register
 * @param organizerId - Event organizer (for cache invalidation)
 * @param context - Optional context for logging (e.g., "speaker_accept")
 * @returns Registration ID (new or existing)
 */
export async function autoRegisterUserForEvent(
  eventId: string,
  userId: string,
  organizerId: string,
  context?: string,
): Promise<number> {
  const logContext = context ? `[${context}] ` : "";

  try {
    // 1. Check if user is already registered (idempotent)
    const [existing] = await db
      .select({ id: eventRegistration.id })
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, eventId),
          eq(eventRegistration.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      console.log(
        `${logContext}User ${userId} already registered for event ${eventId}`,
      );

      // Still issue badge in case it wasn't issued before (idempotent)
      issueBadgeForRegistration(existing.id).catch((error) => {
        console.error(
          `${logContext}Failed to issue badge for existing registration ${existing.id}:`,
          error,
        );
      });

      return existing.id;
    }

    // 2. Attempt to create free registration with paid status
    // Handle unique constraint violation (race condition) gracefully
    let registrationId: number;

    try {
      const [newReg] = await db
        .insert(eventRegistration)
        .values({
          eventId,
          userId,
          roleAtEvent: "participant",
          registeredAt: new Date(),
          paymentStatus: "paid", // Free auto-registration
        })
        .returning({ id: eventRegistration.id });

      if (!newReg) {
        throw new Error("Failed to create auto-registration");
      }

      registrationId = newReg.id;
      console.log(
        `${logContext}Auto-registered user ${userId} for event ${eventId} (registration ID: ${registrationId})`,
      );
    } catch (insertError) {
      // Check if this is a unique constraint violation (race condition)
      const errorMessage =
        insertError instanceof Error ? insertError.message : String(insertError);
      if (
        errorMessage.includes("unique") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("event_registration_event_user_unique")
      ) {
        // Another concurrent call created the registration - re-query to get it
        console.log(
          `${logContext}Concurrent registration detected, fetching existing for user ${userId}`,
        );
        const [existingAfterRace] = await db
          .select({ id: eventRegistration.id })
          .from(eventRegistration)
          .where(
            and(
              eq(eventRegistration.eventId, eventId),
              eq(eventRegistration.userId, userId),
            ),
          )
          .limit(1);

        if (!existingAfterRace) {
          throw new Error(
            "Registration should exist after unique constraint violation",
          );
        }

        registrationId = existingAfterRace.id;
      } else {
        // Different error, re-throw
        throw insertError;
      }
    }

    // 3. Invalidate organizer's dashboard cache (await to match register.ts pattern)
    await invalidateDashboardCache(organizerId);

    // 4. Issue participant badge (fire and forget)
    issueBadgeForRegistration(registrationId).catch((error) => {
      console.error(
        `${logContext}Failed to issue badge for registration ${registrationId}:`,
        error,
      );
    });

    return registrationId;
  } catch (error) {
    console.error(
      `${logContext}Auto-registration failed for user ${userId} at event ${eventId}:`,
      error,
    );
    throw error;
  }
}
