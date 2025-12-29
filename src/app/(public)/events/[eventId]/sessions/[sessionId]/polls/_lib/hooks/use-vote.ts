"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { POLLS_QUERY_KEY } from "./use-poll-subscription";
import type { Poll, PollsData } from "../types";
import { toast } from "sonner";

interface VoteParams {
  pollId: string;
  sessionId: string;
  optionIds: number[];
  currentUserId: string;
  previousVoteOptionIds?: number[];
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pollId,
      sessionId,
      optionIds,
      currentUserId,
      previousVoteOptionIds,
    }: VoteParams) => {
      // Optimistic update for user votes
      queryClient.setQueryData<PollsData>(
        POLLS_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            polls: old.polls.map((p) => {
              if (p.id !== pollId) return p;

              // Calculate new vote counts optimistically
              const previousOptionIds = previousVoteOptionIds ?? [];
              const newOptions = p.options.map((opt) => {
                let voteCount = opt.voteCount ?? 0;
                // Decrement if was previously selected
                if (previousOptionIds.includes(opt.id)) voteCount--;
                // Increment if newly selected
                if (optionIds.includes(opt.id)) voteCount++;
                return { ...opt, voteCount: Math.max(0, voteCount) };
              });

              // Calculate total votes change
              const wasVoted = previousOptionIds.length > 0;
              const isVoted = optionIds.length > 0;
              let totalVotes = p.totalVotes ?? 0;
              if (!wasVoted && isVoted) totalVotes++;
              if (wasVoted && !isVoted) totalVotes--;

              // Recalculate percentages
              const totalIndividualVotes = newOptions.reduce(
                (sum, o) => sum + (o.voteCount ?? 0),
                0
              );
              const optionsWithPercentage = newOptions.map((opt) => ({
                ...opt,
                percentage:
                  totalIndividualVotes > 0
                    ? Math.round(
                        ((opt.voteCount ?? 0) / totalIndividualVotes) * 100
                      )
                    : 0,
              }));

              return {
                ...p,
                options: optionsWithPercentage,
                totalVotes,
                userVotedOptionIds: optionIds,
              };
            }),
          };
        }
      );

      // Make the actual API call
      const response = await client.websocketsRouter.polls.vote({
        pollId,
        optionIds,
      });

      return response;
    },
    onError: (error, variables) => {
      // Rollback optimistic updates on error
      queryClient.invalidateQueries({
        queryKey: POLLS_QUERY_KEY(variables.sessionId),
      });
      toast.error("Failed to submit vote. Please try again.");
    },
  });
}
