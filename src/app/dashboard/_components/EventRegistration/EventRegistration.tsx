"use client";

import { useEventRegistration } from "./hooks";
import {
  LoadingState,
  ErrorState,
  RegistrationHeader,
  RegistrationTabs,
} from "./components";

interface EventRegistrationProps {
  eventId: string;
}

export function EventRegistration({ eventId }: EventRegistrationProps) {
  const {
    event,
    participants,
    workshopProposals,
    communicatorSubmissions,
    isPending,
    isRefetching,
    isParticipantsLoading,
    isSubmissionsLoading,
    isWorkshopProposalsLoading,
    isAcceptingProposal,
    isRejectingProposal,
    error,
    handleRefresh,
    handleBack,
    handleAcceptProposal,
    handleRejectProposal,
  } = useEventRegistration({ eventId });

  // Loading state - ALWAYS handle first
  if (isPending) {
    return (
      <div className="space-y-6">
        <RegistrationHeader
          onRefresh={handleRefresh}
          onBack={handleBack}
          isRefetching={false}
        />
        <LoadingState />
      </div>
    );
  }

  // Error state - Handle before rendering content
  if (error) {
    return (
      <div className="space-y-6">
        <RegistrationHeader
          onRefresh={handleRefresh}
          onBack={handleBack}
          isRefetching={isRefetching}
        />
        <ErrorState
          error={error}
          onRetry={handleRefresh}
          isRetrying={isRefetching}
        />
      </div>
    );
  }

  // Main content (removed isEmpty check - CertificatesTab has its own data source
  // and individual tabs handle their own empty states)
  return (
    <div className="space-y-6">
      <RegistrationHeader
        onRefresh={handleRefresh}
        onBack={handleBack}
        isRefetching={isRefetching}
      />

      <RegistrationTabs
        eventId={eventId}
        eventStartDate={event?.startDate}
        eventEndDate={event?.endDate}
        participants={participants}
        communicatorSubmissions={communicatorSubmissions}
        workshopProposals={workshopProposals}
        isParticipantsLoading={isParticipantsLoading}
        isSubmissionsLoading={isSubmissionsLoading}
        isWorkshopProposalsLoading={isWorkshopProposalsLoading}
        onAcceptProposal={handleAcceptProposal}
        onRejectProposal={handleRejectProposal}
        isAcceptingProposal={isAcceptingProposal}
        isRejectingProposal={isRejectingProposal}
      />
    </div>
  );
}
