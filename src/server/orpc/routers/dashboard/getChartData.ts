import { protectedProcedure } from "../../index";
import {
  chartDataInputSchema,
  chartDataOutputSchema,
} from "@/lib/schemas/dashboard";
import {
  cache,
  CACHE_TTL,
  getDashboardChartKey,
} from "@/server/cache";
import { getTimeSeriesData } from "./queries";
import type { ChartDataOutput } from "@/lib/schemas/dashboard";

const RANGE_TO_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const getChartDataRouter = protectedProcedure
  .route({ method: "GET", path: "/dashboard/chart" })
  .input(chartDataInputSchema)
  .output(chartDataOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const range = input.range;

    // Check cache first
    const cacheKey = getDashboardChartKey(userId, range);
    const cached = await cache.get<ChartDataOutput>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get time series data
    const days = RANGE_TO_DAYS[range] ?? 30;
    const data = await getTimeSeriesData(userId, days);

    // Cache the result
    await cache.set(cacheKey, data, CACHE_TTL.DASHBOARD_CHART);

    return data;
  });
