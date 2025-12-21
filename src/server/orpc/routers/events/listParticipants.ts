import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventRegistration, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const participantSchema = z.object({
  id: z.number(),
  userId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  roleAtEvent: z.string(),
  registeredAt: z.date(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]),
});

const outputSchema = z.object({
  participants: z.array(participantSchema),
});

export const listParticipantsRouter = protectedProcedure
  .route({ method: "GET", path: "/events/{eventId}/participants" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const organizerId = session.user.id;

    // Verify the event exists and the user is the organizer
    const [eventRow] = await db
      .select({ id: event.id, organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventRow) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventRow.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    try {
      const registrations = await db
        .select({
          id: eventRegistration.id,
          userId: eventRegistration.userId,
          userName: user.name,
          userEmail: user.email,
          roleAtEvent: eventRegistration.roleAtEvent,
          registeredAt: eventRegistration.registeredAt,
          paymentStatus: eventRegistration.paymentStatus,
        })
        .from(eventRegistration)
        .innerJoin(user, eq(user.id, eventRegistration.userId))
        .where(eq(eventRegistration.eventId, input.eventId))
        .orderBy(eventRegistration.registeredAt);

      const participants = registrations.map((reg) => ({
        id: reg.id,
        userId: reg.userId,
        userName: reg.userName,
        userEmail: reg.userEmail,
        roleAtEvent: reg.roleAtEvent,
        registeredAt: reg.registeredAt,
        paymentStatus: reg.paymentStatus as
          | "unpaid"
          | "pending"
          | "paid"
          | "failed"
          | "refunded",
      }));

      return { participants };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to list participants:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to load participants",
      });
    }
  });
