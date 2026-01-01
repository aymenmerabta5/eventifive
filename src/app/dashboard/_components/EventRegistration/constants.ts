import type {
  ReviewStatus,
  PaymentStatus,
  SubmissionStatus,
  WorkshopProposalStatus,
} from "./types";

export const MAX_REVIEWERS = 3;

export const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  accepted: "border-primary/50 text-primary bg-primary/10",
  rejected: "border-destructive/50 text-destructive bg-destructive/10",
};

export const SUBMISSION_STATUS_STYLES: Record<SubmissionStatus, string> = {
  draft: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  accepted: "border-primary/50 text-primary bg-primary/10",
  rejected: "border-destructive/50 text-destructive bg-destructive/10",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  unpaid: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  pending: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  paid: "border-primary/50 text-primary bg-primary/10",
  failed: "border-destructive/50 text-destructive bg-destructive/10",
  refunded: "border-chart-2/50 text-chart-2 bg-chart-2/10",
};

export const WORKSHOP_PROPOSAL_STATUS_STYLES: Record<
  WorkshopProposalStatus,
  string
> = {
  pending: "border-chart-4/50 text-chart-4 bg-chart-4/10",
  accepted: "border-primary/50 text-primary bg-primary/10",
  rejected: "border-destructive/50 text-destructive bg-destructive/10",
};
