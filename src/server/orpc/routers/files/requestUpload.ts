import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { validateFile, generateS3Key } from "@/server/utils/fileValidation";
import { generatePresignedUploadUrl } from "@/server/bucket/presignedUrls";

const inputRequestUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive(),
  contentType: z.string().min(1).max(100),
  eventId: z.string().optional(),
});

const outputRequestUploadSchema = z.object({
  fileId: z.string(),
  uploadUrl: z.string(),
  expiresAt: z.date(),
  s3Key: z.string(),
});

export const requestUploadRouter = protectedProcedure
  .route({ method: "POST", path: "/files/request-upload" })
  .input(inputRequestUploadSchema)
  .output(outputRequestUploadSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { fileName, fileSize, contentType, eventId } = input;

    // Validate file
    const validation = validateFile(fileName, fileSize, contentType);
    if (!validation.valid) {
      throw new ORPCError("BAD_REQUEST", {
        message: validation.error,
      });
    }

    const fileId = uuidv4();
    const s3Key = generateS3Key(
      session.user.id,
      validation.fileType!,
      fileId,
      fileName,
    );

    try {
      // Generate presigned upload URL
      const { uploadUrl, expiresAt } = await generatePresignedUploadUrl(
        s3Key,
        contentType,
      );

      // Create database record with pending status
      await db.insert(files).values({
        id: fileId,
        userId: session.user.id,
        eventId: eventId ?? null,
        s3Key,
        fileName,
        fileType: validation.fileType!,
        fileSize,
        contentType,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        fileId,
        uploadUrl,
        expiresAt,
        s3Key,
      };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate upload URL",
      });
    }
  });
