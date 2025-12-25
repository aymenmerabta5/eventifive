import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventRegistration } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { invalidateDashboardCache } from "@/server/cache";

const inputSchema = z.object({
  eventId: z.string(),
  reason: z.string().max(500).optional(),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  registrationCount: z.number(),
});

export const cancelEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/cancel" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const now = new Date();

    try {
      // 1. Fetch event and verify ownership
      const [eventData] = await db
        .select()
        .from(event)
        .where(
          and(eq(event.id, input.eventId), eq(event.organizerId, session.user.id))
        );

      if (!eventData) {
        throw new ORPCError("NOT_FOUND", { message: "Event not found" });
      }

      // 2. Check current status - cannot cancel already cancelled/archived events
      if (eventData.status === "cancelled") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Event is already cancelled.",
        });
      }

      if (eventData.status === "archived") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot cancel an archived event.",
        });
      }

      // 3. Get registration count for notification purposes
      const [regCount] = await db
        .select({ count: count() })
        .from(eventRegistration)
        .where(eq(eventRegistration.eventId, input.eventId));

      const registrationCount = regCount?.count ?? 0;

      // 4. Cancel the event
      await db
        .update(event)
        .set({
          status: "cancelled",
          cancelledAt: now,
          cancellationReason: input.reason || null,
          updatedAt: now,
        })
        .where(eq(event.id, input.eventId));

      await invalidateDashboardCache(session.user.id);

      // TODO: Future enhancement - send notification emails to registered users
      // TODO: Future enhancement - handle refunds for paid registrations

      return {
        success: true,
        message:
          registrationCount > 0
            ? `Event cancelled. ${registrationCount} registered participant(s) should be notified.`
            : "Event cancelled successfully.",
        registrationCount,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error cancelling event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to cancel event",
      });
    }
  });
