export const QUERY_KEY = ["admin-users"] as const;
export const QUERY_KEY_PAGINATED = ["admin-users-paginated"] as const;

export const STALE_TIME = 1000 * 60; // 1 minute

// Pagination
export const PAGE_SIZE = 10;

// Debounce delay for search (ms)
export const SEARCH_DEBOUNCE_MS = 500;

export const ROLE_LABELS: Record<"super_admin" | "organizer" | "user", string> =
  {
    super_admin: "Super Admin",
    organizer: "Organizer",
    user: "User",
  };
