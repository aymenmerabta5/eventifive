"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type { Conversation } from "../types";

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;

export function useConversations() {
	return useQuery({
		queryKey: CONVERSATIONS_QUERY_KEY,
		queryFn: async () => {
			const response = await client.websocketsRouter.getConversations({
				limit: 50,
			});
			return response.conversations as Conversation[];
		},
		staleTime: 1000 * 60, // 1 minute
		refetchOnWindowFocus: true,
	});
}

export function useInvalidateConversations() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
}

export function useUpdateConversationOptimistically() {
	const queryClient = useQueryClient();

	return (conversationId: string, lastMessage: Conversation["lastMessage"]) => {
		queryClient.setQueryData<Conversation[]>(CONVERSATIONS_QUERY_KEY, (old) => {
			if (!old) return old;
			return old
				.map((conv) =>
					conv.id === conversationId
						? { ...conv, lastMessage, updatedAt: new Date() }
						: conv
				)
				.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
		});
	};
}
