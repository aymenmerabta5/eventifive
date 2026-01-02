"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

export function useSubscriptionStatus() {
  // Get session for admin check
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.isAdmin ?? false;

  // Data fetching
  const {
    data: subscription,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery(
    orpc.subscription.getUserSubscription.queryOptions({
      input: {},
    }),
  );

  // Derived data
  const hasSubscription = !!subscription;

  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    return Math.ceil(
      (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
  }, [subscription]);

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    // Data
    subscription,
    hasSubscription,
    daysRemaining,
    isAdmin,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
  };
}
