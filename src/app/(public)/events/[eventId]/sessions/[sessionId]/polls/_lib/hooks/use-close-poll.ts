"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { POLLS_QUERY_KEY } from "./use-poll-subscription";
import type { PollsData } from "../types";
import { toast } from "sonner";

interface ClosePollParams {
  pollId: string;
  sessionId: string;
}

export function useClosePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId }: ClosePollParams) => {
      const response = await client.websocketsRouter.polls.close({ pollId });
      return response;
    },
    onMutate: async ({ pollId, sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: POLLS_QUERY_KEY(sessionId) });

      // Snapshot the previous value
      const previousPolls = queryClient.getQueryData(
        POLLS_QUERY_KEY(sessionId),
      );

      // Optimistically update
      queryClient.setQueryData<PollsData>(POLLS_QUERY_KEY(sessionId), (old) => {
        if (!old) return old;
        return {
          ...old,
          polls: old.polls.map((p) =>
            p.id === pollId
              ? { ...p, isActive: false, closedAt: new Date() }
              : p,
          ),
        };
      });

      return { previousPolls };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPolls) {
        queryClient.setQueryData(
          POLLS_QUERY_KEY(variables.sessionId),
          context.previousPolls,
        );
      }
      toast.error("Failed to close poll. Please try again.");
    },
    onSuccess: () => {
      toast.success("Poll closed!");
    },
  });
}
