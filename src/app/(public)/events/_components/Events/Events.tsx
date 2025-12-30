"use client";

import { useMemo } from "react";
import { useEvents } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  EventsHeader,
} from "./components";
import EventRow from "../EventRow";

export function Events() {
  const {
    events,
    activeRows,
    isEmpty,
    isPending,
    error,
    isRefetching,
    handleRefresh,
  } = useEvents();

  // Calculate stats for the header
  const stats = useMemo(() => {
    const allEvents = [
      ...events.congress,
      ...events.seminar,
      ...events.workshop,
      ...events.scientific_meeting,
      ...events.conference,
      ...events.symposium,
    ];

    const now = new Date();
    let liveCount = 0;
    let upcomingCount = 0;

    for (const event of allEvents) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      if (now >= startDate && now <= endDate) {
        liveCount++;
      } else if (now < startDate) {
        upcomingCount++;
      }
    }

    return {
      totalEvents: allEvents.length,
      liveCount,
      upcomingCount,
    };
  }, [events]);

  // Loading state - ALWAYS handle first
  if (isPending) {
    return <LoadingState />;
  }

  // Error state - Handle before rendering content
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        isRetrying={isRefetching}
      />
    );
  }

  // Empty state - no events at all
  if (isEmpty) {
    return <EmptyState />;
  }

  // Main content
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <EventsHeader
        totalEvents={stats.totalEvents}
        liveCount={stats.liveCount}
        upcomingCount={stats.upcomingCount}
      />

      {/* Event Sections */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col gap-16">
          {activeRows.map((row) => (
            <EventRow
              key={row.key}
              events={events[row.key]}
              title={row.title}
              description={row.description}
              route={row.route}
              eventType={row.key}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
