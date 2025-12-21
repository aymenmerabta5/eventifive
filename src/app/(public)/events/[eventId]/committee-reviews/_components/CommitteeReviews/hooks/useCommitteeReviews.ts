"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import type { AssignedSubmission } from "../types";

interface UseCommitteeReviewsProps {
  eventId: string;
  eventType: string;
}

export function useCommitteeReviews({
  eventId,
  eventType,
}: UseCommitteeReviewsProps) {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  // Data fetching
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    ...orpc.submissions.listAssigned.queryOptions({
      input: { eventId },
    }),
    enabled: isAuthenticated,
  });

  // Derived data
  const submissions: AssignedSubmission[] = useMemo(
    () => data?.submissions ?? [],
    [data?.submissions],
  );

  const isEmpty = submissions.length === 0;

  // Type slug for routing
  const typeSlug = useMemo(() => eventType.replaceAll("_", "-"), [eventType]);

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    // Session
    isAuthenticated,

    // Data
    submissions,
    isEmpty,
    typeSlug,
    eventId,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
  };
}
