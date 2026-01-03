import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { files, workshop, workshopFile } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { s3Client } from "@/server/bucket/s3Client";

const inputSchema = z.object({
  workshopFileId: z.string().min(1),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Delete a workshop material.
 * Only the workshop facilitator can delete materials.
 */
export const deleteMaterialRouter = protectedProcedure
  .route({ method: "POST", path: "/workshop/material/delete" })
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
        },
      })
      .from(workshopFile)
      .innerJoin(files, eq(workshopFile.fileId, files.id))
      .where(eq(workshopFile.id, input.workshopFileId));

    if (!workshopFileData) {
      throw new ORPCError("NOT_FOUND", { message: "Material not found" });
    }

    // Get workshop to verify facilitator
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

    // Only facilitator can delete materials
    if (workshopData.facilitatorId !== userId) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the workshop facilitator can delete materials",
      });
    }

    // Delete from S3
    try {
      await s3Client.delete(workshopFileData.file.s3Key);
    } catch (s3Error) {
      console.error("Error deleting material from S3:", s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete workshop file link
    await db
      .delete(workshopFile)
      .where(eq(workshopFile.id, input.workshopFileId));

    // Delete file record
    await db.delete(files).where(eq(files.id, workshopFileData.fileId));

    return {
      success: true,
      message: `Material "${workshopFileData.file.fileName}" deleted successfully`,
    };
  });
