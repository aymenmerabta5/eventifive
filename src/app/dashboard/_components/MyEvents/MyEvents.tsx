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
  CancelEventDialog,
} from "./components";

export function MyEvents() {
  const {
    events,
    stats,
    eventToDelete,
    eventToCancel,
    isPending,
    error,
    isRefetching,
    isCancelling,
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleApprovals,
    handleShare,
    handlePublish,
    handleUnpublish,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancelDialog,
    handleArchive,
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
      <EventsHeader />

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
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onCancel={handleCancel}
          onArchive={handleArchive}
        />
      )}

      <DeleteEventDialog
        event={eventToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <CancelEventDialog
        event={eventToCancel}
        onClose={handleCancelCancelDialog}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
