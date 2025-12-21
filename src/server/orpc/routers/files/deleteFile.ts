import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { s3Client } from "@/server/bucket/s3Client";

const inputDeleteFileSchema = z.object({
  fileId: z.string().uuid(),
});

const outputDeleteFileSchema = z.object({
  success: z.boolean(),
});

export const deleteFileRouter = protectedProcedure
  .route({ method: "POST", path: "/files/delete" })
  .input(inputDeleteFileSchema)
  .output(outputDeleteFileSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { fileId } = input;

    try {
      // Fetch file record
      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)));

      if (!file) {
        throw new ORPCError("NOT_FOUND", {
          message: "File not found",
        });
      }

      // Delete from S3 using Bun's native S3 client
      try {
        await s3Client.delete(file.s3Key);
      } catch (s3Error) {
        console.error("Error deleting from S3:", s3Error);
        // Continue with database deletion even if S3 deletion fails
      }

      // Delete from database
      await db.delete(files).where(eq(files.id, fileId));

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error deleting file:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to delete file",
      });
    }
  });
