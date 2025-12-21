import { getStatsRouter } from "./getStats";
import { getChartDataRouter } from "./getChartData";

export const organizerDashboardRouter = {
  getStats: getStatsRouter,
  getChartData: getChartDataRouter,
};

export { getStatsRouter, getChartDataRouter };
