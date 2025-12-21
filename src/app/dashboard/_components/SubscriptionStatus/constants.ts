import type { SubscriptionStatusType } from "./types";

// Query keys for React Query cache
export const QUERY_KEY = ["subscription-status"] as const;

// Status styling maps
export const STATUS_STYLES: Record<SubscriptionStatusType, string> = {
  active: "bg-green-500/10 text-green-600 border-green-200",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
  expired: "bg-gray-500/10 text-gray-600 border-gray-200",
};

// Max features to show
export const MAX_FEATURES_DISPLAYED = 3;
