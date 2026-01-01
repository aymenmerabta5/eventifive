import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { eventCommunicator, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

const communicatorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  assignedAt: z.date(),
});

const outputSchema = z.object({
  communicators: z.array(communicatorSchema),
});

/**
 * List all communicators for an event (organizer only).
 */
export const listCommunicatorsRouter = protectedProcedure
  .route({ method: "GET", path: "/communicators/{eventId}" })
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

    // Get all communicators with user info
    const communicators = await db
      .select({
        id: eventCommunicator.id,
        userId: eventCommunicator.userId,
        userName: user.name,
        userEmail: user.email,
        assignedAt: eventCommunicator.assignedAt,
      })
      .from(eventCommunicator)
      .innerJoin(user, eq(eventCommunicator.userId, user.id))
      .where(eq(eventCommunicator.eventId, input.eventId))
      .orderBy(eventCommunicator.assignedAt);

    return {
      communicators: communicators.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.userName,
        userEmail: c.userEmail,
        assignedAt: c.assignedAt,
      })),
    };
  });
