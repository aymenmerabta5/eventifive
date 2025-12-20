// File upload limits
export const MAX_FILES = 3;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Accepted file types
export const ACCEPTED_FILE_TYPES = [
	".pdf",
	".doc",
	".docx",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_FILE_TYPES_STRING = ACCEPTED_FILE_TYPES.join(",");
