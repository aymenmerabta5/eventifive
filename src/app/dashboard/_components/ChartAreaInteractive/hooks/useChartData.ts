"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { QUERY_KEY_BASE, STALE_TIME } from "../constants";
import type { ChartData, TimeRange } from "../types";

export function useChartData(range: TimeRange) {
  const { data, isPending, error } = useQuery<ChartData>({
    queryKey: [QUERY_KEY_BASE, range],
    queryFn: () =>
      client.dashboard.getChartData({ range }) as Promise<ChartData>,
    staleTime: STALE_TIME,
  });

  return {
    chartData: data ?? [],
    isPending,
    error,
  };
}
