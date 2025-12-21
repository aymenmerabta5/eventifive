"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc, client } from "@/utils/orpc";
import { QUERY_KEY, STALE_TIME } from "../constants";
import { getEventStatus } from "../utils";
import type { AdminEvent, MyEventsData, EventStats } from "../types";

export function useMyEvents() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);

  const { data, isPending, error, refetch, isRefetching } =
    useQuery<MyEventsData>({
      queryKey: QUERY_KEY,
      queryFn: () => client.events.myEvents() as Promise<MyEventsData>,
      staleTime: STALE_TIME,
    });

  const { mutate: deleteEvent } = useMutation(
    orpc.events.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete event");
      },
    }),
  );

  const events = useMemo(() => data?.events ?? [], [data?.events]);

  const stats: EventStats = useMemo(() => {
    const upcoming = events.filter(
      (event) => getEventStatus(event) === "Upcoming",
    ).length;
    return {
      total: data?.total ?? 0,
      upcoming,
      past: events.length - upcoming,
    };
  }, [events, data?.total]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleUpdate = useCallback(
    (event: AdminEvent) => {
      const params = new URLSearchParams({
        view: "update-event",
        eventId: event.id,
      });
      router.push(`/dashboard?${params.toString()}`);
    },
    [router],
  );

  const handleDelete = useCallback((event: AdminEvent) => {
    setEventToDelete(event);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!eventToDelete) return;
    deleteEvent({ eventId: eventToDelete.id });
    setEventToDelete(null);
  }, [eventToDelete, deleteEvent]);

  const handleCancelDelete = useCallback(() => {
    setEventToDelete(null);
  }, []);

  const handleApprovals = useCallback(
    (event: AdminEvent) => {
      const params = new URLSearchParams({
        view: "event-approvals",
        eventId: event.id,
      });
      router.push(`/dashboard?${params.toString()}`);
    },
    [router],
  );

  const handleShare = useCallback(
    (event: AdminEvent) => {
      const params = new URLSearchParams({
        view: "share-event",
        eventId: event.id,
      });
      router.push(`/dashboard?${params.toString()}`);
    },
    [router],
  );

  return {
    // Data
    events,
    stats,
    eventToDelete,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleApprovals,
    handleShare,
  };
}
