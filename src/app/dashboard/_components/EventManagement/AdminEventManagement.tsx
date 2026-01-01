"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { EventsTable } from "./components/EventsTable";
import EventsHeader from "./components/EventsHeader";
import EventStatsCards from "./components/EventStatsCards";
import DeleteEventDialog from "./components/DeleteEventDialog";
import CancelEventDialog from "./components/CancelEventDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Inline types for this admin page
import type { AdminEvent, EventStats } from "./types";

export default function AdminEventManagement() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery(
    orpc.events.adminList.queryOptions({ input: {} }),
  );

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation(
    orpc.events.adminDelete.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted");
        void queryClient.invalidateQueries({ queryKey: ["/admin/events"] });
        void queryClient.invalidateQueries({ queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete event");
      },
    }),
  );

  const events = data?.events ?? [];

  // Fetch organizer profiles for all unique organizer IDs in the events list
  const organizerIds = Array.from(new Set(events.map((e) => e.organizerId)));

  const organizerQueries = useQueries({
    queries: organizerIds.map((id) =>
      orpc.profile.get.queryOptions({ input: { userId: id } }),
    ),
  });

  const organizerMap = Object.fromEntries(
    organizerQueries.map((q, i) => {
      const id = organizerIds[i];
      const name = q.data?.name as string | undefined;
      return [id, name];
    }),
  );

  // Enrich events with organizerName for display
  const enrichedEvents = events.map((e) => ({
    ...e,
    organizerName: organizerMap[e.organizerId] ?? undefined,
  }));

  // Dialog state
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
  const [eventToCancel, setEventToCancel] = useState<AdminEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey });
  };

  // Only delete handler is needed
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
    // Placeholder: call cancel endpoint if exists
    try {
      // Example: await orpc.events.adminCancel.mutateAsync({ eventId: eventToCancel.id })
      toast.success("Event cancelled (placeholder)");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel event");
    } finally {
      setIsCancelling(false);
      setEventToCancel(null);
    }
  };

  const handleCancelCancelDialog = () => setEventToCancel(null);

  const now = Date.now();
  const stats: EventStats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.startDate).getTime() > now).length,
    past: events.filter((e) => new Date(e.endDate).getTime() < now).length,
    draft: events.filter((e) => e.status === "draft").length,
    published: events.filter((e) => e.status === "published").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <EventsHeader onRefresh={handleRefresh} isRefetching={isFetching} />

      <EventStatsCards stats={stats} />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <EventsTable
          events={enrichedEvents as unknown as AdminEvent[]}
          showOrganizer
          deleteOnly
          onDelete={onDelete}
          onApprovals={() => {}}
          onShare={() => {}}
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
