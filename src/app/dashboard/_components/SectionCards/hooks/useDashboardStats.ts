"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { QUERY_KEY, STALE_TIME } from "../constants";
import type { DashboardStats } from "../types";

export function useDashboardStats() {
  const { data, isPending, error } = useQuery<DashboardStats>({
    queryKey: QUERY_KEY,
    queryFn: () => client.dashboard.getStats() as Promise<DashboardStats>,
    staleTime: STALE_TIME,
  });

  return {
    stats: data,
    isPending,
    error,
  };
}
