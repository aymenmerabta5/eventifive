import type { ChartDataOutput, ChartRange } from "@/lib/schemas/dashboard";

export type ChartData = ChartDataOutput;
export type TimeRange = ChartRange;

export interface ChartDataPoint {
  date: string;
  registrations: number;
  revenue: number;
}
