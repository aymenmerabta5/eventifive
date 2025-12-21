import type { EventType } from "@/server/db/schema";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  congress: "Congress",
  seminar: "Seminar",
  workshop: "Workshop",
  scientific_meeting: "Scientific Meeting",
  conference: "Conference",
  symposium: "Symposium",
};

export const QUERY_KEY = ["my-events"] as const;

export const STALE_TIME = 1000 * 60; // 1 minute
