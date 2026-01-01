"use client";

import { useCommunicatorReviews } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  AuthRequiredState,
  ReviewsHeader,
  SubmissionCard,
} from "./components";
import type { CommunicatorReviewsProps } from "./types";

export function CommunicatorReviews({ eventId }: CommunicatorReviewsProps) {
  const {
    isAuthenticated,
    submissions,
    isEmpty,
    isPending,
    error,
    isRefetching,
    handleRefresh,
  } = useCommunicatorReviews({ eventId });

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <ReviewsHeader submissionCount={submissions.length} />

          <div className="mt-10 sm:mt-12">
            {isEmpty ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:gap-5">
                {submissions.map((submission, index) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    eventId={eventId}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Backwards compatibility alias
export { CommunicatorReviews as CommitteeReviews };
