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
        message={
          errorMessage ||
          "The submission you're looking for doesn't exist or you don't have access to it."
        }
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute top-1/3 left-1/4 h-64 w-64 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <ReviewHeader
            eventId={eventId}
            isReadOnly={isReadOnly}
            submitterName={user?.name}
          />

          <div className="mt-10 space-y-6 sm:mt-12 sm:space-y-8">
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
      </div>
    </div>
  );
}
