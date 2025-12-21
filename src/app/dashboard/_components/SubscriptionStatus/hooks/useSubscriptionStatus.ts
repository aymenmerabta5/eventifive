"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { QUERY_KEY } from "../constants";

export function useSubscriptionStatus() {
  // Data fetching
  const {
    data: subscription,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery(
    orpc.subscription.getCurrent.queryOptions({
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

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
  };
}
