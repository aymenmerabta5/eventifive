import type { EventReadiness, SpeakerInvite, ReviewerInvite } from "./types";
import { REQUIRED_REVIEWERS } from "./constants";

// Re-export datetime-local utilities from centralized location for backwards compatibility
export {
  toDateTimeLocalInputValue,
  toDateTimeLocalInput,
  getNowMinDateTime,
  addDaysToDateTimeLocalInputValue,
} from "@/lib/date";

/**
 * Check if an event is ready to start based on speaker and reviewer acceptance
 * Event is ready when at least one speaker has accepted and all reviewers have accepted
 */
export function checkEventReadiness(
  speakers: SpeakerInvite[],
  reviewers: ReviewerInvite[],
): EventReadiness {
  const speakerCount = speakers.length;
  const speakersAccepted = speakers.filter(
    (s) => s.status === "accepted",
  ).length;
  const reviewerCount = reviewers.length;
  const reviewersAccepted = reviewers.filter(
    (r) => r.status === "accepted",
  ).length;
  // Event is ready when at least one speaker has accepted and all reviewers have accepted
  const isReady =
    speakersAccepted >= 1 && reviewersAccepted === REQUIRED_REVIEWERS;

  return {
    speakerCount,
    speakersAccepted,
    reviewerCount,
    reviewersAccepted,
    isReady,
  };
}

/**
 * Get status badge variant based on invite status
 */
export function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
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
