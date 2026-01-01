import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { issueBadgeForRole } from "@/lib/badges/issueBadge";

const inputSchema = z.object({
  workshopId: z.string().uuid(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

const outputSchema = z.object({
  ok: z.literal(true),
  workshopId: z.string(),
});

/**
 * Accept a workshop proposal (organizer only).
 * Issues a facilitator badge to the proposer.
 */
export const acceptProposalRouter = protectedProcedure
  .route({ method: "POST", path: "/workshops/{workshopId}/accept" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Get workshop with event info
    const [workshopData] = await db
      .select({
        id: workshop.id,
        eventId: workshop.eventId,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
        eventOrganizerId: event.organizerId,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .where(eq(workshop.id, input.workshopId))
      .limit(1);

    if (!workshopData) {
      throw new ORPCError("NOT_FOUND", { message: "Workshop not found" });
    }

    // Verify user is the organizer
    if (workshopData.eventOrganizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    // Check if proposal is pending
    if (workshopData.proposalStatus !== "pending") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Workshop proposal is already ${workshopData.proposalStatus}`,
      });
    }

    // Validate dates if provided
    if (input.startAt && input.endAt) {
      const startDate = new Date(input.startAt);
      const endDate = new Date(input.endAt);
      if (endDate <= startDate) {
        throw new ORPCError("BAD_REQUEST", {
          message: "End time must be after start time",
        });
      }
    }

    // Accept the proposal
    await db
      .update(workshop)
      .set({
        proposalStatus: "accepted",
        respondedAt: new Date(),
        startAt: input.startAt ? new Date(input.startAt) : null,
        endAt: input.endAt ? new Date(input.endAt) : null,
      })
      .where(eq(workshop.id, input.workshopId));

    // Issue facilitator badge (fire and forget)
    issueBadgeForRole(
      workshopData.eventId,
      workshopData.facilitatorId,
      "speaker", // Using "speaker" role for facilitators since we don't have a "facilitator" badge role yet
    ).catch((error) => {
      console.error(
        `Failed to issue facilitator badge for user ${workshopData.facilitatorId}:`,
        error,
      );
    });

    return {
      ok: true as const,
      workshopId: input.workshopId,
    };
  });
