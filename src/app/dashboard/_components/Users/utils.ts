import { formatDistanceToNow } from "date-fns";
import type { UserWithRole } from "./types";

/**
 * Formats a date as a relative time string (e.g., "2 days ago")
 * This utility helps display user registration dates and last seen times
 * in a human-readable format, making it easier to understand user activity
 * 
 * Returns "Never" if the date is null or undefined, which is appropriate
 * for optional fields like lastSeenAt
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "Never";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Gets the badge variant for a user role
 * This helps visually distinguish between different user roles in the UI
 * using consistent color coding
 */
export function getRoleBadgeVariant(
  role: UserWithRole["role"],
): "default" | "secondary" | "outline" {
  switch (role) {
    case "super_admin":
      return "default";
    case "organizer":
      return "secondary";
    case "user":
      return "outline";
    default:
      return "outline";
  }
}

/**
 * Gets the initial letter for avatar display
 * Extracts the first letter of the user's name for use in avatar circles
 */
export function getUserInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

