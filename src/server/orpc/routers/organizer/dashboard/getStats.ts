import { protectedProcedure } from "../../../index";
import { dashboardStatsOutputSchema } from "@/lib/schemas/dashboard";
import {
  cache,
  CACHE_TTL,
  getDashboardStatsKey,
} from "@/server/cache";
import {
  getTotalRevenue,
  getRevenueInRange,
  getTotalParticipants,
  getParticipantsInRange,
  getTotalEvents,
  getEventsInRange,
  getTotalSubmissions,
  getSubmissionsInRange,
  calculatePercentageChange,
} from "./queries";
import type { DashboardStatsOutput } from "@/lib/schemas/dashboard";

export const getStatsRouter = protectedProcedure
  .route({ method: "GET", path: "/organizer/dashboard/stats" })
  .output(dashboardStatsOutputSchema)
  .handler(async ({ context }) => {
    const { session } = context;
    const userId = session.user.id;

    // Check cache first
    const cacheKey = getDashboardStatsKey(userId);
    const cached = await cache.get<DashboardStatsOutput>(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate date ranges for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Fetch all stats in parallel
    const [
      totalRevenue,
      previousRevenue,
      totalParticipants,
      previousParticipants,
      totalEvents,
      previousEvents,
      totalSubmissions,
      previousSubmissions,
    ] = await Promise.all([
      getTotalRevenue(userId),
      getRevenueInRange(userId, sixtyDaysAgo, thirtyDaysAgo),
      getTotalParticipants(userId),
      getParticipantsInRange(userId, sixtyDaysAgo, thirtyDaysAgo),
      getTotalEvents(userId),
      getEventsInRange(userId, sixtyDaysAgo, thirtyDaysAgo),
      getTotalSubmissions(userId),
      getSubmissionsInRange(userId, sixtyDaysAgo, thirtyDaysAgo),
    ]);

    // Get current period values for change calculation
    const [
      currentRevenue,
      currentParticipants,
      currentEvents,
      currentSubmissions,
    ] = await Promise.all([
      getRevenueInRange(userId, thirtyDaysAgo, now),
      getParticipantsInRange(userId, thirtyDaysAgo, now),
      getEventsInRange(userId, thirtyDaysAgo, now),
      getSubmissionsInRange(userId, thirtyDaysAgo, now),
    ]);

    const stats: DashboardStatsOutput = {
      totalRevenue,
      totalRevenueChange: calculatePercentageChange(
        currentRevenue,
        previousRevenue
      ),
      totalParticipants,
      participantsChange: calculatePercentageChange(
        currentParticipants,
        previousParticipants
      ),
      totalEvents,
      eventsChange: calculatePercentageChange(currentEvents, previousEvents),
      totalSubmissions,
      submissionsChange: calculatePercentageChange(
        currentSubmissions,
        previousSubmissions
      ),
      currency: "DZD",
    };

    // Cache the result
    await cache.set(cacheKey, stats, CACHE_TTL.DASHBOARD_STATS);

    return stats;
  });
