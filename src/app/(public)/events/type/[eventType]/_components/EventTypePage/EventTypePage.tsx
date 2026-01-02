"use client";

import { useEventsByType } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  TypeHeroSection,
  SearchFilterBar,
  EventsGrid,
  LoadMoreTrigger,
} from "./components";
import type { EventType } from "./types";

interface EventTypePageProps {
  eventType: EventType;
}

export function EventTypePage({ eventType }: EventTypePageProps) {
  const {
    // Data
    events,
    stats,
    // States
    isPending,
    isError,
    error,
    hasNextPage,
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
  } = useEventsByType(eventType);

  // Loading state
  if (isPending) {
    return <LoadingState eventType={eventType} />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  const hasEvents = events.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <TypeHeroSection eventType={eventType} stats={stats} />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          debouncedSearchTerm={debouncedSearchTerm}
          sortBy={sortBy}
          showFilters={showFilters}
          totalCount={stats.totalCount}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearSearch={clearSearch}
        />

        {/* Events Grid or Empty State */}
        {hasEvents ? (
          <>
            <EventsGrid events={events} />

            {/* Load More Trigger */}
            <LoadMoreTrigger
              eventType={eventType}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              eventsCount={events.length}
              loadMoreRef={loadMoreRef}
            />
          </>
        ) : (
          <EmptyState
            eventType={eventType}
            hasSearch={!!debouncedSearchTerm}
            onClear={clearSearch}
          />
        )}
      </div>
    </div>
  );
}
