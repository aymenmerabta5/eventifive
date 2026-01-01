import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().uuid(),
  reason: z.string().min(1).max(1000),
});

const outputSchema = z.object({
  ok: z.literal(true),
});

/**
 * Reject a workshop proposal with a reason (organizer only).
 */
export const rejectProposalRouter = protectedProcedure
  .route({ method: "POST", path: "/workshops/{workshopId}/reject" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Get workshop with event info
    const [workshopData] = await db
      .select({
        id: workshop.id,
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

    // Reject the proposal
    await db
      .update(workshop)
      .set({
        proposalStatus: "rejected",
        respondedAt: new Date(),
        rejectionReason: input.reason,
      })
      .where(eq(workshop.id, input.workshopId));

    return { ok: true as const };
  });
