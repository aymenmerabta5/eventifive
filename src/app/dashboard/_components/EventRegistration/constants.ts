import type { ReviewStatus, PaymentStatus, SubmissionStatus } from "./types";

export const MAX_REVIEWERS = 3;

export const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
	pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
	accepted: "border-green-600/60 text-green-700 bg-green-500/10",
	rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

export const SUBMISSION_STATUS_STYLES: Record<SubmissionStatus, string> = {
	draft: "border-amber-500/50 text-amber-600 bg-amber-500/10",
	accepted: "border-green-600/60 text-green-700 bg-green-500/10",
	rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
	unpaid: "border-amber-500/50 text-amber-600 bg-amber-500/10",
	pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
	paid: "border-green-600/60 text-green-700 bg-green-500/10",
	failed: "border-destructive/60 text-destructive bg-destructive/10",
	refunded: "border-blue-500/50 text-blue-600 bg-blue-500/10",
};
