"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { client } from "@/utils/orpc";
import EventCard from "../../_components/EventCard";

function formatEventTypeTitle(eventType: string): string {
  return eventType
    .replace("-", " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function EventTypePageClient({
  eventType,
  eventTypeParam,
}: {
  eventType:
    | "congress"
    | "seminar"
    | "workshop"
    | "scientific_meeting"
    | "conference"
    | "symposium";
  eventTypeParam: string;
}) {
  const fetchEvents = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const result = await client.listEventsByTypeRouter({
      eventType,
      page: pageParam,
      limit: 9,
    });
    return result;
  };

  const { data, error, status, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["events", eventType],
      queryFn: fetchEvents,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (status === "pending") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">Failed to load events</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <h1 className="text-foreground mb-3 bg-linear-to-r bg-clip-text text-5xl font-bold md:text-5xl">
            {formatEventTypeTitle(eventTypeParam)}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Discover and join our exciting{" "}
            {formatEventTypeTitle(eventTypeParam).toLowerCase()} events.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {data.pages.map((page) => {
            return (
              <div
                key={page.currentPage}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {page.data.map((event) => {
                  return <EventCard key={event.id} event={event} />;
                })}
              </div>
            );
          })}
          <div ref={ref} className="py-4 text-center">
            {isFetchingNextPage && (
              <div className="text-muted-foreground">
                Loading more events...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
