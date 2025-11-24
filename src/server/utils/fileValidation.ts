const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
] as const;

const ALLOWED_DOCUMENT_TYPES = ["application/pdf"] as const;

const ALLOWED_FILE_TYPES = [
	...ALLOWED_IMAGE_TYPES,
	...ALLOWED_DOCUMENT_TYPES,
] as const;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

export type FileType = "image" | "document";

export interface FileValidationResult {
	valid: boolean;
	error?: string;
	fileType?: FileType;
}

export function validateFile(
	fileName: string,
	fileSize: number,
	contentType: string,
): FileValidationResult {
	// Validate content type

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!ALLOWED_FILE_TYPES.includes(contentType as any)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed: images (JPEG, PNG, WebP, GIF) and PDF documents`,
		};
	}

	// Determine file type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const fileType: FileType = ALLOWED_IMAGE_TYPES.includes(contentType as any)
		? "image"
		: "document";

	// Validate file size based on type
	const maxSize = fileType === "image" ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
	if (fileSize > maxSize) {
		const maxSizeMB = maxSize / 1024 / 1024;
		return {
			valid: false,
			error: `File too large. Maximum ${fileType} size is ${maxSizeMB}MB`,
		};
	}

	if (fileSize <= 0) {
		return {
			valid: false,
			error: "File is empty",
		};
	}

	// Validate file extension matches content type
	const extension = fileName.split(".").pop()?.toLowerCase();
	if (!extension) {
		return {
			valid: false,
			error: "File has no extension",
		};
	}

	const validExtensions: Record<string, string[]> = {
		"image/jpeg": ["jpg", "jpeg"],
		"image/jpg": ["jpg", "jpeg"],
		"image/png": ["png"],
		"image/webp": ["webp"],
		"image/gif": ["gif"],
		"application/pdf": ["pdf"],
	};

	const allowedExtensions = validExtensions[contentType] || [];
	if (!allowedExtensions.includes(extension)) {
		return {
			valid: false,
			error: `File extension .${extension} does not match content type ${contentType}`,
		};
	}

	return {
		valid: true,
		fileType,
	};
}

export function sanitizeFileName(fileName: string): string {
	// Remove dangerous characters and limit length
	return fileName
		.replace(/[^a-zA-Z0-9._-]/g, "_")
		.replace(/_{2,}/g, "_")
		.slice(0, 200);
}

export function generateS3Key(
	userId: string,
	fileType: FileType,
	fileId: string,
	fileName: string,
): string {
	const sanitized = sanitizeFileName(fileName);
	const folder = fileType === "image" ? "images" : "documents";
	return `${userId}/${folder}/${fileId}-${sanitized}`;
}

