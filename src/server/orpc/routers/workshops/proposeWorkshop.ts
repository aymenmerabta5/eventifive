import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const inputSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  researchDomain: z.string().max(255).optional(),
  capacity: z.number().int().min(1).max(1000).optional(),
});

const outputSchema = z.object({
  id: z.string(),
  title: z.string(),
  proposalStatus: z.string(),
  proposedAt: z.date(),
});

/**
 * Submit a workshop proposal for an event.
 * Users can propose workshops which organizers can accept/reject.
 */
export const proposeWorkshopRouter = protectedProcedure
  .route({ method: "POST", path: "/workshops/propose" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Verify event exists and is published
    const [eventData] = await db
      .select({
        id: event.id,
        status: event.status,
      })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData.status !== "published") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Cannot propose workshops for unpublished events",
      });
    }

    // Check if user already has a pending proposal for this event
    const [existingProposal] = await db
      .select({ id: workshop.id })
      .from(workshop)
      .where(
        and(
          eq(workshop.eventId, input.eventId),
          eq(workshop.facilitatorId, userId),
          eq(workshop.proposalStatus, "pending"),
        ),
      )
      .limit(1);

    if (existingProposal) {
      throw new ORPCError("BAD_REQUEST", {
        message: "You already have a pending workshop proposal for this event",
      });
    }

    // Create workshop proposal
    const workshopId = randomUUID();
    const now = new Date();

    await db.insert(workshop).values({
      id: workshopId,
      eventId: input.eventId,
      title: input.title,
      description: input.description ?? null,
      researchDomain: input.researchDomain ?? null,
      capacity: input.capacity ?? null,
      facilitatorId: userId,
      proposalStatus: "pending",
      proposedAt: now,
    });

    return {
      id: workshopId,
      title: input.title,
      proposalStatus: "pending",
      proposedAt: now,
    };
  });
