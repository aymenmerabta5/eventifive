import type { EventReadiness, SpeakerInvite, ReviewerInvite } from "./types";
import { REQUIRED_REVIEWERS } from "./constants";

/**
 * Convert a Date to datetime-local input value (for new events)
 */
export function toDateTimeLocalInputValue(date: Date): string {
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * Convert a Date/string to datetime-local input (for existing events)
 */
export function toDateTimeLocalInput(value?: Date | string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/**
 * Get the minimum datetime for date inputs (now)
 */
export function getNowMinDateTime(): string {
  return toDateTimeLocalInputValue(new Date());
}

/**
 * Add N days to a datetime-local input value ("YYYY-MM-DDTHH:mm") and return a new datetime-local value.
 * Returns empty string if the input value is not a valid datetime-local value.
 */
export function addDaysToDateTimeLocalInputValue(value: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return "";

  const yyyy = Number(match[1]);
  const mm = Number(match[2]);
  const dd = Number(match[3]);
  const hh = Number(match[4]);
  const min = Number(match[5]);

  const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  if (Number.isNaN(date.getTime())) return "";

  date.setDate(date.getDate() + days);
  return toDateTimeLocalInputValue(date);
}

/**
 * Check if an event is ready to start based on speaker and reviewer acceptance
 */
export function checkEventReadiness(
  speaker: SpeakerInvite | null,
  reviewers: ReviewerInvite[]
): EventReadiness {
  const hasSpeaker = speaker !== null;
  const speakerAccepted = speaker?.status === "accepted";
  const reviewerCount = reviewers.length;
  const reviewersAccepted = reviewers.filter((r) => r.status === "accepted").length;
  const isReady = speakerAccepted && reviewersAccepted === REQUIRED_REVIEWERS;

  return {
    hasSpeaker,
    speakerAccepted,
    reviewerCount,
    reviewersAccepted,
    isReady,
  };
}

/**
 * Get status badge variant based on invite status
 */
export function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
    default:
      return "secondary";
  }
}
