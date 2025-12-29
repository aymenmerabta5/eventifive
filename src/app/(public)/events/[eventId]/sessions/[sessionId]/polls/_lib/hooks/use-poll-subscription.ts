"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type {
  Poll,
  PollsData,
  SessionPollEvent,
  PollCreatedEvent,
  PollClosedEvent,
  VoteCastEvent,
  VoteChangedEvent,
} from "../types";

export const POLLS_QUERY_KEY = (sessionId: string) =>
  ["websocketsRouter", "polls", "list", sessionId] as const;

interface UsePollSubscriptionOptions {
  sessionId: string;
  currentUserId: string;
  enabled?: boolean;
}

export function usePollSubscription({
  sessionId,
  currentUserId,
  enabled = true,
}: UsePollSubscriptionOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handlePollCreated = useCallback(
    (event: PollCreatedEvent) => {
      queryClient.setQueryData<PollsData>(
        POLLS_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          // Check if poll already exists
          const exists = old.polls.some((p) => p.id === event.poll.id);
          if (exists) return old;

          // Add new poll at the beginning
          const newPoll: Poll = {
            id: event.poll.id,
            question: event.poll.question,
            pollType: event.poll.pollType,
            isActive: event.poll.isActive,
            createdBy: event.poll.createdBy,
            createdByName: event.poll.createdByName,
            createdAt: event.poll.createdAt,
            closedAt: null,
            options: event.poll.options.map((opt) => ({
              ...opt,
              voteCount: 0,
              percentage: 0,
            })),
            totalVotes: 0,
            userVotedOptionIds: [],
          };

          return {
            ...old,
            polls: [newPoll, ...old.polls],
          };
        }
      );
    },
    [queryClient, sessionId]
  );

  const handlePollClosed = useCallback(
    (event: PollClosedEvent) => {
      queryClient.setQueryData<PollsData>(
        POLLS_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            polls: old.polls.map((p) =>
              p.id === event.pollId
                ? {
                    ...p,
                    isActive: false,
                    closedAt: event.closedAt,
                    totalVotes: event.results.totalVotes,
                    options: p.options.map((opt) => {
                      const resultOpt = event.results.options.find(
                        (r) => r.optionId === opt.id
                      );
                      return resultOpt
                        ? {
                            ...opt,
                            voteCount: resultOpt.voteCount,
                            percentage: resultOpt.percentage,
                          }
                        : opt;
                    }),
                  }
                : p
            ),
          };
        }
      );
    },
    [queryClient, sessionId]
  );

  const handleVoteEvent = useCallback(
    (event: VoteCastEvent | VoteChangedEvent) => {
      queryClient.setQueryData<PollsData>(
        POLLS_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            polls: old.polls.map((p) => {
              if (p.id !== event.pollId) return p;

              return {
                ...p,
                totalVotes: event.results.totalVotes,
                options: p.options.map((opt) => {
                  const resultOpt = event.results.options.find(
                    (r) => r.optionId === opt.id
                  );
                  return resultOpt
                    ? {
                        ...opt,
                        voteCount: resultOpt.voteCount,
                        percentage: resultOpt.percentage,
                      }
                    : opt;
                }),
              };
            }),
          };
        }
      );
    },
    [queryClient, sessionId]
  );

  const handleEvent = useCallback(
    (event: SessionPollEvent) => {
      switch (event.type) {
        case "poll_created":
          handlePollCreated(event);
          break;
        case "poll_closed":
          handlePollClosed(event);
          break;
        case "vote_cast":
        case "vote_changed":
          handleVoteEvent(event);
          break;
      }
    },
    [handlePollCreated, handlePollClosed, handleVoteEvent]
  );

  useEffect(() => {
    if (!enabled || !sessionId || !currentUserId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription = await client.websocketsRouter.polls.subscribe({
          sessionId,
        });

        for await (const event of subscription) {
          if (signal.aborted) break;
          handleEvent(event as SessionPollEvent);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Polls subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [sessionId, currentUserId, enabled, handleEvent]);
}
