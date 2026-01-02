"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { useMemo } from "react";
import type { AdminEvent, EventStats } from "../types";

export function useEventManagement() {
  const queryClient = useQueryClient();

  const listQuery = useQuery(orpc.events.adminList.queryOptions({ input: {} }));

  const events = listQuery.data?.events ?? [];

  const organizerIds = useMemo(
    () => Array.from(new Set(events.map((e: any) => e.organizerId))),
    [events],
  );

  const organizerQueries = useQueries({
    queries: organizerIds.map((id: string) =>
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

  const enriched = events.map((e: any) => ({
    ...e,
    organizerName: organizerMap[e.organizerId] ?? undefined,
  })) as AdminEvent[];

  const deleteMutation = useMutation(
    orpc.events.adminDelete.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted");
        void queryClient.invalidateQueries({
          queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey,
        });
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to delete event");
      },
    }),
  );

  const stats: EventStats = {
    total: enriched.length,
    upcoming: enriched.filter(
      (e) => new Date(e.startDate).getTime() > Date.now(),
    ).length,
    past: enriched.filter((e) => new Date(e.endDate).getTime() < Date.now())
      .length,
    draft: enriched.filter((e) => e.status === "draft").length,
    published: enriched.filter((e) => e.status === "published").length,
    cancelled: enriched.filter((e) => e.status === "cancelled").length,
  };

  return {
    events: enriched,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    stats,
    deleteEvent: deleteMutation.mutate,
    deleteState: deleteMutation,
    refresh: () =>
      void queryClient.invalidateQueries({
        queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey,
      }),
  };
}
