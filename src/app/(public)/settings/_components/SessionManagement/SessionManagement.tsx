"use client";

import { useSessionManagement } from "./hooks";
import {
  LoadingState,
  ErrorState,
  SessionsHeader,
  SessionCard,
  SignOutAllSection,
  RevokeSessionDrawer,
} from "./components";

export function SessionManagement() {
  const {
    sessions,
    sortedSessions,
    otherSessionsCount,
    selectedSession,
    drawerOpen,
    drawerVariant,
    isRevoking,
    isPending,
    error,
    isRefetching,
    handleRefresh,
    handleRevokeClick,
    handleRevokeAllClick,
    handleRevokeConfirm,
    handleDrawerOpenChange,
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

      {/* Revoke Drawer */}
      <RevokeSessionDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        session={selectedSession}
        variant={drawerVariant}
        isRevoking={isRevoking}
        onConfirm={handleRevokeConfirm}
        otherSessionsCount={otherSessionsCount}
      />
    </div>
  );
}
