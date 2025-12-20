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
