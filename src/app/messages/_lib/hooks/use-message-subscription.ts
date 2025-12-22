"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { MESSAGES_QUERY_KEY } from "./use-messages";
import { CONVERSATIONS_QUERY_KEY } from "./use-conversations";
import type { Message, Conversation, RealtimeMessage } from "../types";

interface UseMessageSubscriptionOptions {
  conversationId?: string;
  currentUserId: string;
  onNewMessage?: (message: RealtimeMessage) => void;
}

export function useMessageSubscription({
  conversationId,
  currentUserId,
  onNewMessage,
}: UseMessageSubscriptionOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleNewMessage = useCallback(
    (message: RealtimeMessage) => {
      if (message.senderId === currentUserId) return;

      queryClient.setQueryData(
        MESSAGES_QUERY_KEY(message.conversationId),
        (
          old:
            | { pages: { messages: Message[]; nextCursor: string | null }[] }
            | undefined,
        ) => {
          if (!old) return old;

          const exists = old.pages.some((page) =>
            page.messages.some((m) => m.id === message.id),
          );
          if (exists) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [
                {
                  ...message,
                  senderName: "Unknown",
                  senderImage: null,
                },
                ...newPages[0].messages,
              ],
            };
          }
          return { ...old, pages: newPages };
        },
      );

      queryClient.setQueryData<Conversation[]>(
        CONVERSATIONS_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return old
            .map((conv) =>
              conv.id === message.conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      id: message.id,
                      content: message.content,
                      senderId: message.senderId,
                      createdAt: message.createdAt,
                    },
                    updatedAt: new Date(),
                  }
                : conv,
            )
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        },
      );

      onNewMessage?.(message);
    },
    [currentUserId, queryClient, onNewMessage],
  );

  useEffect(() => {
    if (!currentUserId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription = await client.websocketsRouter.messages.subscribe({
          conversationId,
        });

        for await (const message of subscription) {
          if (signal.aborted) break;
          handleNewMessage(message as RealtimeMessage);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Message subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId, currentUserId, handleNewMessage]);
}
