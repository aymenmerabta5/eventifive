import { z } from "zod";

// ---------------------------
// ADMIN DASHBOARD STATS SCHEMAS
// ---------------------------
export const adminDashboardStatsOutputSchema = z.object({
  totalUsers: z.number(),
  usersChange: z.number(), // % change from previous period
  totalEvents: z.number(),
  eventsChange: z.number(), // % change from previous period
  totalRevenue: z.number(),
  totalRevenueChange: z.number(), // % change from previous period
  activeSubscriptions: z.number(),
  subscriptionsChange: z.number(), // % change from previous period
  currency: z.string().default("DZD"),
});

export type AdminDashboardStatsOutput = z.infer<
  typeof adminDashboardStatsOutputSchema
>;
