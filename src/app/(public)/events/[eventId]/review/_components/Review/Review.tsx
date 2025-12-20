"use client";

import { useReview } from "./hooks";
import {
	LoadingState,
	ErrorState,
	AuthRequiredState,
	ReviewHeader,
	SubmissionDetailsCard,
	ReviewFormCard,
} from "./components";
import type { ReviewProps } from "./types";

export function Review({ eventId, submissionId }: ReviewProps) {
	const {
		user,
		isAuthenticated,
		submission,
		existingReview,
		isReadOnly,
		recommendationToShow,
		rating,
		comments,
		downloadingFileId,
		isPending,
		isRefetching,
		isSubmitting,
		error,
		errorMessage,
		reviewError,
		handleRefresh,
		handleDownload,
		handleRatingChange,
		handleCommentsChange,
		handleSubmitReview,
	} = useReview({ submissionId });

	// Loading state - ALWAYS handle first
	if (isPending) {
		return <LoadingState />;
	}

	// Auth required state
	if (!isAuthenticated) {
		return <AuthRequiredState />;
	}

	// Error state - Handle before rendering content
	if (error || !submission) {
		return (
			<ErrorState
				message={errorMessage || "The submission you're looking for doesn't exist or you don't have access to it."}
				submissionId={submissionId}
				onRetry={handleRefresh}
				isRetrying={isRefetching}
			/>
		);
	}

	// Format submitted date
	const submittedAtText = existingReview?.updatedAt
		? new Date(existingReview.updatedAt).toLocaleString()
		: null;

	// Review error message
	const reviewErrorMessage = reviewError
		? reviewError instanceof Error
			? reviewError.message
			: "Failed to load your review status. Please try again."
		: null;

	// Main content
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<div className="w-full max-w-4xl space-y-8">
				<ReviewHeader />

				<SubmissionDetailsCard
					title={submission.title}
					abstract={submission.abstract}
					files={submission.files ?? []}
					downloadingFileId={downloadingFileId}
					onDownload={handleDownload}
				/>

				<ReviewFormCard
					rating={rating}
					comments={comments}
					isReadOnly={isReadOnly}
					isSubmitting={isSubmitting}
					recommendationToShow={recommendationToShow}
					submittedAt={submittedAtText}
					reviewErrorMessage={reviewErrorMessage}
					onRatingChange={handleRatingChange}
					onCommentsChange={handleCommentsChange}
					onSubmit={handleSubmitReview}
				/>
			</div>
		</div>
	);
}
