import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { invalidateDashboardCache } from "@/server/cache";

const inputSchema = z.object({
  eventId: z.string(),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const archiveEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/archive" })
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
          and(
            eq(event.id, input.eventId),
            eq(event.organizerId, session.user.id),
          ),
        );

      if (!eventData) {
        throw new ORPCError("NOT_FOUND", { message: "Event not found" });
      }

      // 2. Only completed (past) or cancelled events can be archived
      const isPastEvent = eventData.endDate < now;
      const isCancelled = eventData.status === "cancelled";

      if (!isPastEvent && !isCancelled) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Only past or cancelled events can be archived.",
        });
      }

      if (eventData.status === "archived") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Event is already archived.",
        });
      }

      // 3. Archive the event
      await db
        .update(event)
        .set({
          status: "archived",
          archivedAt: now,
          updatedAt: now,
        })
        .where(eq(event.id, input.eventId));

      await invalidateDashboardCache(session.user.id);

      return {
        success: true,
        message: "Event archived successfully.",
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error archiving event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to archive event",
      });
    }
  });
