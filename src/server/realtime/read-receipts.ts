import { publisher, subscriptionManager } from "./redis";
import { getReadReceiptsChannel } from "@/server/utils/pubsup-utilities";

// Read receipt event type
export interface ReadReceiptEvent {
  type: "read";
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: Date;
}

// Publish a read receipt event
export async function publishReadReceipt(
  conversationId: string,
  userId: string,
  lastReadMessageId: string,
  readAt: Date,
): Promise<void> {
  const channel = getReadReceiptsChannel(conversationId);
  const event: ReadReceiptEvent = {
    type: "read",
    conversationId,
    userId,
    lastReadMessageId,
    readAt,
  };

  await publisher.publish(
    channel,
    JSON.stringify({
      ...event,
      readAt: readAt.toISOString(),
    }),
  );
}

// Subscribe to read receipt events for a conversation
export async function* subscribeToReadReceipts(
  conversationId: string,
  signal?: AbortSignal,
): AsyncGenerator<ReadReceiptEvent> {
  const channel = getReadReceiptsChannel(conversationId);

  const eventQueue: ReadReceiptEvent[] = [];
  let resolveWaiting: ((value: void) => void) | null = null;
  let isSubscribed = true;

  const handler = (_channel: string, message: string) => {
    try {
      const parsed = JSON.parse(message);

      const event: ReadReceiptEvent = {
        type: "read",
        conversationId: parsed.conversationId,
        userId: parsed.userId,
        lastReadMessageId: parsed.lastReadMessageId,
        readAt: new Date(parsed.readAt),
      };

      eventQueue.push(event);

      if (resolveWaiting) {
        resolveWaiting();
        resolveWaiting = null;
      }
    } catch {
      // Ignore parse errors
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
