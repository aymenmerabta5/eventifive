import type { ChartConfig } from "@/components/ui/chart";

export const QUERY_KEY_BASE = "dashboard-chart" as const;
export const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export const chartConfig = {
  metrics: {
    label: "Metrics",
  },
  registrations: {
    label: "Registrations",
    color: "var(--primary)",
  },
  revenue: {
    label: "Revenue (DZD)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const TIME_RANGE_LABELS = {
  "90d": "Last 3 months",
  "30d": "Last 30 days",
  "7d": "Last 7 days",
} as const;
