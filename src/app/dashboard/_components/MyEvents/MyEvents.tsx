"use client";

import { useMyEvents } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  EventsHeader,
  EventStatsCards,
  EventsTable,
  DeleteEventDialog,
} from "./components";

export function MyEvents() {
  const {
    events,
    stats,
    eventToDelete,
    isPending,
    error,
    isRefetching,
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleApprovals,
    handleShare,
  } = useMyEvents();

  if (isPending) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        isRetrying={isRefetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <EventsHeader onRefresh={handleRefresh} isRefetching={isRefetching} />

      <EventStatsCards stats={stats} />

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <EventsTable
          events={events}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onApprovals={handleApprovals}
          onShare={handleShare}
        />
      )}

      <DeleteEventDialog
        event={eventToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
