import { z } from "zod";

// ---------------------------
// DASHBOARD STATS SCHEMAS
// ---------------------------
export const dashboardStatsOutputSchema = z.object({
  totalRevenue: z.number(),
  totalRevenueChange: z.number(), // % change from previous period
  totalParticipants: z.number(),
  participantsChange: z.number(), // % change from previous period
  totalEvents: z.number(),
  eventsChange: z.number(), // % change from previous period
  totalSubmissions: z.number(),
  submissionsChange: z.number(), // % change from previous period
  currency: z.string().default("DZD"),
});
export type DashboardStatsOutput = z.infer<typeof dashboardStatsOutputSchema>;

// ---------------------------
// CHART DATA SCHEMAS
// ---------------------------
export const chartRangeSchema = z.enum(["7d", "30d", "90d"]);
export type ChartRange = z.infer<typeof chartRangeSchema>;

export const chartDataInputSchema = z.object({
  range: chartRangeSchema.default("30d"),
});
export type ChartDataInput = z.infer<typeof chartDataInputSchema>;

export const chartDataPointSchema = z.object({
  date: z.string(), // ISO date string (YYYY-MM-DD)
  registrations: z.number(),
  revenue: z.number(),
});
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;

export const chartDataOutputSchema = z.array(chartDataPointSchema);
export type ChartDataOutput = z.infer<typeof chartDataOutputSchema>;
