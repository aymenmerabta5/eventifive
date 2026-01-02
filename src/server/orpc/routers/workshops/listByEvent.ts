import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, user, workshopRegistration } from "@/server/db/schema";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const workshopSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  researchDomain: z.string().nullable(),
  capacity: z.number().nullable(),
  startAt: z.date().nullable(),
  endAt: z.date().nullable(),
  facilitator: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),
  registrationCount: z.number(),
  isRegistered: z.boolean(),
  isFull: z.boolean(),
});

const outputSchema = z.object({
  workshops: z.array(workshopSchema),
});

/**
 * List all accepted workshops for an event (public endpoint).
 * Returns registration count, whether current user is registered, and capacity status.
 */
export const listByEventRouter = publicProcedure
  .route({ method: "GET", path: "/workshops/event/{eventId}" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session?.user?.id;

    // Get all accepted workshops with facilitator info
    const workshops = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        researchDomain: workshop.researchDomain,
        capacity: workshop.capacity,
        startAt: workshop.startAt,
        endAt: workshop.endAt,
        facilitatorId: workshop.facilitatorId,
        facilitatorName: user.name,
        facilitatorImage: user.image,
      })
      .from(workshop)
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(
        and(
          eq(workshop.eventId, input.eventId),
          eq(workshop.proposalStatus, "accepted"),
        ),
      )
      .orderBy(workshop.startAt);

    if (workshops.length === 0) {
      return { workshops: [] };
    }

    // Get registration counts for all workshops in a single query
    const workshopIds = workshops.map((w) => w.id);
    const registrationCounts = await db
      .select({
        workshopId: workshopRegistration.workshopId,
        count: count(),
      })
      .from(workshopRegistration)
      .where(
        workshopIds.length > 0
          ? eq(workshopRegistration.workshopId, workshopIds[0]!)
          : undefined,
      )
      .groupBy(workshopRegistration.workshopId);

    // If there are more workshop IDs, we need to use a different approach
    // Let's fetch all registrations for these workshops
    const allRegistrations = await db
      .select({
        workshopId: workshopRegistration.workshopId,
        userId: workshopRegistration.userId,
      })
      .from(workshopRegistration);

    // Create maps for quick lookup
    const countMap = new Map<string, number>();
    const userRegisteredMap = new Set<string>();

    for (const reg of allRegistrations) {
      if (workshopIds.includes(reg.workshopId)) {
        const currentCount = countMap.get(reg.workshopId) ?? 0;
        countMap.set(reg.workshopId, currentCount + 1);

        if (userId && reg.userId === userId) {
          userRegisteredMap.add(reg.workshopId);
        }
      }
    }

    return {
      workshops: workshops.map((w) => {
        const registrationCount = countMap.get(w.id) ?? 0;
        const capacity = w.capacity ?? 0;
        const isFull = capacity > 0 && registrationCount >= capacity;

        return {
          id: w.id,
          title: w.title,
          description: w.description,
          researchDomain: w.researchDomain,
          capacity: w.capacity,
          startAt: w.startAt,
          endAt: w.endAt,
          facilitator: {
            id: w.facilitatorId,
            name: w.facilitatorName,
            image: w.facilitatorImage,
          },
          registrationCount,
          isRegistered: userRegisteredMap.has(w.id),
          isFull,
        };
      }),
    };
  });
