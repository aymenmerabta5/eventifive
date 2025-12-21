import { S3Client } from "bun";
import { env } from "@/env";

export const s3Client = new S3Client({
  bucket: env.S3_BUCKET_NAME,
  region: "auto",
  endpoint: env.NEXT_PUBLIC_S3_ENDPOINT,
  accessKeyId: env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
});
