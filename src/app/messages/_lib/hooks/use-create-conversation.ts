"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { CONVERSATIONS_QUERY_KEY } from "./use-conversations";
import type { Conversation } from "../types";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response =
        await client.websocketsRouter.messages.createConversation({
          userId,
        });
      return response;
    },
    onSuccess: (data) => {
      if (data.isNew) {
        // Add the new conversation to the cache
        const newConversation: Conversation = {
          id: data.id,
          otherUser: data.otherUser,
          lastMessage: null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        queryClient.setQueryData<Conversation[]>(
          CONVERSATIONS_QUERY_KEY,
          (old) => {
            if (!old) return [newConversation];
            // Check if already exists
            if (old.some((c) => c.id === data.id)) return old;
            return [newConversation, ...old];
          },
        );
      }
    },
  });
}
