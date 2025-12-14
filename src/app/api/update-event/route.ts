import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, files, eventImages } from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { updateEventSchema } from "@/lib/schemas/schemas";

const MAX_EVENT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_EVENT_IMAGES = 4; // cover (1) + gallery (up to 3)

async function uploadEventImage(
  file: File,
  eventId: string,
  userId: string,
  isGallery: boolean = false
): Promise<{ fileId: string; s3Key: string } | null> {
  try {
    const validation = validateFile(file.name, file.size, file.type);
    if (!validation.valid || validation.fileType !== "image") {
      console.warn(`Skipping invalid file: ${file.name} - ${validation.error}`);
      return null;
    }

    if (file.size > MAX_EVENT_IMAGE_SIZE) {
      console.warn(`Skipping oversized file: ${file.name}`);
      return null;
    }

    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);

    const folder = isGallery ? "gallery" : "cover";
    const s3Key = `${userId}/events/${eventId}/${folder}/${fileId}-${sanitizedName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    await db.insert(files).values({
      id: fileId,
      userId: userId,
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

    return { fileId, s3Key };
  } catch (error) {
    console.error(`Failed to upload image ${file.name}:`, error);
    return null;
  }
}

async function deleteEventImage(
  fileId: string,
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    // Get the file record to find the S3 key
    const [fileRecord] = await db
      .select({ s3Key: files.s3Key })
      .from(files)
      .where(
        and(
          eq(files.id, fileId),
          eq(files.userId, userId),
          eq(files.eventId, eventId)
        )
      );

    if (!fileRecord) {
      console.warn(`File not found for deletion: ${fileId}`);
      return false;
    }

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: fileRecord.s3Key,
      })
    );

    // Delete from eventImages table
    await db.delete(eventImages).where(eq(eventImages.fileId, fileId));

    // Delete from files table
    await db.delete(files).where(eq(files.id, fileId));

    return true;
  } catch (error) {
    console.error(`Failed to delete image ${fileId}:`, error);
    return false;
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

    const userId = session.user.id;
    const formData = await req.formData();

    const eventId = formData.get("eventId") as string;
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Verify the event exists and user owns it
    const [eventData] = await db
      .select()
      .from(event)
      .where(and(eq(event.id, eventId), eq(event.organizerId, userId)));

    if (!eventData) {
      return NextResponse.json(
        { message: "Event not found or you do not have permission to update it" },
        { status: 404 }
      );
    }

    // Parse event data
    const eventFields = {
      eventId,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      type: formData.get("type") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      location: (formData.get("location") as string) || undefined,
      priceAmount: parseInt(formData.get("priceAmount") as string) || undefined,
      priceCurrency: (formData.get("priceCurrency") as string) || undefined,
    };

    // Validate fields
    const parsed = updateEventSchema.safeParse(eventFields);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Get existing images count
    const existingImages = await db
      .select({ id: eventImages.id, fileId: eventImages.fileId })
      .from(eventImages)
      .where(eq(eventImages.eventId, eventId));

    // Parse image operations
    const removeImageIds = formData
      .getAll("removeImageIds")
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim());

    const newImages = formData.getAll("images") as File[];
    const validNewImages = newImages.filter(
      (f): f is File => f instanceof File && f.size > 0
    );

    // Calculate final image count
    const keptImageCount = existingImages.filter(
      (img) => !removeImageIds.includes(img.fileId)
    ).length;
    const totalImagesAfter = keptImageCount + validNewImages.length;

    if (totalImagesAfter > MAX_EVENT_IMAGES) {
      return NextResponse.json(
        {
          message: `Maximum ${MAX_EVENT_IMAGES} image(s) allowed total. You have ${keptImageCount} existing and are trying to add ${validNewImages.length} new.`,
        },
        { status: 400 }
      );
    }

    // Delete requested images
    const deleteResults = {
      deleted: [] as string[],
      failed: [] as string[],
    };

    for (const fileId of removeImageIds) {
      const exists = existingImages.some((img) => img.fileId === fileId);
      if (!exists) {
        deleteResults.failed.push(fileId);
        continue;
      }

      const success = await deleteEventImage(fileId, userId, eventId);
      if (success) {
        deleteResults.deleted.push(fileId);
      } else {
        deleteResults.failed.push(fileId);
      }
    }

    // Upload new images
    const uploadResults = {
      uploaded: [] as { fileId: string; s3Key: string }[],
      failed: [] as string[],
    };

    // Get remaining images after deletion to determine if first new image is cover
    const remainingExisting = existingImages.filter(
      (img) => !deleteResults.deleted.includes(img.fileId)
    );
    const needsCover = remainingExisting.length === 0;

    for (let i = 0; i < validNewImages.length; i++) {
      const file = validNewImages[i];
      if (!file) continue;
      // First new image becomes cover if no existing images remain
      const isGallery = !(needsCover && i === 0);
      const result = await uploadEventImage(file, eventId, userId, isGallery);
      if (result) {
        uploadResults.uploaded.push(result);

        // Add to eventImages table
        await db.insert(eventImages).values({
          id: uuidv4(),
          eventId: eventId,
          fileId: result.fileId,
          isDefault: needsCover && i === 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        uploadResults.failed.push(file.name);
      }
    }

    // Update event fields
    const now = new Date();
    await db
      .update(event)
      .set({
        title: parsed.data.title,
        smallDescription: parsed.data.description,
        type: parsed.data.type,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        location: parsed.data.location,
        priceAmount: parsed.data.priceAmount ?? eventData.priceAmount,
        priceCurrency: parsed.data.priceCurrency ?? eventData.priceCurrency,
        updatedAt: now,
      })
      .where(eq(event.id, eventId));

    const hasFailures =
      deleteResults.failed.length > 0 || uploadResults.failed.length > 0;
    const message = hasFailures
      ? `Event updated, but some image operations failed`
      : "Event updated successfully";

    return NextResponse.json({
      status: "success",
      message,
      eventId,
      images: {
        deleted: deleteResults.deleted.length,
        uploaded: uploadResults.uploaded.length,
        deleteFailed: deleteResults.failed,
        uploadFailed: uploadResults.failed,
      },
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update event",
        status: "error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch existing images for an event
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

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this event
    const [eventData] = await db
      .select({ organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, eventId));

    if (!eventData || eventData.organizerId !== session.user.id) {
      return NextResponse.json(
        { message: "Event not found or you do not have permission" },
        { status: 404 }
      );
    }

    // Fetch images with file details
    const images = await db
      .select({
        id: eventImages.id,
        fileId: eventImages.fileId,
        isDefault: eventImages.isDefault,
        s3Key: files.s3Key,
        fileName: files.fileName,
        fileSize: files.fileSize,
        contentType: files.contentType,
      })
      .from(eventImages)
      .innerJoin(files, eq(eventImages.fileId, files.id))
      .where(eq(eventImages.eventId, eventId));

    // Generate presigned URLs for each image
    const { generatePresignedDownloadUrl } = await import(
      "@/server/bucket/presignedUrls"
    );

    const imagesWithUrls = await Promise.all(
      images.map(async (img) => {
        const { downloadUrl } = await generatePresignedDownloadUrl(img.s3Key);
        return {
          id: img.id,
          fileId: img.fileId,
          isDefault: img.isDefault,
          fileName: img.fileName,
          fileSize: img.fileSize,
          contentType: img.contentType,
          url: downloadUrl,
        };
      })
    );

    // Sort so default (cover) image is first
    imagesWithUrls.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

    return NextResponse.json({
      status: "success",
      images: imagesWithUrls,
    });
  } catch (error) {
    console.error("Error fetching event images:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch event images",
        status: "error",
      },
      { status: 500 }
    );
  }
}
