import type { InviteStatus } from "./types";

// Query keys for React Query cache
export const QUERY_KEY = ["my-invites"] as const;

// Status styling maps
export const STATUS_STYLES: Record<InviteStatus, string> = {
	pending: "border-border",
	accepted: "border-green-500 bg-green-50 dark:bg-green-900/20",
	rejected: "border-red-500 bg-red-50 dark:bg-red-900/20",
};

// Status labels
export const STATUS_LABELS: Record<InviteStatus, string> = {
	pending: "Pending",
	accepted: "Accepted",
	rejected: "Rejected",
};
