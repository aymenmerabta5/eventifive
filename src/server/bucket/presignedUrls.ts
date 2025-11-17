import {
	PutObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3Client";
import { env } from "@/env";

const UPLOAD_URL_EXPIRY = 15 * 60; // 15 minutes
const DOWNLOAD_URL_EXPIRY = 60 * 60; // 60 minutes

export async function generatePresignedUploadUrl(
	s3Key: string,
	contentType: string,
): Promise<{ uploadUrl: string; expiresAt: Date }> {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: s3Key,
		ContentType: contentType,
	});

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: UPLOAD_URL_EXPIRY,
	});

	const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRY * 1000);

	return { uploadUrl, expiresAt };
}

export async function generatePresignedDownloadUrl(
	s3Key: string,
): Promise<{ downloadUrl: string; expiresAt: Date }> {
	const command = new GetObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: s3Key,
	});

	const downloadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: DOWNLOAD_URL_EXPIRY,
	});

	const expiresAt = new Date(Date.now() + DOWNLOAD_URL_EXPIRY * 1000);

	return { downloadUrl, expiresAt };
}

export async function verifyFileExistsInS3(s3Key: string): Promise<boolean> {
	try {
		const command = new HeadObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: s3Key,
		});
		await s3Client.send(command);
		return true;
	} catch (error) {
		return false;
	}
}

