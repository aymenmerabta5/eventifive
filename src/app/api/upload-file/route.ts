import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  eventReviewers,
  files,
  reviewAssignment,
  submission,
  submissionFile,
  user,
} from "@/server/db/schema";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { and, eq, sql } from "drizzle-orm";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_EVENT_PER_USER = 3;
const MAX_NAME_LENGTH = 255;
const MAX_RESEARCH_DOMAIN_LENGTH = 100;
const ALLOWED_REGISTRATION_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const normalizedEventId =
      typeof eventId === "string" && eventId.trim().length > 0
        ? eventId.trim()
        : null;

    if (!normalizedEventId) {
      return NextResponse.json(
        { message: "eventId is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(files)
      .where(
        and(
          eq(files.userId, session.user.id),
          eq(files.eventId, normalizedEventId),
          eq(files.fileType, "document"),
          eq(files.status, "completed")
        )
      );

    return NextResponse.json({
      uploadedCount: Number(existing[0]?.count ?? 0),
      maxFiles: MAX_FILES_PER_EVENT_PER_USER,
    });
  } catch (error) {
    console.error("Error getting uploaded file count:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error getting uploaded file count",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId");
    const name = formData.get("name");
    const researchDomain = formData.get("researchDomain");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const normalizedEventId =
      typeof eventId === "string" && eventId.trim().length > 0
        ? eventId.trim()
        : null;

    let normalizedName: string | undefined;
    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json({ message: "Name is required." }, { status: 400 });
      }
      if (trimmedName.length > MAX_NAME_LENGTH) {
        return NextResponse.json({ message: "Name is too long." }, { status: 400 });
      }
      normalizedName = trimmedName;
    }

    const normalizedResearchDomain =
      typeof researchDomain === "string"
        ? researchDomain.trim().length > 0
          ? researchDomain.trim()
          : null
        : null;

    if (
      typeof researchDomain === "string" &&
      researchDomain.trim().length > MAX_RESEARCH_DOMAIN_LENGTH
    ) {
      return NextResponse.json(
        { message: "Research domain is too long." },
        { status: 400 }
      );
    }

    if (normalizedEventId) {
      const existing = await db
        .select({ count: sql<number>`count(*)` })
        .from(files)
        .where(
          and(
            eq(files.userId, session.user.id),
            eq(files.eventId, normalizedEventId),
            eq(files.fileType, "document"),
            eq(files.status, "completed")
          )
        );

      const existingCount = Number(existing[0]?.count ?? 0);
      if (existingCount >= MAX_FILES_PER_EVENT_PER_USER) {
        return NextResponse.json(
          { message: "You can upload a maximum of 3 files for this event." },
          { status: 400 }
        );
      }
    }

    // `validateFile` is shared and intentionally strict; for this route we also allow DOC/DOCX.
    const isAllowedRegistrationDocType = ALLOWED_REGISTRATION_DOCUMENT_TYPES.has(file.type);
    if (!isAllowedRegistrationDocType) {
      const validation = validateFile(file.name, file.size, file.type);
      if (!validation.valid) {
        return NextResponse.json({ message: validation.error }, { status: 400 });
      }
      if (validation.fileType !== "document") {
        return NextResponse.json(
          { message: "Only document files are allowed" },
          { status: 400 }
        );
      }
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { message: "Document must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate S3 key with user folder structure
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const key = `${session.user.id}/documents/${fileId}-${sanitizedName}`;

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

    let submissionId: string | null = null;

    try {
      await db.transaction(async (tx) => {
        if (typeof name === "string" || typeof researchDomain === "string") {
          await tx
            .update(user)
            .set({
              ...(typeof name === "string" ? { name: normalizedName } : {}),
              ...(typeof researchDomain === "string"
                ? { researchDomain: normalizedResearchDomain }
                : {}),
              updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id));
        }

        // Insert file record
        await tx.insert(files).values({
          id: fileId,
          userId: session.user.id,
          eventId: normalizedEventId,
          s3Key: key,
          fileName: file.name,
          fileType: "document",
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
          status: "completed",
        });

        // If eventId is provided, create or find submission and link file
        if (normalizedEventId) {
          // Find existing submission for this user and event
          const [existingSubmission] = await tx
            .select()
            .from(submission)
            .where(
              and(
                eq(submission.eventId, normalizedEventId),
                eq(submission.submitterId, session.user.id),
              ),
            )
            .limit(1);

          if (existingSubmission) {
            // Use existing submission
            submissionId = existingSubmission.id;
          } else {
            // Create new submission
            submissionId = uuidv4();
            const submissionTitle = normalizedName
              ? `Submission by ${normalizedName}`
              : `Submission for Event`;

            await tx.insert(submission).values({
              id: submissionId,
              eventId: normalizedEventId,
              title: submissionTitle,
              abstract: normalizedResearchDomain
                ? `Research Domain: ${normalizedResearchDomain}`
                : null,
              keywords: normalizedResearchDomain || null,
              type: "oral", // Default type
              status: "draft",
              submitterId: session.user.id,
              submittedAt: new Date(),
              updatedAt: new Date(),
            });
          }

          if (!submissionId) {
            throw new Error("Failed to create or locate submission for this upload.");
          }
          const ensuredSubmissionId = submissionId;

          // Assign this submission to all accepted reviewers for the event.
          const reviewers = await tx
            .select({ reviewerId: eventReviewers.userId })
            .from(eventReviewers)
            .where(
              and(
                eq(eventReviewers.eventId, normalizedEventId),
                eq(eventReviewers.status, "accepted"),
              ),
            );

          if (reviewers.length > 0) {
            await tx
              .insert(reviewAssignment)
              .values(
                reviewers.map((reviewer) => ({
                  submissionId: ensuredSubmissionId,
                  reviewerId: reviewer.reviewerId,
                })),
              )
              .onConflictDoNothing({
                target: [reviewAssignment.submissionId, reviewAssignment.reviewerId],
              });
          }

          // Link file to submission
          await tx.insert(submissionFile).values({
            id: uuidv4(),
            submissionId: ensuredSubmissionId,
            fileId,
            purpose: "registration_document",
            uploadedAt: new Date(),
          });
        }
      });
    } catch (dbError) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
        })
      );
      throw dbError;
    }

    return NextResponse.json({
      message: "Document uploaded successfully",
      fileId,
      documentKey: key,
      submissionId,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error uploading document",
      },
      { status: 500 }
    );
  }
}

