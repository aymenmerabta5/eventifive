import type { EventType } from "@/server/db/schema";
import { eventTypeValues } from "@/server/db/schema";

export const eventTypeLabels: Record<EventType, string> = {
  congress: "Congress",
  seminar: "Seminar",
  workshop: "Workshop",
  scientific_meeting: "Scientific Meeting",
  conference: "Conference",
  symposium: "Symposium",
};

export const eventTypeOptions = eventTypeValues.map((value) => ({
  value,
  label: eventTypeLabels[value],
}));

export const WIZARD_STEPS = [
  { key: "details", label: "Event details", description: "Info + images" },
  { key: "invites", label: "Invite people", description: "Speaker + reviewers + committee" },
  { key: "review", label: "Review", description: "Status + readiness" },
] as const;

// Business rules
export const MAX_SPEAKERS = 1;
export const REQUIRED_REVIEWERS = 3;
