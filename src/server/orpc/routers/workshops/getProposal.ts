import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshop, event, user, workshopFile, files } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().uuid(),
});

const fileSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
  purpose: z.string().nullable(),
});

const outputSchema = z.object({
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
  eventId: z.string(),
  eventTitle: z.string(),
  facilitator: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  files: z.array(fileSchema),
});

/**
 * Get a single workshop proposal with full details.
 * Accessible by the facilitator or event organizer.
 */
export const getProposalRouter = protectedProcedure
  .route({ method: "GET", path: "/workshops/{workshopId}" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get workshop with event and facilitator info
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
        eventId: workshop.eventId,
        eventTitle: event.title,
        eventOrganizerId: event.organizerId,
        facilitatorId: workshop.facilitatorId,
        facilitatorName: user.name,
        facilitatorEmail: user.email,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(eq(workshop.id, input.workshopId))
      .limit(1);

    if (!workshopData) {
      throw new ORPCError("NOT_FOUND", { message: "Workshop not found" });
    }

    // Check access: must be facilitator or organizer
    const isFacilitator = workshopData.facilitatorId === userId;
    const isOrganizer = workshopData.eventOrganizerId === userId;

    if (!isFacilitator && !isOrganizer) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have permission to view this workshop",
      });
    }

    // Get workshop files
    const workshopFiles = await db
      .select({
        id: files.id,
        fileName: files.fileName,
        fileSize: files.fileSize,
        contentType: files.contentType,
        purpose: workshopFile.purpose,
      })
      .from(workshopFile)
      .innerJoin(files, eq(workshopFile.fileId, files.id))
      .where(eq(workshopFile.workshopId, input.workshopId));

    return {
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
      eventId: workshopData.eventId,
      eventTitle: workshopData.eventTitle,
      facilitator: {
        id: workshopData.facilitatorId,
        name: workshopData.facilitatorName,
        email: workshopData.facilitatorEmail,
      },
      files: workshopFiles,
    };
  });
