"use client";

import { useMutation } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { useAddMessageOptimistically } from "./use-messages";
import { useUpdateConversationOptimistically } from "./use-conversations";
import type { Message } from "../types";

interface SendMessageParams {
	conversationId: string;
	content: string;
	currentUserId: string;
	currentUserName: string;
	currentUserImage: string | null;
}

export function useSendMessage() {
	const addMessageOptimistically = useAddMessageOptimistically();
	const updateConversationOptimistically = useUpdateConversationOptimistically();

	return useMutation({
		mutationFn: async ({
			conversationId,
			content,
			currentUserId,
			currentUserName,
			currentUserImage,
		}: SendMessageParams) => {
			// Optimistic update - add message immediately
			const optimisticMessage: Message = {
				id: `temp-${Date.now()}`,
				conversationId,
				senderId: currentUserId,
				senderName: currentUserName,
				senderImage: currentUserImage,
				content,
				createdAt: new Date(),
			};

			addMessageOptimistically(conversationId, optimisticMessage);
			updateConversationOptimistically(conversationId, {
				id: optimisticMessage.id,
				content,
				senderId: currentUserId,
				createdAt: optimisticMessage.createdAt,
			});

			// Actually send the message
			const response = await client.websocketsRouter.sendMessage({
				conversationId,
				content,
			});

			return response;
		},
	});
}
