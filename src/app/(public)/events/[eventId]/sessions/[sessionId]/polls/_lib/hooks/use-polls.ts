"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type { Poll } from "../types";
import { POLLS_QUERY_KEY } from "./use-poll-subscription";

export { POLLS_QUERY_KEY };

export function usePolls(sessionId: string | null) {
  return useQuery({
    queryKey: sessionId ? POLLS_QUERY_KEY(sessionId) : ["polls", "disabled"],
    queryFn: async () => {
      if (!sessionId) return { polls: [], isSessionManager: false };
      const response = await client.websocketsRouter.polls.list({
        sessionId,
        includeResults: true,
      });
      return {
        polls: response.polls as Poll[],
        isSessionManager: response.isSessionManager,
      };
    },
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
