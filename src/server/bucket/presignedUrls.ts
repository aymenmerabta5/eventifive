import { s3Client } from "./s3Client";

const UPLOAD_URL_EXPIRY = 15 * 60; // 15 minutes
const DOWNLOAD_URL_EXPIRY = 60 * 60; // 60 minutes

export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string,
): Promise<{ uploadUrl: string; expiresAt: Date }> {
  const uploadUrl = s3Client.presign(s3Key, {
    method: "PUT",
    expiresIn: UPLOAD_URL_EXPIRY,
    type: contentType,
  });

  const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRY * 1000);

  return { uploadUrl, expiresAt };
}

export async function generatePresignedDownloadUrl(
  s3Key: string,
): Promise<{ downloadUrl: string; expiresAt: Date }> {
  const downloadUrl = s3Client.presign(s3Key, {
    expiresIn: DOWNLOAD_URL_EXPIRY,
  });

  const expiresAt = new Date(Date.now() + DOWNLOAD_URL_EXPIRY * 1000);

  return { downloadUrl, expiresAt };
}

export async function verifyFileExistsInS3(s3Key: string): Promise<boolean> {
  return await s3Client.exists(s3Key);
}
