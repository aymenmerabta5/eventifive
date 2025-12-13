import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/bucket/s3Client";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { validateFile, sanitizeFileName } from "@/server/utils/fileValidation";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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
        { message: "Only image files are allowed for profile pictures" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Profile image must be less than 5MB" },
        { status: 400 }
      );
    }
    const userProfile=await db.select().from(user).where(eq(user.id, session.user.id));
    if(userProfile[0]?.image && userProfile[0]?.image !== "" && userProfile[0]?.image !== "https://lh3.googleusercontent.com"){
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: env.S3_BUCKET_NAME,
                Key: userProfile[0]?.image,
            })
        );
    }
    // Generate S3 key with user folder structure
    const fileId = uuidv4();
    const sanitizedName = sanitizeFileName(file.name);
    const key = `${session.user.id}/profile/${fileId}-${sanitizedName}`;

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

