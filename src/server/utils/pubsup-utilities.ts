export function getUserChannel(userId: string): string {
	return `user:${userId}:messages`;
}

export function getConversationChannel(conversationId: string): string {
	return `conversation:${conversationId}`;
}