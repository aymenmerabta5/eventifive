import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { s3Client } from "@/server/bucket/s3Client";
import { protectedProcedure } from "../index";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const outputUploadImageSchema = z.object({
  message: z.string(),
  imageKey: z.string(),
});

export const uploadImageRouter = protectedProcedure
  .route({
    method: "POST",
    path: "/upload-image",
  })
  .output(outputUploadImageSchema)
  .handler(async ({ context }) => {
    const { req, session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        throw new ORPCError("BAD_REQUEST", { message: "No file provided" });
      }

      // Validate file
      const validation = validateFile(file.name, file.size, file.type);
      if (!validation.valid) {
        throw new ORPCError("BAD_REQUEST", { message: validation.error });
      }

      if (validation.fileType !== "image") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Only image files are allowed for profile pictures",
        });
      }

      if (file.size > MAX_PROFILE_IMAGE_SIZE) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Profile image must be less than 5MB",
        });
      }

      // Create S3 key
      const fileId = uuidv4();
      const sanitizedName = sanitizeFileName(file.name);
      const key = `${session.user.id}/profile/${fileId}-${sanitizedName}`;

      // Upload to S3
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      // Update DB
      await db
        .update(user)
        .set({ image: key })
        .where(eq(user.id, session.user.id));

      return {
        message: "Profile image uploaded successfully",
        imageKey: key,
      };
    } catch (error) {
      console.error("Error uploading image:", error);

      if (error instanceof ORPCError) throw error;

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Error uploading image",
      });
    }
  });
