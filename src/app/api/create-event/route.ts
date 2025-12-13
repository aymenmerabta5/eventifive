import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, files } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";
import { createDraftEventSchema } from "@/lib/schemas/schemas";


const MAX_EVENT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
const MAX_GALLERY_IMAGES = 10; 


async function uploadEventImage(
  file: File,
  eventId: string,
  userId: string,
  isGallery: boolean = false
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

export async function POST(req: NextRequest) {
  try {
    // TEACHING: Authentication check is the FIRST thing in any protected route
    // We use Better Auth's getSession which reads the session cookie
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;


    const formData = await req.formData();

  
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
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
          errors: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

   
    const coverImageFile = formData.get("coverImage") as File | null;
    const galleryFiles = formData.getAll("galleryImages") as File[];

    const validGalleryFiles = galleryFiles.filter(
      (f): f is File => f instanceof File && f.size > 0
    );

    if (validGalleryFiles.length > MAX_GALLERY_IMAGES) {
      return NextResponse.json(
        { message: `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed` },
        { status: 400 }
      );
    }

    const eventId = uuidv4();
    const now = new Date();

    await db.insert(event).values({
      id: eventId,
      title: parsed.data.title,
      description: parsed.data.description,
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
      coverImage: null as { fileId: string; s3Key: string } | null,
      galleryImages: [] as { fileId: string; s3Key: string }[],
      failedUploads: [] as string[],
    };

  
    if (coverImageFile && coverImageFile instanceof File && coverImageFile.size > 0) {
      const result = await uploadEventImage(coverImageFile, eventId, userId, false);
      if (result) {
        uploadResults.coverImage = result;
   
        await db
          .update(event)
          .set({ image: result.s3Key, updatedAt: new Date() })
          .where(eq(event.id, eventId));
      } else {
        uploadResults.failedUploads.push(coverImageFile.name);
      }
    }

    for (const file of validGalleryFiles) {
      const result = await uploadEventImage(file, eventId, userId, true);
      if (result) {
        uploadResults.galleryImages.push(result);
      } else {
        uploadResults.failedUploads.push(file.name);
      }
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
        coverImage: uploadResults.coverImage,
        galleryCount: uploadResults.galleryImages.length,
        failedUploads: uploadResults.failedUploads,
      },
    });
  } catch (error) {
  
    console.error("Error creating event:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Failed to create event",
        status: "error"
      },
      { status: 500 }
    );
  }
}
