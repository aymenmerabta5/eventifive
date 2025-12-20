"use client";

import { useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { isWorkshopSubmission, computeFinalDecision } from "../utils";
import type {
	WorkshopSubmission,
	CommitteeSubmission,
	Participant,
	ReviewStatus,
	RegistrationStats,
} from "../types";

interface UseEventRegistrationProps {
	eventId: string;
}

export function useEventRegistration({ eventId }: UseEventRegistrationProps) {
	const router = useRouter();

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

	// Combine errors
	const error = registrationsQuery.error || participantsQuery.error;

	const updateStatusMutation = useMutation(
		orpc.submissions.updateStatus.mutationOptions({
			onSuccess: () => {
				toast.success("Updated workshop status");
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

	const submissions = registrationsQuery.data?.submissions ?? [];
	const participants: Participant[] = participantsQuery.data?.participants ?? [];

	const workshopSubmissions: WorkshopSubmission[] = useMemo(
		() =>
			submissions.filter((submission) =>
				isWorkshopSubmission(submission.keywords, submission.title),
			),
		[submissions],
	);

	const committeeSubmissions: CommitteeSubmission[] = useMemo(
		() =>
			submissions.filter(
				(submission) => !isWorkshopSubmission(submission.keywords, submission.title),
			),
		[submissions],
	);

	const stats: RegistrationStats = useMemo(() => {
		const participantStats = {
			total: participants.length,
			paid: participants.filter((p) => p.paymentStatus === "paid").length,
			unpaid: participants.filter((p) => p.paymentStatus === "unpaid").length,
			pending: participants.filter((p) => p.paymentStatus === "pending").length,
		};

		const committeeStats = {
			total: committeeSubmissions.length,
			reviewed: committeeSubmissions.filter((s) => {
				const decision = computeFinalDecision(
					s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
				);
				return decision.finalStatus !== "pending";
			}).length,
			pending: committeeSubmissions.filter((s) => {
				const decision = computeFinalDecision(
					s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
				);
				return decision.finalStatus === "pending";
			}).length,
		};

		const workshopStats = {
			total: workshopSubmissions.length,
			accepted: workshopSubmissions.filter((s) => s.status === "accepted").length,
			rejected: workshopSubmissions.filter((s) => s.status === "rejected").length,
			pending: workshopSubmissions.filter((s) => s.status === "draft").length,
		};

		return {
			participants: participantStats,
			committee: committeeStats,
			workshop: workshopStats,
		};
	}, [participants, committeeSubmissions, workshopSubmissions]);

	const isRefetching = registrationsQuery.isRefetching || participantsQuery.isRefetching;
	const isPending = registrationsQuery.isPending || participantsQuery.isPending;
	const isEmpty = participants.length === 0 && submissions.length === 0;

	const handleRefresh = useCallback(() => {
		void registrationsQuery.refetch();
		void participantsQuery.refetch();
	}, [registrationsQuery, participantsQuery]);

	const handleBack = useCallback(() => {
		router.push("/dashboard?view=my-events");
	}, [router]);

	const handleAcceptWorkshop = useCallback(
		(submissionId: string) => {
			updateStatusMutation.mutate({
				submissionId,
				status: "accepted",
			});
		},
		[updateStatusMutation],
	);

	const handleRejectWorkshop = useCallback(
		(submissionId: string) => {
			updateStatusMutation.mutate({
				submissionId,
				status: "rejected",
			});
		},
		[updateStatusMutation],
	);

	return {
		// Data
		participants,
		workshopSubmissions,
		committeeSubmissions,
		stats,
		isEmpty,

		// Loading states
		isPending,
		isRefetching,
		isParticipantsLoading: participantsQuery.isPending,
		isSubmissionsLoading: registrationsQuery.isPending,
		isUpdating: updateStatusMutation.isPending,

		// Error
		error,

		// Handlers
		handleRefresh,
		handleBack,
		handleAcceptWorkshop,
		handleRejectWorkshop,
	};
}
