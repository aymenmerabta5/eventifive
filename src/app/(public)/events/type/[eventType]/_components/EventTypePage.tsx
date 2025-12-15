"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { client } from "@/utils/orpc";
import EventCard from "../../../_components/EventCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconSearch } from "@tabler/icons-react";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title_asc" | "title_desc">("newest");
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEvents = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const result = await client.events.listByType({
      eventType,
      page: pageParam,
      limit: 9,
      search: debouncedSearchTerm || undefined,
      sortBy,
    });
    return result;
  };

  const { data, error, status, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["events", eventType, debouncedSearchTerm, sortBy],
      queryFn: fetchEvents,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  useEffect(() => {
    if (status === "pending") {
      setShowLoading(true);
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [status]);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (status === "pending" || showLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-10 relative">
          <Link 
            href="/events"
            className="absolute left-0 top-0 inline-flex items-center justify-center rounded-lg border-2 border-border bg-background p-2 text-foreground transition-all duration-200 hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            <IconArrowLeft className="size-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-foreground mb-3 bg-linear-to-r bg-clip-text text-5xl font-bold md:text-5xl">
              {formatEventTypeTitle(eventTypeParam)}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Discover and join our exciting{" "}
              {formatEventTypeTitle(eventTypeParam).toLowerCase()} events.
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="text-muted-foreground absolute left-3 top-1/2 size-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value: "newest" | "oldest" | "title_asc" | "title_desc") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title_asc">Title (A-Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {data.pages.length > 0 && data.pages[0] && data.pages[0].data.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  No events found
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {debouncedSearchTerm
                    ? "Try adjusting your search terms or filters."
                    : "There are no events available at the moment."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
