import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/sendEmail";
import { WorkshopStatusEmail } from "@/lib/emails/WorkshopStatusEmail";
import { env } from "@/env";

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
        title: workshop.title,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
        eventId: workshop.eventId,
        eventTitle: event.title,
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

    // Send rejection email (fire and forget)
    sendWorkshopRejectionEmail(
      workshopData.facilitatorId,
      workshopData.title,
      workshopData.eventTitle,
    ).catch((error) => {
      console.error(
        `Failed to send workshop rejection email for workshop ${input.workshopId}:`,
        error,
      );
    });

    return { ok: true as const };
  });

async function sendWorkshopRejectionEmail(
  facilitatorId: string,
  workshopTitle: string,
  eventTitle: string,
) {
  // Get facilitator details
  const [facilitatorData] = await db
    .select({
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, facilitatorId))
    .limit(1);

  if (!facilitatorData) {
    console.error("Missing facilitator data for rejection email");
    return;
  }

  await sendEmail(
    facilitatorData.email,
    `Workshop Proposal Update - ${eventTitle}`,
    WorkshopStatusEmail,
    {
      recipientName: facilitatorData.name,
      eventTitle: eventTitle,
      workshopTitle: workshopTitle,
      status: "rejected",
      viewUrl: `${env.BETTER_AUTH_URL}/my-applications`,
    },
  );

  console.log(`Workshop rejection email sent to ${facilitatorData.email}`);
}
