"use client";

import { useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { computeFinalDecision } from "../utils";
import type {
  CommunicatorSubmission,
  Participant,
  ReviewStatus,
  RegistrationStats,
  WorkshopProposal,
} from "../types";

interface UseEventRegistrationProps {
  eventId: string;
}

export function useEventRegistration({ eventId }: UseEventRegistrationProps) {
  const router = useRouter();

  // Fetch event details to get date range
  const eventQuery = useQuery({
    ...orpc.events.get.queryOptions({
      input: { id: eventId },
    }),
  });

  const registrationsQuery = useQuery({
    ...orpc.submissions.listForOrganizer.queryOptions({
      input: { eventId },
    }),
  });

  const participantsQuery = useQuery({
    ...orpc.events.listParticipants.queryOptions({
      input: { eventId },
    }),
  });

  // Fetch workshop proposals from the workshops API
  const workshopProposalsQuery = useQuery({
    ...orpc.workshops.listProposals.queryOptions({
      input: { eventId },
    }),
  });

  // Combine errors
  const error =
    eventQuery.error ||
    registrationsQuery.error ||
    participantsQuery.error ||
    workshopProposalsQuery.error;

  const updateStatusMutation = useMutation(
    orpc.submissions.updateStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Updated submission status");
        registrationsQuery.refetch();
      },
      onError: (error) => {
        console.error("Failed to update status:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update status",
        );
      },
    }),
  );

  // Workshop proposal mutations
  const acceptProposalMutation = useMutation(
    orpc.workshops.accept.mutationOptions({
      onSuccess: () => {
        toast.success("Workshop proposal accepted");
        workshopProposalsQuery.refetch();
      },
      onError: (error) => {
        console.error("Failed to accept proposal:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to accept proposal",
        );
      },
    }),
  );

  const rejectProposalMutation = useMutation(
    orpc.workshops.reject.mutationOptions({
      onSuccess: () => {
        toast.success("Workshop proposal rejected");
        workshopProposalsQuery.refetch();
      },
      onError: (error) => {
        console.error("Failed to reject proposal:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to reject proposal",
        );
      },
    }),
  );

  const submissions = registrationsQuery.data?.submissions ?? [];
  const participants: Participant[] =
    participantsQuery.data?.participants ?? [];

  // Workshop proposals from dedicated workshops API
  const workshopProposals: WorkshopProposal[] = useMemo(
    () => workshopProposalsQuery.data?.proposals ?? [],
    [workshopProposalsQuery.data?.proposals],
  );

  // Communicator submissions (all submissions are communicator submissions now)
  const communicatorSubmissions: CommunicatorSubmission[] = useMemo(
    () => submissions,
    [submissions],
  );

  const stats: RegistrationStats = useMemo(() => {
    const participantStats = {
      total: participants.length,
      paid: participants.filter((p) => p.paymentStatus === "paid").length,
      unpaid: participants.filter((p) => p.paymentStatus === "unpaid").length,
      pending: participants.filter((p) => p.paymentStatus === "pending").length,
    };

    const communicatorStats = {
      total: communicatorSubmissions.length,
      reviewed: communicatorSubmissions.filter((s) => {
        const decision = computeFinalDecision(
          s.reviewers.map((r) => ({
            reviewStatus: r.reviewStatus as ReviewStatus,
          })),
        );
        return decision.finalStatus !== "pending";
      }).length,
      pending: communicatorSubmissions.filter((s) => {
        const decision = computeFinalDecision(
          s.reviewers.map((r) => ({
            reviewStatus: r.reviewStatus as ReviewStatus,
          })),
        );
        return decision.finalStatus === "pending";
      }).length,
    };

    const workshopStats = {
      total: workshopProposals.length,
      accepted: workshopProposals.filter((p) => p.proposalStatus === "accepted")
        .length,
      rejected: workshopProposals.filter((p) => p.proposalStatus === "rejected")
        .length,
      pending: workshopProposals.filter((p) => p.proposalStatus === "pending")
        .length,
    };

    return {
      participants: participantStats,
      communicator: communicatorStats,
      workshop: workshopStats,
    };
  }, [participants, communicatorSubmissions, workshopProposals]);

  const isRefetching =
    eventQuery.isRefetching ||
    registrationsQuery.isRefetching ||
    participantsQuery.isRefetching ||
    workshopProposalsQuery.isRefetching;
  const isPending =
    eventQuery.isPending ||
    registrationsQuery.isPending ||
    participantsQuery.isPending ||
    workshopProposalsQuery.isPending;
  const isEmpty =
    participants.length === 0 &&
    submissions.length === 0 &&
    workshopProposals.length === 0;

  const handleRefresh = useCallback(() => {
    void eventQuery.refetch();
    void registrationsQuery.refetch();
    void participantsQuery.refetch();
    void workshopProposalsQuery.refetch();
  }, [eventQuery, registrationsQuery, participantsQuery, workshopProposalsQuery]);

  const handleBack = useCallback(() => {
    router.push("/dashboard?view=my-events");
  }, [router]);

  // Workshop proposal handlers
  const handleAcceptProposal = useCallback(
    (workshopId: string, startAt?: string, endAt?: string) => {
      acceptProposalMutation.mutate({
        workshopId,
        startAt,
        endAt,
      });
    },
    [acceptProposalMutation],
  );

  const handleRejectProposal = useCallback(
    (workshopId: string, reason: string) => {
      rejectProposalMutation.mutate({
        workshopId,
        reason,
      });
    },
    [rejectProposalMutation],
  );

  return {
    // Data
    event: eventQuery.data,
    participants,
    workshopProposals,
    communicatorSubmissions,
    stats,
    isEmpty,

    // Loading states
    isPending,
    isRefetching,
    isParticipantsLoading: participantsQuery.isPending,
    isSubmissionsLoading: registrationsQuery.isPending,
    isWorkshopProposalsLoading: workshopProposalsQuery.isPending,
    isAcceptingProposal: acceptProposalMutation.isPending,
    isRejectingProposal: rejectProposalMutation.isPending,

    // Error
    error,

    // Handlers
    handleRefresh,
    handleBack,
    handleAcceptProposal,
    handleRejectProposal,
  };
}
