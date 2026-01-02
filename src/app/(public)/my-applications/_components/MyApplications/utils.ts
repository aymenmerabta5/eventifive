// Re-export date utilities
export { formatDate } from "@/lib/date";

/**
 * Format submission type for display
 * e.g., "displayed_paper" -> "Displayed Paper"
 */
export const formatSubmissionType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
