/**
 * Cache key prefixes for dashboard data
 */
export const CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard:stats",
  DASHBOARD_CHART: "dashboard:chart",
} as const;

/**
 * TTL values in seconds
 */
export const CACHE_TTL = {
  DASHBOARD_STATS: 300, // 5 minutes
  DASHBOARD_CHART: 600, // 10 minutes
} as const;

/**
 * Generate a cache key for dashboard stats
 */
export function getDashboardStatsKey(organizerId: string): string {
  return `${CACHE_KEYS.DASHBOARD_STATS}:${organizerId}`;
}

/**
 * Generate a cache key for dashboard chart data
 */
export function getDashboardChartKey(
  organizerId: string,
  range: string
): string {
  return `${CACHE_KEYS.DASHBOARD_CHART}:${organizerId}:${range}`;
}
