import type { AdminEvent } from "./types";

export * from "@/lib/utils";

export type EventDisplayStatus =
  | "Draft"
  | "Published"
  | "Cancelled"
  | "Archived"
  | "Upcoming"
  | "Live"
  | "Completed";

// Re-export date utilities from centralized location
export { formatDate, formatDateTime, formatSchedule } from "@/lib/date";

/**
 * Get the display status for an event.
 * Database status takes precedence, then date-based status for published events.
 */
export const getEventDisplayStatus = (
  event: AdminEvent,
): EventDisplayStatus => {
  if (event.status === "draft") return "Draft";
  if (event.status === "cancelled") return "Cancelled";
  if (event.status === "archived") return "Archived";

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

// Returns Tailwind classes for a given badge variant
export function getStatusStyles(variant: string): string {
  switch (variant) {
    case "default":
      return "bg-primary/10 text-primary border-primary/30";
    case "secondary":
      return "bg-secondary text-secondary-foreground border-secondary";
    case "destructive":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "outline":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-secondary text-secondary-foreground border-secondary";
  }
}
