import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  files,
  submissionFile,
  reviewAssignment,
  workshopFile,
  workshop,
  event,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputGetDownloadUrlSchema = z.object({
  fileId: z.string().uuid(),
});

const outputGetDownloadUrlSchema = z.object({
  downloadUrl: z.string(),
  expiresAt: z.date(),
  fileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
});

export const getDownloadUrlRouter = protectedProcedure
  .route({ method: "POST", path: "/files/get-download-url" })
  .input(inputGetDownloadUrlSchema)
  .output(outputGetDownloadUrlSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { fileId } = input;

    try {
      // Fetch file record
      const [file] = await db.select().from(files).where(eq(files.id, fileId));

      if (!file) {
        throw new ORPCError("NOT_FOUND", {
          message: "File not found",
        });
      }

      // Check if user owns the file
      if (file.userId !== session.user.id) {
        let hasAccess = false;

        // Check if it's a submission file with review assignment
        const [submissionFileRecord] = await db
          .select()
          .from(submissionFile)
          .where(eq(submissionFile.fileId, fileId))
          .limit(1);

        if (submissionFileRecord) {
          const [assignment] = await db
            .select()
            .from(reviewAssignment)
            .where(
              and(
                eq(
                  reviewAssignment.submissionId,
                  submissionFileRecord.submissionId,
                ),
                eq(reviewAssignment.reviewerId, session.user.id),
              ),
            )
            .limit(1);

          if (assignment) {
            hasAccess = true;
          }
        }

        // Check if it's a workshop proposal file and user is the event organizer
        if (!hasAccess) {
          const [workshopFileRecord] = await db
            .select({
              workshopId: workshopFile.workshopId,
              purpose: workshopFile.purpose,
            })
            .from(workshopFile)
            .where(eq(workshopFile.fileId, fileId))
            .limit(1);

          if (workshopFileRecord) {
            // Get workshop with event info
            const [workshopData] = await db
              .select({
                eventOrganizerId: event.organizerId,
                facilitatorId: workshop.facilitatorId,
              })
              .from(workshop)
              .innerJoin(event, eq(workshop.eventId, event.id))
              .where(eq(workshop.id, workshopFileRecord.workshopId))
              .limit(1);

            if (workshopData) {
              // Allow access if user is the event organizer or the workshop facilitator
              if (
                workshopData.eventOrganizerId === session.user.id ||
                workshopData.facilitatorId === session.user.id
              ) {
                hasAccess = true;
              }
            }
          }
        }

        if (!hasAccess) {
          throw new ORPCError("FORBIDDEN", {
            message: "You do not have permission to access this file",
          });
        }
      }

      // Check file status
      if (file.status !== "completed") {
        throw new ORPCError("BAD_REQUEST", {
          message: "File upload is not completed yet",
        });
      }

      // Generate presigned download URL
      const { downloadUrl, expiresAt } = await generatePresignedDownloadUrl(
        file.s3Key,
      );

      return {
        downloadUrl,
        expiresAt,
        fileName: file.fileName,
        fileSize: file.fileSize,
        contentType: file.contentType,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error generating download URL:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate download URL",
      });
    }
  });
