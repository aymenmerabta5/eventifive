import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  workshop,
  workshopFile,
  workshopRegistration,
  files,
} from "@/server/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().min(1),
});

const materialSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
  uploadedAt: z.date(),
});

const outputSchema = z.object({
  materials: z.array(materialSchema),
  workshopTitle: z.string(),
  isAccessible: z.boolean(),
});

/**
 * List materials for a workshop.
 * Only accessible to registered users or the facilitator.
 */
export const listMaterialsRouter = protectedProcedure
  .route({ method: "GET", path: "/workshop/{workshopId}/materials" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get workshop details
    const [workshopData] = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
      })
      .from(workshop)
      .where(eq(workshop.id, input.workshopId));

    if (!workshopData) {
      throw new ORPCError("NOT_FOUND", { message: "Workshop not found" });
    }

    if (workshopData.proposalStatus !== "accepted") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Workshop is not available",
      });
    }

    // Check if user is facilitator or registered attendee
    const isFacilitator = workshopData.facilitatorId === userId;

    let isRegistered = false;
    if (!isFacilitator) {
      const [registration] = await db
        .select()
        .from(workshopRegistration)
        .where(
          and(
            eq(workshopRegistration.workshopId, input.workshopId),
            eq(workshopRegistration.userId, userId),
          ),
        );
      isRegistered = !!registration;
    }

    const isAccessible = isFacilitator || isRegistered;

    if (!isAccessible) {
      // Return empty materials if not accessible, but still return workshop title
      return {
        materials: [],
        workshopTitle: workshopData.title,
        isAccessible: false,
      };
    }

    // Get all materials for this workshop (both proposal documents and uploaded materials)
    const materials = await db
      .select({
        id: workshopFile.id,
        fileId: workshopFile.fileId,
        fileName: files.fileName,
        fileSize: files.fileSize,
        contentType: files.contentType,
        uploadedAt: workshopFile.uploadedAt,
      })
      .from(workshopFile)
      .innerJoin(files, eq(workshopFile.fileId, files.id))
      .where(eq(workshopFile.workshopId, input.workshopId))
      .orderBy(workshopFile.uploadedAt);

    return {
      materials,
      workshopTitle: workshopData.title,
      isAccessible: true,
    };
  });
