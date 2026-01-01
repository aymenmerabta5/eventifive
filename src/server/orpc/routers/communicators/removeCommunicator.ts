import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { eventCommunicator, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string(),
});

const outputSchema = z.object({
  ok: z.literal(true),
});

/**
 * Remove a communicator from an event (organizer only).
 */
export const removeCommunicatorRouter = protectedProcedure
  .route({ method: "POST", path: "/communicators/remove" })
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

    // Check if communicator exists
    const [existing] = await db
      .select({ id: eventCommunicator.id })
      .from(eventCommunicator)
      .where(
        and(
          eq(eventCommunicator.eventId, input.eventId),
          eq(eventCommunicator.userId, input.userId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Communicator not found for this event",
      });
    }

    // Remove communicator
    await db
      .delete(eventCommunicator)
      .where(
        and(
          eq(eventCommunicator.eventId, input.eventId),
          eq(eventCommunicator.userId, input.userId),
        ),
      );

    return { ok: true as const };
  });
