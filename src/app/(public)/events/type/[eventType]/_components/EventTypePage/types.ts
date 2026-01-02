import type { Event } from "@/server/db/schema";
import type { IconBuildingBank } from "@tabler/icons-react";

// Event card data type (from API response)
export type EventCardData = Pick<
  Event,
  | "id"
  | "title"
  | "type"
  | "startDate"
  | "endDate"
  | "location"
  | "smallDescription"
> & {
  imageUrl?: string | null;
};

// Event type enum matching database
export type EventType =
  | "congress"
  | "seminar"
  | "workshop"
  | "scientific_meeting"
  | "conference"
  | "symposium";

// Event status derived from dates
export type EventStatus = "live" | "upcoming" | "ended";

// Sort options
export type SortBy = "newest" | "oldest" | "title_asc" | "title_desc";

// Type configuration for styling
export interface TypeConfig {
  icon: typeof IconBuildingBank;
  label: string;
  description: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  iconBg: string;
}

// Status configuration for badges
export interface StatusConfig {
  label: string;
  className: string;
  dotClassName?: string;
}

// Stats calculated from events
export interface EventStats {
  totalCount: number;
  liveCount: number;
}

// Page API response
export interface EventPageResponse {
  data: EventCardData[];
  currentPage: number;
  nextPage: number | null;
}

// Search filter state
export interface SearchFilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  sortBy: SortBy;
  showFilters: boolean;
}

// Hook return type
export interface UseEventsByTypeReturn {
  // Data
  events: EventCardData[];
  stats: EventStats;

  // States
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;

  // Search/Filter
  searchTerm: string;
  debouncedSearchTerm: string;
  sortBy: SortBy;
  showFilters: boolean;

  // Handlers
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: SortBy) => void;
  setShowFilters: (show: boolean) => void;
  clearSearch: () => void;

  // Infinite scroll ref
  loadMoreRef: (node?: Element | null) => void;
}
