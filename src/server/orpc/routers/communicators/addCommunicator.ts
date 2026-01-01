import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { eventCommunicator, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { issueBadgeForRole } from "@/lib/badges/issueBadge";

const inputSchema = z.object({
  eventId: z.string().uuid(),
  email: z.string().email(),
});

const outputSchema = z.object({
  ok: z.literal(true),
  communicatorId: z.string(),
  userId: z.string(),
  userName: z.string(),
});

/**
 * Add a communicator to an event (organizer only).
 * Communicators help manage event communications and submissions.
 */
export const addCommunicatorRouter = protectedProcedure
  .route({ method: "POST", path: "/communicators/add" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Verify user is the organizer
    const [eventData] = await db
      .select({
        id: event.id,
        organizerId: event.organizerId,
      })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    // Find the user by email
    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.email, input.email))
      .limit(1);

    if (!userData) {
      throw new ORPCError("NOT_FOUND", {
        message: "User with this email not found",
      });
    }

    // Check if user is already a communicator
    const [existing] = await db
      .select({ id: eventCommunicator.id })
      .from(eventCommunicator)
      .where(
        and(
          eq(eventCommunicator.eventId, input.eventId),
          eq(eventCommunicator.userId, userData.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: "User is already a communicator for this event",
      });
    }

    // Add communicator
    const communicatorId = randomUUID();
    await db.insert(eventCommunicator).values({
      id: communicatorId,
      eventId: input.eventId,
      userId: userData.id,
      assignedAt: new Date(),
    });

    // Issue badge (fire and forget)
    issueBadgeForRole(input.eventId, userData.id, "communicator").catch(
      (error) => {
        console.error(
          `Failed to issue communicator badge for user ${userData.id}:`,
          error,
        );
      },
    );

    return {
      ok: true as const,
      communicatorId,
      userId: userData.id,
      userName: userData.name,
    };
  });
