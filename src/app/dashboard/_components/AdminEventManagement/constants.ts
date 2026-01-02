export const QUERY_KEYS = {
  adminEvents: ["/admin/events"],
  adminEventsPaginated: ["admin-events-paginated"],
};

export const LABELS = {
  title: "Platform Events",
};

// Pagination
export const PAGE_SIZE = 10;

// Debounce delay for search (ms)
export const SEARCH_DEBOUNCE_MS = 500;

// Event type labels
export const EVENT_TYPE_LABELS: Record<string, string> = {
  congress: "Congress",
  seminar: "Seminar",
  workshop: "Workshop",
  scientific_meeting: "Scientific Meeting",
  conference: "Conference",
  symposium: "Symposium",
};
