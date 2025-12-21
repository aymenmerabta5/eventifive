"use client";

import { useInvites } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  CommitteeSection,
  SpeakerSection,
  ReviewerSection,
} from "./components";

export function Invites() {
  const {
    invites,
    isEmpty,
    isPending,
    error,
    isRefetching,
    isMutating,
    handleRefresh,
    handleAcceptSpeaker,
    handleRejectSpeaker,
    handleAcceptReviewer,
    handleRejectReviewer,
  } = useInvites();

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

  // Empty state - all sections are empty
  if (isEmpty) {
    return <EmptyState />;
  }

  // Main content
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Your invites</h1>

      <CommitteeSection assignments={invites.committeeAssignments} />

      <SpeakerSection
        invites={invites.speakerInvites}
        onAccept={handleAcceptSpeaker}
        onReject={handleRejectSpeaker}
        isDisabled={isMutating}
      />

      <ReviewerSection
        invites={invites.reviewerInvites}
        onAccept={handleAcceptReviewer}
        onReject={handleRejectReviewer}
        isDisabled={isMutating}
      />
    </div>
  );
}
