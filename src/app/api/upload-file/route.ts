import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { and, eq, sql } from "drizzle-orm";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_EVENT_PER_USER = 3;

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

    if (normalizedEventId) {
      const existing = await db
        .select({ count: sql<number>`count(*)` })
        .from(files)
        .where(
          and(
            eq(files.userId, session.user.id),
            eq(files.eventId, normalizedEventId),
            eq(files.fileType, "document")
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

    const validation = validateFile(file.name, file.size, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    if (validation.fileType !== "document") {
      return NextResponse.json(
        { message: "Only document files are allowed" },
        { status: 400 }
      );
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

    await db.insert(files).values({
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

    return NextResponse.json({
      message: "Document uploaded successfully",
      fileId,
      documentKey: key,
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

