import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event } from "@/server/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const workshopSchema = z.object({
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
});

const outputSchema = z.object({
  workshop: workshopSchema.nullable(),
  eventTitle: z.string().nullable(),
});

/**
 * Get the current user's workshop proposal for a specific event.
 * Returns null if no workshop exists.
 */
export const getMyWorkshopForEventRouter = protectedProcedure
  .route({ method: "GET", path: "/workshops/mine/{eventId}" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get user's workshop for this event
    const [workshopData] = await db
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
        eventTitle: event.title,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .where(
        and(
          eq(workshop.facilitatorId, userId),
          eq(workshop.eventId, input.eventId),
        ),
      );

    if (!workshopData) {
      return { workshop: null, eventTitle: null };
    }

    return {
      workshop: {
        id: workshopData.id,
        title: workshopData.title,
        description: workshopData.description,
        researchDomain: workshopData.researchDomain,
        capacity: workshopData.capacity,
        proposalStatus: workshopData.proposalStatus as
          | "pending"
          | "accepted"
          | "rejected",
        proposedAt: workshopData.proposedAt,
        respondedAt: workshopData.respondedAt,
        rejectionReason: workshopData.rejectionReason,
        startAt: workshopData.startAt,
        endAt: workshopData.endAt,
      },
      eventTitle: workshopData.eventTitle,
    };
  });
