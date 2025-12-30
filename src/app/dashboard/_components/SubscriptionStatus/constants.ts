import type { SubscriptionStatusType } from "./types";

// Query keys for React Query cache
export const QUERY_KEY = ["subscription-status"] as const;

// Status styling maps - using color palette variables
export const STATUS_STYLES: Record<SubscriptionStatusType, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-border",
};

// Max features to show
export const MAX_FEATURES_DISPLAYED = 3;
