"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { QUERY_KEY } from "../constants";
import type { InvitesData } from "../types";

export function useInvites() {
  // Data fetching
  const { data, isPending, error, refetch, isRefetching } = useQuery(
    orpc.events.listMyInvites.queryOptions(),
  );

  // Mutations
  const { mutate: acceptSpeaker, isPending: isAcceptingSpeaker } = useMutation(
    orpc.events.acceptSpeaker.mutationOptions({
      onSuccess: async () => {
        await refetch();
        toast.success("Speaker invite accepted");
      },
      onError: (e: Error) =>
        toast.error(e.message || "Failed to accept speaker invite"),
    }),
  );

  const { mutate: rejectSpeaker, isPending: isRejectingSpeaker } = useMutation(
    orpc.events.rejectSpeaker.mutationOptions({
      onSuccess: async () => {
        await refetch();
        toast.success("Speaker invite rejected");
      },
      onError: (e: Error) =>
        toast.error(e.message || "Failed to reject speaker invite"),
    }),
  );

  const { mutate: acceptReviewer, isPending: isAcceptingReviewer } =
    useMutation(
      orpc.events.acceptReviewer.mutationOptions({
        onSuccess: async () => {
          await refetch();
          toast.success("Reviewer invite accepted");
        },
        onError: (e: Error) =>
          toast.error(e.message || "Failed to accept reviewer invite"),
      }),
    );

  const { mutate: rejectReviewer, isPending: isRejectingReviewer } =
    useMutation(
      orpc.events.rejectReviewer.mutationOptions({
        onSuccess: async () => {
          await refetch();
          toast.success("Reviewer invite rejected");
        },
        onError: (e: Error) =>
          toast.error(e.message || "Failed to reject reviewer invite"),
      }),
    );

  // Derived data
  const invites: InvitesData = useMemo(
    () => ({
      committeeAssignments: data?.committeeAssignments ?? [],
      speakerInvites: data?.speakerInvites ?? [],
      reviewerInvites: data?.reviewerInvites ?? [],
    }),
    [data],
  );

  const isEmpty = useMemo(
    () =>
      invites.committeeAssignments.length === 0 &&
      invites.speakerInvites.length === 0 &&
      invites.reviewerInvites.length === 0,
    [invites],
  );

  // Loading state for any mutation
  const isMutating =
    isAcceptingSpeaker ||
    isRejectingSpeaker ||
    isAcceptingReviewer ||
    isRejectingReviewer;

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleAcceptSpeaker = useCallback(
    (eventId: string) => {
      acceptSpeaker({ eventId });
    },
    [acceptSpeaker],
  );

  const handleRejectSpeaker = useCallback(
    (eventId: string) => {
      rejectSpeaker({ eventId });
    },
    [rejectSpeaker],
  );

  const handleAcceptReviewer = useCallback(
    (eventId: string) => {
      acceptReviewer({ eventId });
    },
    [acceptReviewer],
  );

  const handleRejectReviewer = useCallback(
    (eventId: string) => {
      rejectReviewer({ eventId });
    },
    [rejectReviewer],
  );

  return {
    // Data
    invites,
    isEmpty,

    // Loading states
    isPending,
    error,
    isRefetching,
    isMutating,

    // Handlers
    handleRefresh,
    handleAcceptSpeaker,
    handleRejectSpeaker,
    handleAcceptReviewer,
    handleRejectReviewer,
  };
}
