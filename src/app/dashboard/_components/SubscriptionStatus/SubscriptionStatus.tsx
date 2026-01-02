"use client";

import { useSubscriptionStatus } from "./hooks";
import {
  LoadingState,
  ErrorState,
  FreePlanState,
  ActiveSubscriptionCard,
} from "./components";
import type { SubscriptionData } from "./types";

export function SubscriptionStatus() {
  const {
    subscription,
    hasSubscription,
    daysRemaining,
    isAdmin,
    isPending,
    error,
    isRefetching,
    handleRefresh,
  } = useSubscriptionStatus();

  // Loading state - ALWAYS handle first
  if (isPending) {
    return <LoadingState />;
  }

  // Error state - Handle before rendering content
  if (error) {
    return <ErrorState onRetry={handleRefresh} isRetrying={isRefetching} />;
  }

  // Free plan state (no subscription)
  if (!hasSubscription) {
    return <FreePlanState />;
  }

  // Active subscription
  return (
    <ActiveSubscriptionCard
      subscription={subscription as SubscriptionData}
      daysRemaining={daysRemaining}
      isAdmin={isAdmin}
    />
  );
}
