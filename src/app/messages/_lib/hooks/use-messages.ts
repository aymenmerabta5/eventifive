"use client";

import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import type { Message } from "../types";

export const MESSAGES_QUERY_KEY = (conversationId: string) =>
	["messages", conversationId] as const;

export function useMessages(conversationId: string | null) {
	return useInfiniteQuery({
		queryKey: MESSAGES_QUERY_KEY(conversationId ?? ""),
		queryFn: async ({ pageParam }) => {
			if (!conversationId) {
				return { messages: [], nextCursor: null };
			}
			const response = await client.websocketsRouter.getMessages({
				conversationId,
				cursor: pageParam,
				limit: 50,
			});
			return {
				messages: response.messages as Message[],
				nextCursor: response.nextCursor,
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: !!conversationId,
		staleTime: 1000 * 30, // 30 seconds
	});
}

export function useAddMessageOptimistically() {
	const queryClient = useQueryClient();

	return (conversationId: string, message: Message) => {
		queryClient.setQueryData(
			MESSAGES_QUERY_KEY(conversationId),
			(old: { pages: { messages: Message[]; nextCursor: string | null }[] } | undefined) => {
				if (!old) return old;
				const newPages = [...old.pages];
				if (newPages[0]) {
					newPages[0] = {
						...newPages[0],
						messages: [message, ...newPages[0].messages],
					};
				}
				return { ...old, pages: newPages };
			}
		);
	};
}

export function useInvalidateMessages(conversationId: string) {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(conversationId) });
}
