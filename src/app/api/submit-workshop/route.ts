import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { s3Client } from "@/server/bucket/s3Client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, files, workshop, workshopFile, user } from "@/server/db/schema";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { and, eq, sql } from "drizzle-orm";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_WORKSHOP = 3;
const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_RESEARCH_DOMAIN_LENGTH = 255;
const ALLOWED_DOCUMENT_TYPES = new Set([
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
        { status: 400 },
      );
    }

    // Count files uploaded for workshops by this user for this event
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(workshopFile)
      .innerJoin(workshop, eq(workshopFile.workshopId, workshop.id))
      .where(
        and(
          eq(workshop.facilitatorId, session.user.id),
          eq(workshop.eventId, normalizedEventId),
        ),
      );

    return NextResponse.json({
      uploadedCount: Number(existing[0]?.count ?? 0),
      maxFiles: MAX_FILES_PER_WORKSHOP,
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
    const description = formData.get("description");
    const researchDomain = formData.get("researchDomain");
    const capacity = formData.get("capacity");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

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
        { message: "Workshop title is required" },
        { status: 400 },
      );
    }

    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { message: "Title is too long" },
        { status: 400 },
      );
    }

    // Validate description
    const normalizedDescription =
      typeof description === "string" && description.trim().length > 0
        ? description.trim()
        : null;

    if (
      normalizedDescription &&
      normalizedDescription.length > MAX_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        { message: "Description is too long" },
        { status: 400 },
      );
    }

    // Validate research domain
    const normalizedResearchDomain =
      typeof researchDomain === "string" && researchDomain.trim().length > 0
        ? researchDomain.trim()
        : null;

    if (
      normalizedResearchDomain &&
      normalizedResearchDomain.length > MAX_RESEARCH_DOMAIN_LENGTH
    ) {
      return NextResponse.json(
        { message: "Research domain is too long" },
        { status: 400 },
      );
    }

    // Validate capacity
    let normalizedCapacity: number | null = null;
    if (capacity) {
      const parsedCapacity = parseInt(String(capacity), 10);
      if (
        !isNaN(parsedCapacity) &&
        parsedCapacity > 0 &&
        parsedCapacity <= 1000
      ) {
        normalizedCapacity = parsedCapacity;
      }
    }

    // Verify event exists and is published
    const [eventData] = await db
      .select({
        id: event.id,
        status: event.status,
      })
      .from(event)
      .where(eq(event.id, normalizedEventId))
      .limit(1);

    if (!eventData) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (eventData.status !== "published") {
      return NextResponse.json(
        { message: "Cannot propose workshops for unpublished events" },
        { status: 400 },
      );
    }

    // Check if user already has a pending proposal for this event
    const [existingProposal] = await db
      .select({ id: workshop.id })
      .from(workshop)
      .where(
        and(
          eq(workshop.eventId, normalizedEventId),
          eq(workshop.facilitatorId, session.user.id),
          eq(workshop.proposalStatus, "pending"),
        ),
      )
      .limit(1);

    if (existingProposal) {
      return NextResponse.json(
        {
          message:
            "You already have a pending workshop proposal for this event",
        },
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
          { message: "Only document files are allowed" },
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
    const workshopId = uuidv4();
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const key = `${session.user.id}/workshops/${workshopId}/${fileId}-${sanitizedName}`;

    // Upload to S3
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await s3Client.write(key, buffer, {
      type: file.type,
    });

    try {
      await db.transaction(async (tx) => {
        // Create workshop proposal
        await tx.insert(workshop).values({
          id: workshopId,
          eventId: normalizedEventId,
          title: normalizedTitle,
          description: normalizedDescription,
          researchDomain: normalizedResearchDomain,
          capacity: normalizedCapacity,
          facilitatorId: session.user.id,
          proposalStatus: "pending",
          proposedAt: new Date(),
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

        // Link file to workshop
        await tx.insert(workshopFile).values({
          id: uuidv4(),
          workshopId,
          fileId,
          purpose: "proposal_document",
          uploadedAt: new Date(),
        });
      });
    } catch (dbError) {
      // Rollback S3 upload if database transaction fails
      await s3Client.delete(key);
      throw dbError;
    }

    return NextResponse.json({
      message: "Workshop proposal submitted successfully",
      workshopId,
      fileId,
      documentKey: key,
    });
  } catch (error) {
    console.error("Error submitting workshop proposal:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error submitting workshop proposal",
      },
      { status: 500 },
    );
  }
}
