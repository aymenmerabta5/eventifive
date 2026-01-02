import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { s3Client } from "@/server/bucket/s3Client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files, workshop, workshopFile } from "@/server/db/schema";
import { sanitizeFileName } from "@/server/utils/fileValidation";
import { and, eq, sql } from "drizzle-orm";

const MAX_MATERIAL_SIZE = 50 * 1024 * 1024; // 50MB for materials
const MAX_MATERIALS_PER_WORKSHOP = 10;
const ALLOWED_MATERIAL_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

// Image content types for determining file type
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif"]);

/**
 * Validate workshop material file
 */
function validateMaterialFile(
  file: File,
  maxSize: number,
  allowedTypes: Set<string>,
): string | null {
  if (!allowedTypes.has(file.type)) {
    return "Invalid file type. Allowed: PDF, DOC, PPT, XLS, ZIP, images, and videos.";
  }
  if (file.size > maxSize) {
    return `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

/**
 * GET - Get material count for a workshop (for quota display)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");
    const normalizedWorkshopId =
      typeof workshopId === "string" && workshopId.trim().length > 0
        ? workshopId.trim()
        : null;

    if (!normalizedWorkshopId) {
      return NextResponse.json(
        { message: "workshopId is required" },
        { status: 400 },
      );
    }

    // Verify user is the facilitator
    const [workshopData] = await db
      .select({
        id: workshop.id,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
      })
      .from(workshop)
      .where(eq(workshop.id, normalizedWorkshopId));

    if (!workshopData) {
      return NextResponse.json(
        { message: "Workshop not found" },
        { status: 404 },
      );
    }

    if (workshopData.facilitatorId !== session.user.id) {
      return NextResponse.json(
        { message: "You are not the facilitator of this workshop" },
        { status: 403 },
      );
    }

    if (workshopData.proposalStatus !== "accepted") {
      return NextResponse.json(
        { message: "Workshop must be accepted to upload materials" },
        { status: 400 },
      );
    }

    // Count materials uploaded for this workshop
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(workshopFile)
      .where(
        and(
          eq(workshopFile.workshopId, normalizedWorkshopId),
          eq(workshopFile.purpose, "workshop_material"),
        ),
      );

    return NextResponse.json({
      uploadedCount: Number(existing[0]?.count ?? 0),
      maxFiles: MAX_MATERIALS_PER_WORKSHOP,
    });
  } catch (error) {
    console.error("Error getting material count:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error getting material count",
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Upload a new material to an accepted workshop
 */
export async function POST(req: NextRequest) {
  let uploadedS3Key: string | null = null;

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
    const workshopId = formData.get("workshopId");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    const normalizedWorkshopId =
      typeof workshopId === "string" && workshopId.trim().length > 0
        ? workshopId.trim()
        : null;

    if (!normalizedWorkshopId) {
      return NextResponse.json(
        { message: "workshopId is required" },
        { status: 400 },
      );
    }

    // Verify workshop exists and is accepted
    const [workshopData] = await db
      .select({
        id: workshop.id,
        facilitatorId: workshop.facilitatorId,
        proposalStatus: workshop.proposalStatus,
        eventId: workshop.eventId,
      })
      .from(workshop)
      .where(eq(workshop.id, normalizedWorkshopId));

    if (!workshopData) {
      return NextResponse.json(
        { message: "Workshop not found" },
        { status: 404 },
      );
    }

    if (workshopData.facilitatorId !== session.user.id) {
      return NextResponse.json(
        { message: "You are not the facilitator of this workshop" },
        { status: 403 },
      );
    }

    if (workshopData.proposalStatus !== "accepted") {
      return NextResponse.json(
        { message: "Workshop must be accepted to upload materials" },
        { status: 400 },
      );
    }

    // Check material quota
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(workshopFile)
      .where(
        and(
          eq(workshopFile.workshopId, normalizedWorkshopId),
          eq(workshopFile.purpose, "workshop_material"),
        ),
      );

    if (Number(existing[0]?.count ?? 0) >= MAX_MATERIALS_PER_WORKSHOP) {
      return NextResponse.json(
        {
          message: `Maximum ${MAX_MATERIALS_PER_WORKSHOP} materials allowed per workshop`,
        },
        { status: 400 },
      );
    }

    // Validate file
    const validationError = validateMaterialFile(
      file,
      MAX_MATERIAL_SIZE,
      ALLOWED_MATERIAL_TYPES,
    );
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    // Generate file ID and S3 key
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const s3Key = `${session.user.id}/workshops/${normalizedWorkshopId}/materials/${fileId}-${sanitizedName}`;

    // Determine file type for database
    const fileType = IMAGE_TYPES.has(file.type) ? "image" : "document";

    // Upload to S3
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.write(s3Key, buffer, {
      type: file.type,
    });
    uploadedS3Key = s3Key;

    // Create database records
    const [newFile] = await db
      .insert(files)
      .values({
        id: fileId,
        userId: session.user.id,
        fileName: sanitizedName,
        fileType,
        fileSize: file.size,
        contentType: file.type,
        s3Key,
        status: "completed",
      })
      .returning({ id: files.id });

    if (!newFile) {
      // Rollback S3 upload
      await s3Client.delete(s3Key);
      return NextResponse.json(
        { message: "Failed to create file record" },
        { status: 500 },
      );
    }

    // Create workshop file link
    const workshopFileId = uuidv4();
    await db.insert(workshopFile).values({
      id: workshopFileId,
      workshopId: normalizedWorkshopId,
      fileId: newFile.id,
      purpose: "workshop_material",
    });

    return NextResponse.json({
      success: true,
      fileId: newFile.id,
      fileName: sanitizedName,
      fileSize: file.size,
      message: "Material uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading material:", error);

    // Cleanup S3 if upload failed after S3 write
    if (uploadedS3Key) {
      try {
        await s3Client.delete(uploadedS3Key);
      } catch (cleanupError) {
        console.error("Failed to cleanup S3 file:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error uploading material",
      },
      { status: 500 },
    );
  }
}
