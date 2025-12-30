import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, badge, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  badgeId: z.string().uuid(),
  reason: z.string().min(1).max(255),
});

const outputSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/**
 * Revoke a badge. Only the event organizer can revoke badges.
 */
export const revokeBadgeRouter = protectedProcedure
  .route({ method: "POST", path: "/badges/revoke" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Get the badge with event and user info
    const [badgeData] = await db
      .select({
        id: badge.id,
        eventId: badge.eventId,
        userId: badge.userId,
        revokedAt: badge.revokedAt,
      })
      .from(badge)
      .where(eq(badge.id, input.badgeId))
      .limit(1);

    if (!badgeData) {
      throw new ORPCError("NOT_FOUND", { message: "Badge not found" });
    }

    // Get user name for the response message
    const [userData] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, badgeData.userId))
      .limit(1);

    // Verify the user is the organizer of the event
    const [eventData] = await db
      .select({
        organizerId: event.organizerId,
      })
      .from(event)
      .where(eq(event.id, badgeData.eventId))
      .limit(1);

    if (!eventData || eventData.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    // Check if already revoked
    if (badgeData.revokedAt) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This badge has already been revoked",
      });
    }

    // Revoke the badge
    await db
      .update(badge)
      .set({
        revokedAt: new Date(),
        revokeReason: input.reason,
        updatedAt: new Date(),
      })
      .where(eq(badge.id, input.badgeId));

    return {
      success: true as const,
      message: `Badge for ${userData?.name ?? "user"} has been revoked`,
    };
  });
