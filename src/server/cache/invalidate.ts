import { cache } from "./redis";
import { CACHE_KEYS, getDashboardStatsKey } from "./keys";

/**
 * Invalidate all dashboard cache for an organizer
 */
export async function invalidateDashboardCache(
  organizerId: string,
): Promise<void> {
  await cache.invalidatePattern(`${CACHE_KEYS.DASHBOARD_STATS}:${organizerId}`);
  await cache.invalidatePattern(
    `${CACHE_KEYS.DASHBOARD_CHART}:${organizerId}:*`,
  );
}

/**
 * Invalidate only dashboard stats cache for an organizer
 */
export async function invalidateDashboardStats(
  organizerId: string,
): Promise<void> {
  await cache.del(getDashboardStatsKey(organizerId));
}

/**
 * Invalidate only dashboard chart cache for an organizer
 */
export async function invalidateDashboardChart(
  organizerId: string,
): Promise<void> {
  await cache.invalidatePattern(
    `${CACHE_KEYS.DASHBOARD_CHART}:${organizerId}:*`,
  );
}
