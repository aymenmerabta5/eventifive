import type { Event } from "@/server/db/schema";

export type AdminEvent = Event & { imageUrl: string | null };

export type EventStatus = "Upcoming" | "Completed";

export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
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
}
