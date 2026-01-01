import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event } from "@/server/db/schema";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

const proposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  researchDomain: z.string().nullable(),
  capacity: z.number().nullable(),
  proposalStatus: z.enum(["pending", "accepted", "rejected"]),
  proposedAt: z.date(),
  respondedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  startAt: z.date().nullable(),
  endAt: z.date().nullable(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
});

const outputSchema = z.object({
  proposals: z.array(proposalSchema),
});

/**
 * List all workshop proposals for the current user.
 */
export const listMyProposalsRouter = protectedProcedure
  .route({ method: "GET", path: "/workshops/mine" })
  .output(outputSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    // Get all user's workshop proposals with event info
    const proposals = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        researchDomain: workshop.researchDomain,
        capacity: workshop.capacity,
        proposalStatus: workshop.proposalStatus,
        proposedAt: workshop.proposedAt,
        respondedAt: workshop.respondedAt,
        rejectionReason: workshop.rejectionReason,
        startAt: workshop.startAt,
        endAt: workshop.endAt,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .where(eq(workshop.facilitatorId, userId))
      .orderBy(desc(workshop.proposedAt));

    return {
      proposals: proposals.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        researchDomain: p.researchDomain,
        capacity: p.capacity,
        proposalStatus: p.proposalStatus as "pending" | "accepted" | "rejected",
        proposedAt: p.proposedAt,
        respondedAt: p.respondedAt,
        rejectionReason: p.rejectionReason,
        startAt: p.startAt,
        endAt: p.endAt,
        event: {
          id: p.eventId,
          title: p.eventTitle,
          type: p.eventType,
          startDate: p.eventStartDate,
          endDate: p.eventEndDate,
        },
      })),
    };
  });
