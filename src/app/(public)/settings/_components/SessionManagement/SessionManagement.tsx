"use client";

import { useSessionManagement } from "./hooks";
import {
  LoadingState,
  ErrorState,
  SessionsHeader,
  SessionCard,
  SignOutAllSection,
  RevokeSessionDialog,
} from "./components";

export function SessionManagement() {
  const {
    sessions,
    sortedSessions,
    otherSessionsCount,
    selectedSession,
    dialogOpen,
    dialogVariant,
    isRevoking,
    isPending,
    error,
    isRefetching,
    handleRefresh,
    handleRevokeClick,
    handleRevokeAllClick,
    handleRevokeConfirm,
    handleDialogOpenChange,
  } = useSessionManagement();

  // Loading state - ALWAYS handle first
  if (isPending) {
    return <LoadingState />;
  }

  // Error state - Handle before rendering content
  if (error) {
    return <ErrorState onRetry={handleRefresh} isRetrying={isRefetching} />;
  }

  // Main content
  return (
    <div className="space-y-6">
      <SessionsHeader sessionCount={sessions.length} />

      {/* Sessions List */}
      <div className="space-y-3">
        {sortedSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={handleRevokeClick}
          />
        ))}
      </div>

      {/* Sign Out All Section */}
      <SignOutAllSection
        otherSessionsCount={otherSessionsCount}
        onSignOutAll={handleRevokeAllClick}
      />

      {/* Single Session Helper */}
      {otherSessionsCount === 0 && sessions.length === 1 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          You&apos;re only signed in on this device
        </p>
      )}

      {/* Revoke Dialog */}
      <RevokeSessionDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        session={selectedSession}
        variant={dialogVariant}
        isRevoking={isRevoking}
        onConfirm={handleRevokeConfirm}
        otherSessionsCount={otherSessionsCount}
      />
    </div>
  );
}
