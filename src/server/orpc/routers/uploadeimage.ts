import {NextRequest, NextResponse} from "next/server";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { env } from "@/env";


const r2 = new S3Client({
    region: "auto",
    endpoint: env.S3_ENDPOINT??'',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY??'',
    },
});

export const POST =async(request: NextRequest) => {
    const formData = await request.formData();
    const file=formData.get("file") as File;
    const bytes=await file.arrayBuffer();
    const buffer=Buffer.from(bytes);
    const putObjectCommand=new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME??'',
        Key: file.name,
        Body: buffer,
        ContentType: file.type,
    });
   try{
    const response=await r2.send(putObjectCommand);
    return NextResponse.json({
        message: "Image uploaded successfully",
        url: `https://${env.S3_BUCKET_NAME}.${env.S3_ENDPOINT}/${file.name}`,
    });
   }catch(error){
    console.error("Error uploading image:", error);
    return NextResponse.json({
        message: "Error uploading image",
        error: error instanceof Error ? error.message : String(error),
    }, {status: 500});
   }
}