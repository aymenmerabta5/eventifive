"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { client } from "@/utils/orpc";
import { QUERY_KEY_PREFIX, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../constants";
import { calculateEventStats } from "../utils";
import type {
  EventType,
  SortBy,
  EventCardData,
  UseEventsByTypeReturn,
} from "../types";

export function useEventsByType(eventType: EventType): UseEventsByTypeReturn {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch events function
  const fetchEvents = useCallback(
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      const result = await client.events.listByType({
        eventType,
        page: pageParam,
        limit: PAGE_SIZE,
        search: debouncedSearchTerm || undefined,
        sortBy,
      });
      return result;
    },
    [eventType, debouncedSearchTerm, sortBy],
  );

  // Infinite query
  const {
    data,
    error,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY_PREFIX, eventType, debouncedSearchTerm, sortBy],
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
  const events: EventCardData[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Calculate stats
  const stats = useMemo(() => calculateEventStats(events), [events]);

  // Clear search handler
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    // Data
    events,
    stats,

    // States
    isPending: status === "pending",
    isError: status === "error",
    error: error instanceof Error ? error : null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,

    // Search/Filter
    searchTerm,
    debouncedSearchTerm,
    sortBy,
    showFilters,

    // Handlers
    setSearchTerm,
    setSortBy,
    setShowFilters,
    clearSearch,

    // Infinite scroll ref
    loadMoreRef,
  };
}
