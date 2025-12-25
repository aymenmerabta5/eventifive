import { publisher, subscriptionManager } from "./redis";
import { getTypingChannel } from "@/server/utils/pubsup-utilities";

// TTL for typing keys (3 seconds - if no refresh, user stopped typing)
const TYPING_TTL = 3;

// Typing event types
export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// Get typing key for a user in a conversation
function getTypingKey(conversationId: string, userId: string): string {
  return `typing:${conversationId}:${userId}`;
}

// Set user as typing in a conversation
export async function setTyping(
  conversationId: string,
  userId: string,
): Promise<void> {
  const key = getTypingKey(conversationId, userId);

  // Check if user was already typing (to avoid spam)
  const wasTyping = await publisher.exists(key);

  // Set/refresh the typing key with TTL
  await publisher.setex(key, TYPING_TTL, "1");

  // Only publish "started typing" event if user wasn't already typing
  if (!wasTyping) {
    const event: TypingEvent = {
      conversationId,
      userId,
      isTyping: true,
    };
    await publisher.publish(getTypingChannel(conversationId), JSON.stringify(event));
  }
}

// Clear typing status (called when message is sent)
export async function clearTyping(
  conversationId: string,
  userId: string,
): Promise<void> {
  const key = getTypingKey(conversationId, userId);

  // Check if user was typing
  const wasTyping = await publisher.exists(key);

  if (wasTyping) {
    await publisher.del(key);

    // Publish "stopped typing" event
    const event: TypingEvent = {
      conversationId,
      userId,
      isTyping: false,
    };
    await publisher.publish(getTypingChannel(conversationId), JSON.stringify(event));
  }
}

// Check if a user is currently typing
export async function isUserTyping(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const key = getTypingKey(conversationId, userId);
  const result = await publisher.exists(key);
  return result === 1;
}

// Get all users currently typing in a conversation
export async function getTypingUsers(conversationId: string): Promise<string[]> {
  const pattern = `typing:${conversationId}:*`;
  const keys = await publisher.keys(pattern);

  // Extract user IDs from keys
  return keys.map((key) => {
    const parts = key.split(":");
    return parts[2] || "";
  }).filter(Boolean);
}

// Subscribe to typing events for a conversation
export async function* subscribeToTyping(
  conversationId: string,
  signal?: AbortSignal,
): AsyncGenerator<TypingEvent> {
  const channel = getTypingChannel(conversationId);

  const eventQueue: TypingEvent[] = [];
  let resolveWaiting: ((value: void) => void) | null = null;
  let isSubscribed = true;

  const handler = (_channel: string, message: string) => {
    const event = JSON.parse(message) as TypingEvent;
    eventQueue.push(event);

    if (resolveWaiting) {
      resolveWaiting();
      resolveWaiting = null;
    }
  };

  const unsubscribe = await subscriptionManager.subscribe(channel, handler);

  const cleanup = () => {
    isSubscribed = false;
    unsubscribe();
  };

  signal?.addEventListener("abort", cleanup);

  try {
    while (isSubscribed) {
      if (eventQueue.length > 0) {
        yield eventQueue.shift()!;
      } else {
        await new Promise<void>((resolve) => {
          resolveWaiting = resolve;
        });
      }
    }
  } finally {
    signal?.removeEventListener("abort", cleanup);
    cleanup();
  }
}
