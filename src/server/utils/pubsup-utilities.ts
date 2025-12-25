export function getUserChannel(userId: string): string {
  return `user:${userId}:messages`;
}

export function getConversationChannel(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function getPresenceChannel(): string {
  return "presence:updates";
}

export function getTypingChannel(conversationId: string): string {
  return `conversation:${conversationId}:typing`;
}

export function getReadReceiptsChannel(conversationId: string): string {
  return `conversation:${conversationId}:read`;
}
