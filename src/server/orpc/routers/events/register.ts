import { z } from "zod";
import { rateLimitedRegistrationProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { event, eventRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { invalidateDashboardCache } from "@/server/cache";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const outputSchema = z.object({
  success: z.boolean(),
  registrationId: z.number(),
  message: z.string(),
});

export const registerForEventRouter = rateLimitedRegistrationProcedure
  .route({ method: "POST", path: "/event/register" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // 1. Get event
    const [eventData] = await db
      .select()
      .from(event)
      .where(eq(event.id, input.eventId));

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    // 2. Check if event is published
    if (eventData.status !== "published") {
      throw new ORPCError("BAD_REQUEST", {
        message:
          eventData.status === "cancelled"
            ? "This event has been cancelled."
            : eventData.status === "archived"
              ? "This event has been archived."
              : "This event is not yet published.",
      });
    }

    // 3. Check if it's a paid event
    if (eventData.priceAmount > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This event requires payment. Please use the checkout flow.",
      });
    }

    // 4. Check if already registered
    const [existing] = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, input.eventId),
          eq(eventRegistration.userId, userId),
        ),
      );

    if (existing) {
      return {
        success: true,
        registrationId: existing.id,
        message: "You are already registered for this event.",
      };
    }

    // 5. Create registration (free events are automatically "paid")
    const [newReg] = await db
      .insert(eventRegistration)
      .values({
        eventId: input.eventId,
        userId,
        roleAtEvent: "participant",
        registeredAt: new Date(),
        paymentStatus: "paid", // Free events are automatically paid
      })
      .returning({ id: eventRegistration.id });

    if (!newReg) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create registration",
      });
    }

    // Invalidate organizer's dashboard cache
    await invalidateDashboardCache(eventData.organizerId);

    return {
      success: true,
      registrationId: newReg.id,
      message: "Successfully registered for the event!",
    };
  });
