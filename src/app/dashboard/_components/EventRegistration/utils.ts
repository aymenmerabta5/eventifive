import type { ReviewerLike, FinalDecision } from "./types";
import { MAX_REVIEWERS } from "./constants";

/**
 * Computes the final decision based on reviewer votes.
 *
 * BUSINESS LOGIC:
 * - 2+ accepts = accepted (majority rule)
 * - Any pending = still pending (wait for all reviews)
 * - Otherwise = rejected
 */
export const computeFinalDecision = (
  reviewers: ReviewerLike[],
): FinalDecision => {
  const acceptedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "accepted",
  ).length;
  const rejectedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "rejected",
  ).length;
  const pendingCount = reviewers.length - acceptedCount - rejectedCount;

  const finalStatus =
    acceptedCount >= 2 ? "accepted" : pendingCount > 0 ? "pending" : "rejected";

  return {
    acceptedCount,
    rejectedCount,
    pendingCount,
    finalStatus,
  } as FinalDecision;
};

/**
 * Determines if a submission is a workshop application.
 * Checks both keywords and title for workshop-related content.
 */
export const isWorkshopSubmission = (
  keywords?: string | null,
  title?: string | null,
): boolean => {
  if (!keywords && !title) return false;
  const normalizedKeywords = keywords?.toLowerCase() ?? "";
  const normalizedTitle = title?.toLowerCase() ?? "";
  return (
    normalizedKeywords.includes("workshop") ||
    normalizedTitle.startsWith("workshop application")
  );
};

// Re-export getInitials from centralized location for backwards compatibility
export { getInitials } from "@/lib/string";

/**
 * Fills reviewer array with null placeholders up to MAX_REVIEWERS.
 */
export const fillReviewerSlots = <T>(reviewers: T[]): (T | null)[] => {
  return [
    ...reviewers.slice(0, MAX_REVIEWERS),
    ...Array(Math.max(0, MAX_REVIEWERS - reviewers.length)).fill(null),
  ];
};
