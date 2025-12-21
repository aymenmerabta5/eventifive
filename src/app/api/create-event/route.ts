import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { s3Client } from "@/server/bucket/s3Client";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, files, eventImages } from "@/server/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { createDraftEventSchema } from "@/lib/schemas/schemas";

const MAX_EVENT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_EVENT_IMAGES = 4; // cover (1) + gallery (up to 3)

async function uploadEventImage(
  file: File,
  eventId: string,
  userId: string,
  isGallery: boolean = false,
): Promise<{ fileId: string; s3Key: string } | null> {
  try {
    // Validate the file
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

    // Upload to S3 using Bun's native S3 client
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await s3Client.write(s3Key, buffer, {
      type: file.type,
    });

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

    const rawBigDescription = formData.get("bigDescription");
    let bigDescription: unknown = undefined;
    if (
      typeof rawBigDescription === "string" &&
      rawBigDescription.trim().length > 0
    ) {
      try {
        bigDescription = JSON.parse(rawBigDescription);
      } catch {
        return NextResponse.json(
          { message: "Invalid bigDescription JSON" },
          { status: 400 },
        );
      }
    }

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      bigDescription,
      type: formData.get("type") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      location: (formData.get("location") as string) || undefined,
      priceAmount: parseInt(formData.get("priceAmount") as string) || 0,
      priceCurrency: (formData.get("priceCurrency") as string) || "DZD",
    };

    const parsed = createDraftEventSchema.safeParse(eventData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Get all images - first image is cover (isDefault=true), rest are gallery (isDefault=false)
    const images = formData.getAll("images") as File[];
    const allImageFiles = images.filter(
      (f): f is File => f instanceof File && f.size > 0,
    );

    // Also support legacy fields for backward compatibility
    const legacyCover = formData.get("coverImage") as File | null;
    const legacyGallery = formData.getAll("galleryImages") as File[];

    // If no images[] field, fall back to legacy fields
    if (allImageFiles.length === 0) {
      if (legacyCover && legacyCover instanceof File && legacyCover.size > 0) {
        allImageFiles.push(legacyCover);
      }
      for (const file of legacyGallery) {
        if (file instanceof File && file.size > 0) {
          allImageFiles.push(file);
        }
      }
    }

    const stagedGalleryFileIds = formData
      .getAll("stagedGalleryFileId")
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim());

    const totalImagesCount = allImageFiles.length + stagedGalleryFileIds.length;

    console.log("[create-event] Total images to upload:", allImageFiles.length);
    console.log("[create-event] Staged file IDs:", stagedGalleryFileIds.length);

    if (totalImagesCount > MAX_EVENT_IMAGES) {
      return NextResponse.json(
        {
          message: `Maximum ${MAX_EVENT_IMAGES} image(s) allowed total. The first image is used as the cover.`,
        },
        { status: 400 },
      );
    }

    const eventId = uuidv4();
    const now = new Date();

    await db.insert(event).values({
      id: eventId,
      title: parsed.data.title,
      smallDescription: parsed.data.description,
      bigDescription: parsed.data.bigDescription ?? null,
      type: parsed.data.type,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      location: parsed.data.location || null,
      organizerId: userId,
      priceAmount: parsed.data.priceAmount ?? 0,
      priceCurrency: parsed.data.priceCurrency ?? "DZD",
      createdAt: now,
      updatedAt: now,
    });

    const uploadResults = {
      uploadedImages: [] as {
        fileId: string;
        s3Key: string;
        isDefault: boolean;
      }[],
      failedUploads: [] as string[],
    };

    // Upload ALL images - first one is cover (isDefault=true), rest are gallery (isDefault=false)
    for (let i = 0; i < allImageFiles.length; i++) {
      const file = allImageFiles[i]!;
      const isDefault = i === 0; // First image is the cover

      const result = await uploadEventImage(file, eventId, userId, !isDefault);
      if (result) {
        uploadResults.uploadedImages.push({ ...result, isDefault });

        // Insert into eventImages table
        await db.insert(eventImages).values({
          id: uuidv4(),
          eventId: eventId,
          fileId: result.fileId,
          isDefault: isDefault,
          createdAt: now,
          updatedAt: now,
        });

        console.log(
          `[create-event] Uploaded image ${i + 1}/${allImageFiles.length}: ${file.name} (isDefault: ${isDefault})`,
        );
      } else {
        uploadResults.failedUploads.push(file.name);
      }
    }

    // Attach staged gallery uploads (uploaded before the event existed)
    if (stagedGalleryFileIds.length > 0) {
      const stagedFiles = await db
        .select({ id: files.id })
        .from(files)
        .where(
          and(
            eq(files.userId, userId),
            inArray(files.id, stagedGalleryFileIds),
            eq(files.fileType, "image"),
            isNull(files.eventId),
          ),
        );

      const foundIds = new Set(stagedFiles.map((f) => f.id));
      const missing = stagedGalleryFileIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        return NextResponse.json(
          { message: "Some staged images were not found for this user." },
          { status: 400 },
        );
      }

      await db.transaction(async (tx) => {
        await tx
          .update(files)
          .set({ eventId, updatedAt: now })
          .where(
            and(
              eq(files.userId, userId),
              inArray(files.id, stagedGalleryFileIds),
              isNull(files.eventId),
            ),
          );

        await tx.insert(eventImages).values(
          stagedGalleryFileIds.map((fileId) => ({
            id: uuidv4(),
            eventId,
            fileId,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          })),
        );
      });
    }

    const hasFailures = uploadResults.failedUploads.length > 0;
    const message = hasFailures
      ? `Event created, but ${uploadResults.failedUploads.length} image(s) failed to upload`
      : "Event created successfully";

    return NextResponse.json({
      status: "success",
      message,
      eventId,
      uploads: {
        totalUploaded: uploadResults.uploadedImages.length,
        failedUploads: uploadResults.failedUploads,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create event",
        status: "error",
      },
      { status: 500 },
    );
  }
}
