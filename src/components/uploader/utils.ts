/**
 * Creates a unique key for a file based on its name, size, and last modified time.
 */
export function getFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Formats file size in bytes to a human-readable MB string.
 */
export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
