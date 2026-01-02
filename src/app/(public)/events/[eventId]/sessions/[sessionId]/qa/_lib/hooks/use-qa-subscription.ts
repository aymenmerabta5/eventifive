"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type {
  Question,
  SessionQAEvent,
  QuestionEvent,
  LikeEvent,
  AnswerEvent,
} from "../types";

export const QA_QUERY_KEY = (sessionId: string) =>
  ["websocketsRouter", "qa", "list", sessionId] as const;

interface UseQASubscriptionOptions {
  sessionId: string;
  currentUserId: string;
  enabled?: boolean;
}

interface QuestionsData {
  questions: Question[];
  qaEnabled: boolean;
  qaModerated: boolean;
  isSessionManager: boolean;
}

export function useQASubscription({
  sessionId,
  currentUserId,
  enabled = true,
}: UseQASubscriptionOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleQuestionEvent = useCallback(
    (event: QuestionEvent) => {
      queryClient.setQueryData<QuestionsData>(
        QA_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          switch (event.type) {
            case "question_created": {
              // Check if question already exists
              const exists = old.questions.some(
                (q) => q.id === event.question.id,
              );
              if (exists) return old;

              // Add new question at the beginning
              const newQuestion: Question = {
                ...event.question,
                hasLiked: false,
                answers: [],
              };

              return {
                ...old,
                questions: [newQuestion, ...old.questions],
              };
            }

            case "question_updated": {
              return {
                ...old,
                questions: old.questions.map((q) =>
                  q.id === event.question.id
                    ? {
                        ...q,
                        ...event.question,
                        hasLiked: q.hasLiked,
                        answers: q.answers,
                      }
                    : q,
                ),
              };
            }

            case "question_deleted": {
              return {
                ...old,
                questions: old.questions.filter(
                  (q) => q.id !== event.question.id,
                ),
              };
            }

            default:
              return old;
          }
        },
      );
    },
    [queryClient, sessionId],
  );

  const handleLikeEvent = useCallback(
    (event: LikeEvent) => {
      queryClient.setQueryData<QuestionsData>(
        QA_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            questions: old.questions.map((q) =>
              q.id === event.questionId
                ? {
                    ...q,
                    likeCount: event.likeCount,
                    hasLiked:
                      event.userId === currentUserId
                        ? event.type === "question_liked"
                        : q.hasLiked,
                  }
                : q,
            ),
          };
        },
      );
    },
    [queryClient, sessionId, currentUserId],
  );

  const handleAnswerEvent = useCallback(
    (event: AnswerEvent) => {
      queryClient.setQueryData<QuestionsData>(
        QA_QUERY_KEY(sessionId),
        (old) => {
          if (!old) return old;

          switch (event.type) {
            case "answer_created": {
              return {
                ...old,
                questions: old.questions.map((q) =>
                  q.id === event.answer.questionId
                    ? {
                        ...q,
                        isAnswered: true,
                        answers: [...q.answers, event.answer],
                      }
                    : q,
                ),
              };
            }

            case "answer_updated": {
              return {
                ...old,
                questions: old.questions.map((q) =>
                  q.id === event.answer.questionId
                    ? {
                        ...q,
                        answers: q.answers.map((a) =>
                          a.id === event.answer.id ? event.answer : a,
                        ),
                      }
                    : q,
                ),
              };
            }

            case "answer_deleted": {
              return {
                ...old,
                questions: old.questions.map((q) =>
                  q.id === event.answer.questionId
                    ? {
                        ...q,
                        answers: q.answers.filter(
                          (a) => a.id !== event.answer.id,
                        ),
                        isAnswered: q.answers.length > 1,
                      }
                    : q,
                ),
              };
            }

            default:
              return old;
          }
        },
      );
    },
    [queryClient, sessionId],
  );

  const handleEvent = useCallback(
    (event: SessionQAEvent) => {
      if (event.type.startsWith("question_") && "question" in event) {
        handleQuestionEvent(event as QuestionEvent);
      } else if (
        (event.type === "question_liked" ||
          event.type === "question_unliked") &&
        "questionId" in event
      ) {
        handleLikeEvent(event as LikeEvent);
      } else if (event.type.startsWith("answer_") && "answer" in event) {
        handleAnswerEvent(event as AnswerEvent);
      }
    },
    [handleQuestionEvent, handleLikeEvent, handleAnswerEvent],
  );

  useEffect(() => {
    if (!enabled || !sessionId || !currentUserId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription = await client.websocketsRouter.qa.subscribe({
          sessionId,
        });

        for await (const event of subscription) {
          if (signal.aborted) break;
          handleEvent(event as SessionQAEvent);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Q&A subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [sessionId, currentUserId, enabled, handleEvent]);
}
