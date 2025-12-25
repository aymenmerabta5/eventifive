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
  const [eventToCancel, setEventToCancel] = useState<AdminEvent | null>(null);

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

  const { mutate: publishEvent, isPending: isPublishing } = useMutation(
    orpc.events.publish.mutationOptions({
      onSuccess: () => {
        toast.success("Event published successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to publish event");
      },
    }),
  );

  const { mutate: unpublishEvent, isPending: isUnpublishing } = useMutation(
    orpc.events.unpublish.mutationOptions({
      onSuccess: () => {
        toast.success("Event unpublished successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to unpublish event");
      },
    }),
  );

  const { mutate: cancelEvent, isPending: isCancelling } = useMutation(
    orpc.events.cancel.mutationOptions({
      onSuccess: (data) => {
        if (data.registrationCount > 0) {
          toast.success(
            `Event cancelled. ${data.registrationCount} registered user(s) should be notified.`,
          );
        } else {
          toast.success("Event cancelled successfully");
        }
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        setEventToCancel(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to cancel event");
      },
    }),
  );

  const { mutate: archiveEvent, isPending: isArchiving } = useMutation(
    orpc.events.archive.mutationOptions({
      onSuccess: () => {
        toast.success("Event archived successfully");
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to archive event");
      },
    }),
  );

  const events = useMemo(() => data?.events ?? [], [data?.events]);

  const stats: EventStats = useMemo(() => {
    const upcoming = events.filter(
      (event) => getEventStatus(event) === "Upcoming",
    ).length;
    const draft = events.filter((event) => event.status === "draft").length;
    const published = events.filter(
      (event) => event.status === "published",
    ).length;
    const cancelled = events.filter(
      (event) => event.status === "cancelled",
    ).length;
    return {
      total: data?.total ?? 0,
      upcoming,
      past: events.length - upcoming,
      draft,
      published,
      cancelled,
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

  // Lifecycle handlers
  const handlePublish = useCallback(
    (event: AdminEvent) => {
      publishEvent({ eventId: event.id });
    },
    [publishEvent],
  );

  const handleUnpublish = useCallback(
    (event: AdminEvent) => {
      unpublishEvent({ eventId: event.id });
    },
    [unpublishEvent],
  );

  const handleCancel = useCallback((event: AdminEvent) => {
    setEventToCancel(event);
  }, []);

  const handleConfirmCancel = useCallback(
    (reason?: string) => {
      if (!eventToCancel) return;
      cancelEvent({ eventId: eventToCancel.id, reason });
    },
    [eventToCancel, cancelEvent],
  );

  const handleCancelCancelDialog = useCallback(() => {
    setEventToCancel(null);
  }, []);

  const handleArchive = useCallback(
    (event: AdminEvent) => {
      archiveEvent({ eventId: event.id });
    },
    [archiveEvent],
  );

  return {
    // Data
    events,
    stats,
    eventToDelete,
    eventToCancel,

    // Loading states
    isPending,
    error,
    isRefetching,
    isPublishing,
    isUnpublishing,
    isCancelling,
    isArchiving,

    // Handlers
    handleRefresh,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleApprovals,
    handleShare,

    // Lifecycle handlers
    handlePublish,
    handleUnpublish,
    handleCancel,
    handleConfirmCancel,
    handleCancelCancelDialog,
    handleArchive,
  };
}
