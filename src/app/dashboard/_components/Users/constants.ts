export const QUERY_KEY = ["admin-users"] as const;

export const STALE_TIME = 1000 * 60; // 1 minute

export const ROLE_LABELS: Record<"super_admin" | "organizer" | "user", string> = {
  super_admin: "Super Admin",
  organizer: "Organizer",
  user: "User",
};

