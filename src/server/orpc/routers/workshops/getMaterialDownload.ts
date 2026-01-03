import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  files,
  workshop,
  workshopFile,
  workshopRegistration,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputSchema = z.object({
  workshopFileId: z.string().min(1),
});

const outputSchema = z.object({
  downloadUrl: z.string(),
  expiresAt: z.date(),
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
});

/**
 * Generate presigned download URL for workshop material.
 * Only accessible to facilitator or registered attendees.
 */
export const getMaterialDownloadRouter = protectedProcedure
  .route({ method: "POST", path: "/workshop/material/download" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get workshop file with file and workshop data (includes both proposal documents and materials)
    const [workshopFileData] = await db
      .select({
        id: workshopFile.id,
        workshopId: workshopFile.workshopId,
        fileId: workshopFile.fileId,
        purpose: workshopFile.purpose,
        file: {
          id: files.id,
          s3Key: files.s3Key,
          fileName: files.fileName,
          fileSize: files.fileSize,
          contentType: files.contentType,
          status: files.status,
        },
      })
      .from(workshopFile)
      .innerJoin(files, eq(workshopFile.fileId, files.id))
      .where(eq(workshopFile.id, input.workshopFileId));

    if (!workshopFileData) {
      throw new ORPCError("NOT_FOUND", { message: "Material not found" });
    }

    // Get workshop to check facilitator
    const [workshopData] = await db
      .select({
        id: workshop.id,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
      })
      .from(workshop)
      .where(eq(workshop.id, workshopFileData.workshopId));

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
            eq(workshopRegistration.workshopId, workshopFileData.workshopId),
            eq(workshopRegistration.userId, userId),
          ),
        );
      isRegistered = !!registration;
    }

    if (!isFacilitator && !isRegistered) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "You must be registered for this workshop to download materials",
      });
    }

    // Check file status
    if (workshopFileData.file.status !== "completed") {
      throw new ORPCError("BAD_REQUEST", {
        message: "File upload is not completed yet",
      });
    }

    // Generate presigned download URL
    const { downloadUrl, expiresAt } = await generatePresignedDownloadUrl(
      workshopFileData.file.s3Key,
    );

    return {
      downloadUrl,
      expiresAt,
      fileName: workshopFileData.file.fileName,
      fileSize: workshopFileData.file.fileSize,
      contentType: workshopFileData.file.contentType,
    };
  });
