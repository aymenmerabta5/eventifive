import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, files } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";

const MAX_EVENT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { message: "No eventId provided" },
        { status: 400 }
      );
    }

    const [eventRecord] = await db
      .select()
      .from(event)
      .where(and(eq(event.id, eventId), eq(event.organizerId, session.user.id)));

    if (!eventRecord) {
      return NextResponse.json(
        { message: "Event not found or you don't have permission" },
        { status: 403 }
      );
    }

    const validation = validateFile(file.name, file.size, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    if (validation.fileType !== "image") {
      return NextResponse.json(
        { message: "Only image files are allowed for event images" },
        { status: 400 }
      );
    }

    if (file.size > MAX_EVENT_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Event image must be less than 10MB" },
        { status: 400 }
      );
    }
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const s3Key = `${session.user.id}/events/${eventId}/${fileId}-${sanitizedName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // TEACHING: Upload directly to S3 using PutObjectCommand
    // This is simpler than presigned URLs when the server handles the upload
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // TEACHING: Store the file record in our database
    // This creates a relationship between the file and the event
    // We set status to "completed" since we've already uploaded successfully
    await db.insert(files).values({
      id: fileId,
      userId: session.user.id,
      eventId: eventId,
      s3Key: s3Key,
      fileName: sanitizedName,
      fileType: "image",
      fileSize: file.size,
      contentType: file.type,
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TEACHING: Also update the event's image column directly
    // This makes it easy to query the event's cover image without joining the files table
    await db
      .update(event)
      .set({ image: s3Key, updatedAt: new Date() })
      .where(eq(event.id, eventId));

    return NextResponse.json({
      message: "Event image uploaded successfully",
      fileId: fileId,
      s3Key: s3Key,
    });
  } catch (error) {
    console.error("Error uploading event image:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error uploading image" },
      { status: 500 }
    );
  }
}

