// Re-export shared utilities from centralized libs
export { formatDateLong, formatTimeRange12h } from "@/lib/date";
export { cn } from "@/lib/utils";

import type { EventStatus, EventCardData, EventStats } from "./types";

/**
 * Determine event status based on start and end dates
 */
export function getEventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  if (now >= startDate && now <= endDate) return "live";
  if (now < startDate) return "upcoming";
  return "ended";
}

/**
 * Calculate stats from a list of events
 */
export function calculateEventStats(events: EventCardData[]): EventStats {
  const now = new Date();
  let liveCount = 0;

  for (const event of events) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (now >= start && now <= end) {
      liveCount++;
    }
  }

  return {
    totalCount: events.length,
    liveCount,
  };
}

/**
 * Check if an event is currently live
 */
export function isEventLive(event: EventCardData): boolean {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return now >= start && now <= end;
}

/**
 * Check if an event has ended
 */
export function isEventEnded(event: EventCardData): boolean {
  const now = new Date();
  const end = new Date(event.endDate);
  return now > end;
}
