import type { DashboardStatsOutput } from "@/lib/schemas/dashboard";

export type DashboardStats = DashboardStatsOutput;

export interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  description: string;
}
