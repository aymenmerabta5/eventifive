import { getStatsRouter } from "./getStats";
import { getChartDataRouter } from "./getChartData";

export const dashboardRouter = {
  getStats: getStatsRouter,
  getChartData: getChartDataRouter,
};

export { getStatsRouter, getChartDataRouter };
