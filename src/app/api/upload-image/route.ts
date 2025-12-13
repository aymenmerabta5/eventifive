import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, eventImages, files, user } from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_EVENT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_GALLERY_IMAGES = 3;

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
    const target = formData.get("target");
    const eventId = formData.get("eventId");
    const kind = formData.get("kind");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
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
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const isEventTarget = target === "event";
    const isStagedEventTarget = target === "event_staged";
    if (!isEventTarget && file.size > MAX_PROFILE_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Profile image must be less than 5MB" },
        { status: 400 }
      );
    }
    if ((isEventTarget || isStagedEventTarget) && file.size > MAX_EVENT_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Image must be less than 10MB" },
        { status: 400 }
      );
    }

    // Staged event image upload (no eventId yet)
    if (isStagedEventTarget) {
      const normalizedKind =
        kind === "cover" || kind === "gallery" ? (kind as "cover" | "gallery") : null;
      if (!normalizedKind) {
        return NextResponse.json(
          { message: "kind must be 'cover' or 'gallery'" },
          { status: 400 }
        );
      }

      const fileId = uuidv4();
      const sanitizedName = sanitizeFileName(file.name);
      const folder = normalizedKind === "cover" ? "cover" : "gallery";
      const key = `${session.user.id}/events/staged/${folder}/${fileId}-${sanitizedName}`;

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
        eventId: null,
        s3Key: key,
        fileName: sanitizedName,
        fileType: "image",
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
        status: "completed",
        metadata: { target: "event_staged", kind: normalizedKind },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        message: "Staged event image uploaded successfully",
        fileId,
        imageKey: key,
        kind: normalizedKind,
        staged: true,
      });
    }

    // Event image upload (requires eventId + kind)
    if (isEventTarget) {
      const normalizedEventId =
        typeof eventId === "string" && eventId.trim().length > 0
          ? eventId.trim()
          : null;
      if (!normalizedEventId) {
        return NextResponse.json({ message: "eventId is required" }, { status: 400 });
      }

      const normalizedKind =
        kind === "cover" || kind === "gallery" ? (kind as "cover" | "gallery") : null;
      if (!normalizedKind) {
        return NextResponse.json(
          { message: "kind must be 'cover' or 'gallery'" },
          { status: 400 }
        );
      }

      const [evt] = await db
        .select({ organizerId: event.organizerId })
        .from(event)
        .where(eq(event.id, normalizedEventId))
        .limit(1);

      if (!evt) {
        return NextResponse.json({ message: "Event not found" }, { status: 404 });
      }
      if (evt.organizerId !== session.user.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      if (normalizedKind === "gallery") {
        const existing = await db
          .select({ count: sql<number>`count(*)` })
          .from(eventImages)
          .where(
            and(eq(eventImages.eventId, normalizedEventId), eq(eventImages.isDefault, false))
          );

        const existingCount = Number(existing[0]?.count ?? 0);
        if (existingCount >= MAX_GALLERY_IMAGES) {
          return NextResponse.json(
            { message: `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed` },
            { status: 400 }
          );
        }
      }

      const fileId = uuidv4();
      const sanitizedName = sanitizeFileName(file.name);
      const folder = normalizedKind === "cover" ? "cover" : "gallery";
      const key = `${session.user.id}/events/${normalizedEventId}/${folder}/${fileId}-${sanitizedName}`;

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

      await db.transaction(async (tx) => {
        if (normalizedKind === "cover") {
          await tx
            .update(eventImages)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(
              and(eq(eventImages.eventId, normalizedEventId), eq(eventImages.isDefault, true))
            );
        }

        await tx.insert(files).values({
          id: fileId,
          userId: session.user.id,
          eventId: normalizedEventId,
          s3Key: key,
          fileName: sanitizedName,
          fileType: "image",
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await tx.insert(eventImages).values({
          id: uuidv4(),
          eventId: normalizedEventId,
          fileId,
          isDefault: normalizedKind === "cover",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      return NextResponse.json({
        message: "Event image uploaded successfully",
        fileId,
        imageKey: key,
        kind: normalizedKind,
      });
    }

    // Profile image upload (default)
    const userProfile = await db.select().from(user).where(eq(user.id, session.user.id));
    if (
      userProfile[0]?.image &&
      userProfile[0]?.image !== "" &&
      userProfile[0]?.image !== ""
    ) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: userProfile[0]?.image,
        })
      );
    }

    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const key = `${session.user.id}/profile/${fileId}-${sanitizedName}`;

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

    // Update user profile with new image key
    await db
      .update(user)
      .set({ image: key })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      imageKey: key,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error uploading image" },
      { status: 500 }
    );
  }
}

