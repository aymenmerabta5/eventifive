import "dotenv/config";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "./src/server/bucket/s3Client";

console.log("✅ dotenv loaded:", {
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "✅" : "❌",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "✅" : "❌",
});

if (!process.env.S3_BUCKET_NAME) {
  throw new Error("Missing S3_BUCKET_NAME in .env");
}

async function main() {
  console.log("Starting Cloudflare R2 test...");

  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET_NAME })
    );

    console.log("✅ Objects in bucket:", response.Contents || []);
  } catch (err) {
    console.error("❌ Failed to list objects:", err);
  }

  console.log("Finished test.");
}

main();
