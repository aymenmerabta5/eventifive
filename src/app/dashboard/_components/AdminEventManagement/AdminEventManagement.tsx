"use client";

import React, { useState } from "react";
import { useAdminEvents } from "./hooks";
import { EventsTable } from "./components/EventsTable";
import EventsHeader from "./components/EventsHeader";
import EventStatsCards from "./components/EventStatsCards";
import DeleteEventDialog from "./components/DeleteEventDialog";
import CancelEventDialog from "./components/CancelEventDialog";
import { SearchBar } from "./components/SearchBar";
import { AdminLoadMoreTrigger } from "./components/AdminLoadMoreTrigger";
import { LoadingState } from "./components/LoadingState";
import { toast } from "sonner";
import type { AdminEvent } from "./types";

export default function AdminEventManagement() {
  const {
    events,
    stats,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    handleRefresh,
    deleteEvent,
    loadMoreRef,
  } = useAdminEvents();

  // Dialog state
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
  const [eventToCancel, setEventToCancel] = useState<AdminEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const onDelete = (e: AdminEvent) => setEventToDelete(e);

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent({ eventId: eventToDelete.id });
    setEventToDelete(null);
  };

  const handleCancelDelete = () => setEventToDelete(null);

  const handleConfirmCancel = async () => {
    if (!eventToCancel) return;
    setIsCancelling(true);
    try {
      toast.success("Event cancelled (placeholder)");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel event";
      toast.error(message);
    } finally {
      setIsCancelling(false);
      setEventToCancel(null);
    }
  };

  const handleCancelCancelDialog = () => setEventToCancel(null);

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="py-12 text-center">
          <p className="text-destructive">
            Failed to load events: {error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={handleRefresh}
            className="text-primary mt-4 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <EventsHeader />

      <EventStatsCards stats={stats} />

      <SearchBar
        searchTerm={searchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        totalCount={events.length}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        placeholder="Search events by title, description, or location..."
      />

      {events.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {debouncedSearchTerm
              ? `No events found matching "${debouncedSearchTerm}"`
              : "No events found"}
          </p>
        </div>
      ) : (
        <>
          <EventsTable
            events={events}
            showOrganizer
            deleteOnly
            onDelete={onDelete}
            onApprovals={() => {}}
            onShare={() => {}}
          />

          <AdminLoadMoreTrigger
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            eventsCount={events.length}
            loadMoreRef={loadMoreRef}
          />
        </>
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
