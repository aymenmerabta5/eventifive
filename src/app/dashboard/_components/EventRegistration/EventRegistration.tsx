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
    participants,
    workshopSubmissions,
    committeeSubmissions,
    isPending,
    isRefetching,
    isParticipantsLoading,
    isSubmissionsLoading,
    isUpdating,
    error,
    handleRefresh,
    handleBack,
    handleAcceptWorkshop,
    handleRejectWorkshop,
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
        participants={participants}
        committeeSubmissions={committeeSubmissions}
        workshopSubmissions={workshopSubmissions}
        isParticipantsLoading={isParticipantsLoading}
        isSubmissionsLoading={isSubmissionsLoading}
        onAcceptWorkshop={handleAcceptWorkshop}
        onRejectWorkshop={handleRejectWorkshop}
        isUpdating={isUpdating}
      />
    </div>
  );
}
