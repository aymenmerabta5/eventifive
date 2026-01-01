import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

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
  facilitator: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});

const outputSchema = z.object({
  proposals: z.array(proposalSchema),
});

/**
 * List all workshop proposals for an event (organizer only).
 */
export const listProposalsRouter = protectedProcedure
  .route({ method: "GET", path: "/workshops/{eventId}/proposals" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Verify user is the organizer
    const [eventData] = await db
      .select({
        id: event.id,
        organizerId: event.organizerId,
      })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    // Get all workshop proposals with facilitator info
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
        facilitatorId: workshop.facilitatorId,
        facilitatorName: user.name,
        facilitatorEmail: user.email,
      })
      .from(workshop)
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(eq(workshop.eventId, input.eventId))
      .orderBy(workshop.proposedAt);

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
        facilitator: {
          id: p.facilitatorId,
          name: p.facilitatorName,
          email: p.facilitatorEmail,
        },
      })),
    };
  });
