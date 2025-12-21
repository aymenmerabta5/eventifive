import type { AdminDashboardStatsOutput } from "@/lib/schemas/adminDashboard";

export type AdminDashboardStats = AdminDashboardStatsOutput;

export interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  description: string;
}
