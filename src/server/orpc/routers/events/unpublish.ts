import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventRegistration } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { invalidateDashboardCache } from "@/server/cache";

const inputSchema = z.object({
  eventId: z.string(),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const unpublishEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/unpublish" })
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

      // 2. Only published events can be unpublished
      if (eventData.status !== "published") {
        throw new ORPCError("BAD_REQUEST", {
          message: `Cannot unpublish event with status "${eventData.status}".`,
        });
      }

      // 3. Check for registrations - cannot unpublish if there are registrations
      const [regCount] = await db
        .select({ count: count() })
        .from(eventRegistration)
        .where(eq(eventRegistration.eventId, input.eventId));

      const hasRegistrations = (regCount?.count ?? 0) > 0;

      if (hasRegistrations) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Cannot unpublish an event with registrations. Cancel the event instead if needed.",
        });
      }

      // 4. Revert to draft
      await db
        .update(event)
        .set({
          status: "draft",
          publishedAt: null,
          updatedAt: now,
        })
        .where(eq(event.id, input.eventId));

      await invalidateDashboardCache(session.user.id);

      return {
        success: true,
        message: "Event reverted to draft.",
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error unpublishing event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to unpublish event",
      });
    }
  });
