import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventSpeakers, eventReviewers } from "@/server/db/schema";
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

export const publishEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/publish" })
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

      // 2. Check current status - only draft events can be published
      if (eventData.status !== "draft") {
        throw new ORPCError("BAD_REQUEST", {
          message: `Cannot publish event with status "${eventData.status}". Only draft events can be published.`,
        });
      }

      // 3. CRITICAL: Validate dates - cannot publish past events
      if (eventData.endDate < now) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Cannot publish an event that has already ended. Please update the event dates first.",
        });
      }

      // Note: We allow publishing events that have already started but not ended.
      // This supports scenarios where organizers set up events late or multi-day events.

      // 4. Check speaker and reviewer requirements
      const [speakerCount] = await db
        .select({ count: count() })
        .from(eventSpeakers)
        .where(
          and(
            eq(eventSpeakers.eventId, input.eventId),
            eq(eventSpeakers.status, "accepted"),
          ),
        );

      const [reviewerCount] = await db
        .select({ count: count() })
        .from(eventReviewers)
        .where(
          and(
            eq(eventReviewers.eventId, input.eventId),
            eq(eventReviewers.status, "accepted"),
          ),
        );

      const acceptedSpeakers = speakerCount?.count ?? 0;
      const acceptedReviewers = reviewerCount?.count ?? 0;

      if (acceptedSpeakers < 1) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Cannot publish event without at least 1 accepted speaker. Please invite speakers and wait for them to accept.",
        });
      }

      if (acceptedReviewers < 3) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Cannot publish event without at least 3 accepted reviewers. Currently have ${acceptedReviewers}. Please invite more reviewers and wait for them to accept.`,
        });
      }

      // 5. Publish the event
      await db
        .update(event)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(event.id, input.eventId));

      await invalidateDashboardCache(session.user.id);

      return {
        success: true,
        message: "Event published successfully",
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error publishing event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to publish event",
      });
    }
  });
