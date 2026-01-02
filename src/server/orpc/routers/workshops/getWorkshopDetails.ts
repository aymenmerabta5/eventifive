import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().min(1),
});

const outputSchema = z.object({
  workshop: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      researchDomain: z.string().nullable(),
      capacity: z.number().nullable(),
      startAt: z.date().nullable(),
      endAt: z.date().nullable(),
      facilitatorName: z.string(),
      eventId: z.string(),
      eventTitle: z.string(),
    })
    .nullable(),
});

/**
 * Get public workshop details for the resources page.
 * Only returns accepted workshops.
 */
export const getWorkshopDetailsRouter = publicProcedure
  .route({ method: "GET", path: "/workshops/details/{workshopId}" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    // Get workshop with event and facilitator info
    const [workshopData] = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        researchDomain: workshop.researchDomain,
        capacity: workshop.capacity,
        proposalStatus: workshop.proposalStatus,
        startAt: workshop.startAt,
        endAt: workshop.endAt,
        eventId: workshop.eventId,
        eventTitle: event.title,
        facilitatorName: user.name,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(eq(workshop.id, input.workshopId))
      .limit(1);

    if (!workshopData) {
      return { workshop: null };
    }

    // Only return accepted workshops
    if (workshopData.proposalStatus !== "accepted") {
      return { workshop: null };
    }

    return {
      workshop: {
        id: workshopData.id,
        title: workshopData.title,
        description: workshopData.description,
        researchDomain: workshopData.researchDomain,
        capacity: workshopData.capacity,
        startAt: workshopData.startAt,
        endAt: workshopData.endAt,
        facilitatorName: workshopData.facilitatorName,
        eventId: workshopData.eventId,
        eventTitle: workshopData.eventTitle,
      },
    };
  });
