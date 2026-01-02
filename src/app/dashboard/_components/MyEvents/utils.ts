import type { AdminEvent, EventDisplayStatus } from "./types";

// Re-export date utilities from centralized location for backwards compatibility
export { formatDate, formatDateTime, formatSchedule } from "@/lib/date";

/**
 * Get the display status for an event.
 * Database status takes precedence, then date-based status for published events.
 */
export const getEventDisplayStatus = (
  event: AdminEvent,
): EventDisplayStatus => {
  // Database status takes precedence
  if (event.status === "draft") return "Draft";
  if (event.status === "cancelled") return "Cancelled";
  if (event.status === "archived") return "Archived";

  // For published events, check date-based status
  const now = Date.now();
  const startTime = new Date(event.startDate).getTime();
  const endTime = new Date(event.endDate).getTime();

  if (now < startTime) return "Upcoming";
  if (now >= startTime && now <= endTime) return "Live";
  return "Completed";
};

/**
 * Get badge variant for event status
 */
export const getStatusBadgeVariant = (
  status: EventDisplayStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Draft":
      return "secondary";
    case "Published":
    case "Upcoming":
      return "default";
    case "Live":
      return "default";
    case "Completed":
      return "outline";
    case "Cancelled":
      return "destructive";
    case "Archived":
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Check if an event can be published
 */
export const canPublish = (event: AdminEvent): boolean => {
  if (event.status !== "draft") return false;
  const now = new Date();
  return event.endDate >= now;
};

/**
 * Check if an event can be unpublished
 */
export const canUnpublish = (event: AdminEvent): boolean => {
  return event.status === "published";
};

/**
 * Check if an event can be cancelled
 */
export const canCancel = (event: AdminEvent): boolean => {
  return event.status === "draft" || event.status === "published";
};

/**
 * Check if an event can be archived
 */
export const canArchive = (event: AdminEvent): boolean => {
  if (event.status === "archived") return false;
  if (event.status === "cancelled") return true;
  // Can archive completed events
  const now = new Date();
  return event.endDate < now;
};

// Keep old function for backwards compatibility
export const getEventStatus = (event: AdminEvent): "Upcoming" | "Completed" => {
  const now = Date.now();
  const endTime = new Date(event.endDate).getTime();
  return endTime >= now ? "Upcoming" : "Completed";
};
