import { adminProcedure } from "../../../index";
import { adminDashboardStatsOutputSchema } from "@/lib/schemas/adminDashboard";
import { cache, CACHE_TTL } from "@/server/cache";
import {
  getTotalUsers,
  getUsersInRange,
  getTotalEvents,
  getEventsInRange,
  getTotalRevenue,
  getRevenueInRange,
  getActiveSubscriptions,
  getSubscriptionsInRange,
  calculatePercentageChange,
} from "./queries";
import type { AdminDashboardStatsOutput } from "@/lib/schemas/adminDashboard";

const ADMIN_STATS_CACHE_KEY = "admin:dashboard:stats";

export const getAdminStatsRouter = adminProcedure
  .route({ method: "GET", path: "/admin/dashboard/stats" })
  .output(adminDashboardStatsOutputSchema)
  .handler(async () => {
    // Check cache first
    const cached = await cache.get<AdminDashboardStatsOutput>(
      ADMIN_STATS_CACHE_KEY
    );
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
      totalUsers,
      previousUsers,
      totalEvents,
      previousEvents,
      totalRevenue,
      previousRevenue,
      activeSubscriptions,
      previousSubscriptions,
    ] = await Promise.all([
      getTotalUsers(),
      getUsersInRange(sixtyDaysAgo, thirtyDaysAgo),
      getTotalEvents(),
      getEventsInRange(sixtyDaysAgo, thirtyDaysAgo),
      getTotalRevenue(),
      getRevenueInRange(sixtyDaysAgo, thirtyDaysAgo),
      getActiveSubscriptions(),
      getSubscriptionsInRange(sixtyDaysAgo, thirtyDaysAgo),
    ]);

    // Get current period values for change calculation
    const [currentUsers, currentEvents, currentRevenue, currentSubscriptions] =
      await Promise.all([
        getUsersInRange(thirtyDaysAgo, now),
        getEventsInRange(thirtyDaysAgo, now),
        getRevenueInRange(thirtyDaysAgo, now),
        getSubscriptionsInRange(thirtyDaysAgo, now),
      ]);

    const stats: AdminDashboardStatsOutput = {
      totalUsers,
      usersChange: calculatePercentageChange(currentUsers, previousUsers),
      totalEvents,
      eventsChange: calculatePercentageChange(currentEvents, previousEvents),
      totalRevenue,
      totalRevenueChange: calculatePercentageChange(
        currentRevenue,
        previousRevenue
      ),
      activeSubscriptions,
      subscriptionsChange: calculatePercentageChange(
        currentSubscriptions,
        previousSubscriptions
      ),
      currency: "DZD",
    };

    // Cache the result
    await cache.set(ADMIN_STATS_CACHE_KEY, stats, CACHE_TTL.DASHBOARD_STATS);

    return stats;
  });
