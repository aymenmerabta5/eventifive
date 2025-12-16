/**
 * Shared types and utilities for event registration components.
 * 
 * WHY THIS FILE EXISTS:
 * - Centralizes type definitions used across multiple tab components
 * - Avoids code duplication and ensures consistency
 * - Makes it easy to update shared logic in one place
 */

export type ReviewStatus = "pending" | "accepted" | "rejected";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

/**
 * Style mappings for different statuses.
 * Using Tailwind classes with semantic colors for consistency.
 */
export const reviewStatusStyles: Record<ReviewStatus, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  accepted: "border-green-600/60 text-green-700 bg-green-500/10",
  rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

export const submissionStatusStyles: Record<"draft" | "accepted" | "rejected", string> = {
  draft: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  accepted: "border-green-600/60 text-green-700 bg-green-500/10",
  rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

export const paymentStatusStyles: Record<PaymentStatus, string> = {
  unpaid: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  paid: "border-green-600/60 text-green-700 bg-green-500/10",
  failed: "border-destructive/60 text-destructive bg-destructive/10",
  refunded: "border-blue-500/50 text-blue-600 bg-blue-500/10",
};

export const MAX_REVIEWERS = 3;

/**
 * Type for reviewer-like objects used in decision computation.
 * Nullable to handle empty reviewer slots.
 */
export type ReviewerLike = {
  reviewStatus: ReviewStatus;
} | null;

/**
 * Computes the final decision based on reviewer votes.
 * 
 * BUSINESS LOGIC:
 * - 2+ accepts = accepted (majority rule)
 * - Any pending = still pending (wait for all reviews)
 * - Otherwise = rejected
 */
export const computeFinalDecision = (reviewers: ReviewerLike[]) => {
  const acceptedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "accepted",
  ).length;
  const rejectedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "rejected",
  ).length;
  const pendingCount = reviewers.length - acceptedCount - rejectedCount;

  const finalStatus: ReviewStatus =
    acceptedCount >= 2
      ? "accepted"
      : pendingCount > 0
        ? "pending"
        : "rejected";

  return { acceptedCount, rejectedCount, pendingCount, finalStatus };
};

/**
 * Determines if a submission is a workshop application.
 * Checks both keywords and title for workshop-related content.
 */
export const isWorkshopSubmission = (keywords?: string | null, title?: string | null) => {
  if (!keywords && !title) return false;
  const normalizedKeywords = keywords?.toLowerCase() ?? "";
  const normalizedTitle = title?.toLowerCase() ?? "";
  return (
    normalizedKeywords.includes("workshop") ||
    normalizedTitle.startsWith("workshop application")
  );
};

/**
 * Generates initials from a name string.
 * Useful for avatar fallbacks.
 */
export const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ============================================
// Shared Types for Tab Components
// ============================================

export type WorkshopSubmission = {
  id: string;
  title: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submittedAt: Date | null;
  fileCount: number;
  status: "draft" | "accepted" | "rejected";
  abstract: string | null;
  keywords: string | null;
};

export type SubmissionFile = {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  purpose: string | null;
};

export type CommitteeSubmission = {
  id: string;
  title: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submittedAt: Date | null;
  fileCount: number;
  status: "draft" | "accepted" | "rejected";
  abstract: string | null;
  keywords: string | null;
  reviewers: Array<{
    reviewerName: string | null;
    reviewerEmail: string | null;
    reviewStatus: string;
    inviteStatus: string | null;
    assignedAt: Date | null;
    reviewedAt: Date | null;
  }>;
};

export type Participant = {
  id: number;
  userId: string;
  userName: string | null;
  userEmail: string;
  roleAtEvent: string;
  paymentStatus: PaymentStatus;
  registeredAt: Date;
};

