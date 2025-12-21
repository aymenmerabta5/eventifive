"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { QUERY_KEY, STALE_TIME } from "../constants";
import type { AdminDashboardStats } from "../types";

export function useAdminDashboardStats() {
  const { data, isPending, error } = useQuery<AdminDashboardStats>({
    queryKey: QUERY_KEY,
    queryFn: () =>
      client.admin.dashboard.getStats() as Promise<AdminDashboardStats>,
    staleTime: STALE_TIME,
  });

  return {
    stats: data,
    isPending,
    error,
  };
}
