import type { Event, EventStatus as DBEventStatus } from "@/server/db/schema";

export type AdminEvent = Event & { imageUrl: string | null };

// Display status combines database status with date-based computation
export type EventDisplayStatus =
  | "Draft"
  | "Published"
  | "Cancelled"
  | "Archived"
  | "Completed"
  | "Upcoming"
  | "Live";

// Re-export database status type
export type { DBEventStatus };

export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
  draft: number;
  published: number;
  cancelled: number;
}

export interface MyEventsData {
  events: AdminEvent[];
  total: number;
}

export interface EventActionHandlers {
  onUpdate: (event: AdminEvent) => void;
  onDelete: (event: AdminEvent) => void;
  onApprovals: (event: AdminEvent) => void;
  onShare: (event: AdminEvent) => void;
  onPublish?: (event: AdminEvent) => void;
  onUnpublish?: (event: AdminEvent) => void;
  onCancel?: (event: AdminEvent) => void;
  onArchive?: (event: AdminEvent) => void;
}
