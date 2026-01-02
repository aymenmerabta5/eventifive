"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { client, orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { QUERY_KEYS, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../constants";
import type { AdminEvent, EventStats } from "../types";

export function useAdminEvents() {
  const queryClient = useQueryClient();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch events function for infinite query
  const fetchEvents = useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      const result = await client.events.adminListPaginated({
        page: pageParam,
        limit: PAGE_SIZE,
        search: debouncedSearchTerm || undefined,
      });
      return result;
    },
    [debouncedSearchTerm],
  );

  // Infinite query for paginated events
  const {
    data,
    error,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.adminEventsPaginated, debouncedSearchTerm],
    queryFn: fetchEvents,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView();

  // Fetch next page when scrolling into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetchingNextPage]);

  // Flatten all events from pages
  const flatEvents = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Get unique organizer IDs
  const organizerIds = useMemo(
    () => Array.from(new Set(flatEvents.map((e) => e.organizerId))),
    [flatEvents],
  );

  // Fetch organizer profiles
  const organizerQueries = useQueries({
    queries: organizerIds.map((id) =>
      orpc.profile.get.queryOptions({ input: { userId: id } }),
    ),
  });

  const organizerMap = useMemo(() => {
    return Object.fromEntries(
      organizerQueries.map((q, i) => {
        const id = organizerIds[i];
        const name = q.data?.name as string | undefined;
        return [id, name];
      }),
    );
  }, [organizerQueries, organizerIds]);

  // Enrich events with organizer names
  const events: AdminEvent[] = useMemo(
    () =>
      flatEvents.map((e) => ({
        id: e.id,
        title: e.title,
        smallDescription: e.smallDescription,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
        organizerId: e.organizerId,
        status: e.status,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        organizerName: organizerMap[e.organizerId] ?? undefined,
        imageUrl: null,
      })),
    [flatEvents, organizerMap],
  );

  // Get total from first page (stats always show total regardless of search)
  const total = data?.pages[0]?.total ?? 0;

  // Calculate stats from all events (we need to fetch stats separately for accurate counts)
  // For now, using the data we have but noting this is search-filtered
  const stats: EventStats = useMemo(() => {
    const now = Date.now();
    return {
      total: total,
      upcoming: events.filter((e) => new Date(e.startDate).getTime() > now)
        .length,
      past: events.filter((e) => new Date(e.endDate).getTime() < now).length,
      draft: events.filter((e) => e.status === "draft").length,
      published: events.filter((e) => e.status === "published").length,
      cancelled: events.filter((e) => e.status === "cancelled").length,
    };
  }, [events, total]);

  // Delete mutation
  const { mutate: deleteEvent, isPending: isDeleting } = useMutation(
    orpc.events.adminDelete.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted");
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.adminEventsPaginated,
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete event");
      },
    }),
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    // Data
    events,
    stats,
    total,

    // States
    isPending: status === "pending",
    isError: status === "error",
    error: error instanceof Error ? error : null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isRefetching,

    // Search
    searchTerm,
    debouncedSearchTerm,

    // Handlers
    setSearchTerm,
    clearSearch,
    handleRefresh,
    deleteEvent,
    isDeleting,

    // Infinite scroll ref
    loadMoreRef,
  };
}
