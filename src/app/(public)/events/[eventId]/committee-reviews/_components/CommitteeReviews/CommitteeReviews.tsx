"use client";

import { useCommitteeReviews } from "./hooks";
import {
	LoadingState,
	ErrorState,
	EmptyState,
	AuthRequiredState,
	ReviewsHeader,
	SubmissionCard,
} from "./components";
import type { CommitteeReviewsProps } from "./types";

export function CommitteeReviews({ eventId, eventType }: CommitteeReviewsProps) {
	const {
		isAuthenticated,
		submissions,
		isEmpty,
		typeSlug,
		isPending,
		error,
		isRefetching,
		handleRefresh,
	} = useCommitteeReviews({ eventId, eventType });

	// Auth required state
	if (!isAuthenticated) {
		return <AuthRequiredState />;
	}

	// Loading state - ALWAYS handle first
	if (isPending) {
		return <LoadingState />;
	}

	// Error state - Handle before rendering content
	if (error) {
		return (
			<ErrorState
				error={error}
				onRetry={handleRefresh}
				isRetrying={isRefetching}
			/>
		);
	}

	// Main content
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<div className="w-full max-w-4xl space-y-6">
				<ReviewsHeader />

				{isEmpty ? (
					<EmptyState />
				) : (
					<div className="space-y-4">
						{submissions.map((submission) => (
							<SubmissionCard
								key={submission.id}
								submission={submission}
								typeSlug={typeSlug}
								eventId={eventId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
