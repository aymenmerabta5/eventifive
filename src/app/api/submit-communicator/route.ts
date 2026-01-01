import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { s3Client } from "@/server/bucket/s3Client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  event,
  eventReviewers,
  files,
  reviewAssignment,
  submission,
  submissionFile,
} from "@/server/db/schema";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { and, eq } from "drizzle-orm";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TITLE_LENGTH = 500;
const MAX_ABSTRACT_LENGTH = 5000;
const MAX_KEYWORDS_LENGTH = 500;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const VALID_SUBMISSION_TYPES = new Set(["oral", "poster", "displayed_paper"]);

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
        { status: 400 },
      );
    }

    // Check if user already has a submission for this event
    const [existingSubmission] = await db
      .select({
        id: submission.id,
        title: submission.title,
        status: submission.status,
        submittedAt: submission.submittedAt,
      })
      .from(submission)
      .where(
        and(
          eq(submission.eventId, normalizedEventId),
          eq(submission.submitterId, session.user.id),
        ),
      )
      .limit(1);

    return NextResponse.json({
      hasSubmitted: !!existingSubmission,
      submission: existingSubmission || null,
    });
  } catch (error) {
    console.error("Error checking submission status:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error checking submission status",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId");
    const title = formData.get("title");
    const abstract = formData.get("abstract");
    const keywords = formData.get("keywords");
    const type = formData.get("type");

    // Validate file
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    // Validate eventId
    const normalizedEventId =
      typeof eventId === "string" && eventId.trim().length > 0
        ? eventId.trim()
        : null;

    if (!normalizedEventId) {
      return NextResponse.json(
        { message: "eventId is required" },
        { status: 400 },
      );
    }

    // Validate title
    const normalizedTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : null;

    if (!normalizedTitle) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { message: `Title must be less than ${MAX_TITLE_LENGTH} characters` },
        { status: 400 },
      );
    }

    // Validate abstract
    const normalizedAbstract =
      typeof abstract === "string" && abstract.trim().length > 0
        ? abstract.trim()
        : null;

    if (!normalizedAbstract) {
      return NextResponse.json(
        { message: "Abstract is required" },
        { status: 400 },
      );
    }

    if (normalizedAbstract.length > MAX_ABSTRACT_LENGTH) {
      return NextResponse.json(
        { message: `Abstract must be less than ${MAX_ABSTRACT_LENGTH} characters` },
        { status: 400 },
      );
    }

    // Validate keywords (optional)
    const normalizedKeywords =
      typeof keywords === "string" && keywords.trim().length > 0
        ? keywords.trim()
        : null;

    if (normalizedKeywords && normalizedKeywords.length > MAX_KEYWORDS_LENGTH) {
      return NextResponse.json(
        { message: `Keywords must be less than ${MAX_KEYWORDS_LENGTH} characters` },
        { status: 400 },
      );
    }

    // Validate submission type
    const normalizedType =
      typeof type === "string" && type.trim().length > 0 ? type.trim() : null;

    if (!normalizedType || !VALID_SUBMISSION_TYPES.has(normalizedType)) {
      return NextResponse.json(
        { message: "Invalid submission type. Must be oral, poster, or displayed_paper" },
        { status: 400 },
      );
    }

    // Verify event exists and is published
    const [eventData] = await db
      .select({
        id: event.id,
        status: event.status,
        title: event.title,
      })
      .from(event)
      .where(eq(event.id, normalizedEventId))
      .limit(1);

    if (!eventData) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 },
      );
    }

    if (eventData.status !== "published") {
      return NextResponse.json(
        { message: "Cannot submit papers to unpublished events" },
        { status: 400 },
      );
    }

    // Check for existing submission (one per user per event)
    const [existingSubmission] = await db
      .select({ id: submission.id })
      .from(submission)
      .where(
        and(
          eq(submission.eventId, normalizedEventId),
          eq(submission.submitterId, session.user.id),
        ),
      )
      .limit(1);

    if (existingSubmission) {
      return NextResponse.json(
        { message: "You have already submitted a paper for this event" },
        { status: 400 },
      );
    }

    // Validate file type
    const isAllowedDocType = ALLOWED_DOCUMENT_TYPES.has(file.type);
    if (!isAllowedDocType) {
      const validation = validateFile(file.name, file.size, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 },
        );
      }
      if (validation.fileType !== "document") {
        return NextResponse.json(
          { message: "Only PDF, DOC, and DOCX files are allowed" },
          { status: 400 },
        );
      }
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { message: "Document must be less than 10MB" },
        { status: 400 },
      );
    }

    // Generate IDs
    const submissionId = uuidv4();
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const key = `${session.user.id}/submissions/${submissionId}/${fileId}-${sanitizedName}`;

    // Upload to S3
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await s3Client.write(key, buffer, {
      type: file.type,
    });

    try {
      await db.transaction(async (tx) => {
        // Create submission record
        await tx.insert(submission).values({
          id: submissionId,
          eventId: normalizedEventId,
          title: normalizedTitle,
          abstract: normalizedAbstract,
          keywords: normalizedKeywords,
          type: normalizedType as "oral" | "poster" | "displayed_paper",
          status: "draft",
          submitterId: session.user.id,
          submittedAt: new Date(),
          updatedAt: new Date(),
        });

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

        // Link file to submission
        await tx.insert(submissionFile).values({
          id: uuidv4(),
          submissionId,
          fileId,
          purpose: "abstract_pdf",
          uploadedAt: new Date(),
        });

        // Assign this submission to all accepted reviewers for the event
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
                submissionId,
                reviewerId: reviewer.reviewerId,
              })),
            )
            .onConflictDoNothing({
              target: [
                reviewAssignment.submissionId,
                reviewAssignment.reviewerId,
              ],
            });
        }
      });
    } catch (dbError) {
      // Rollback S3 upload if database transaction fails
      await s3Client.delete(key);
      throw dbError;
    }

    return NextResponse.json({
      message: "Paper submitted successfully",
      submissionId,
      fileId,
      documentKey: key,
    });
  } catch (error) {
    console.error("Error submitting paper:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error submitting paper",
      },
      { status: 500 },
    );
  }
}
