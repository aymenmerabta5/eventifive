import { publisher, createSubscriber } from "./redis";
import { getConversationChannel, getUserChannel } from "@/server/utils/pubsup-utilities";

// Message type for pub/sub
export interface PubSubMessage {
	id: string;
	conversationId: string;
	senderId: string;
	content: string;
	createdAt: Date;
}

// Publish a message to both user channels
export async function publishMessage(
	message: PubSubMessage,
	recipientUserId: string,
): Promise<void> {
	const payload = JSON.stringify({
		...message,
		createdAt: message.createdAt.toISOString(),
	});

	// Publish to conversation channel
	await publisher.publish(getConversationChannel(message.conversationId), payload);

	// Publish to recipient's user channel (for notifications across conversations)
	await publisher.publish(getUserChannel(recipientUserId), payload);
}

// Subscribe to messages for a specific conversation
export async function* subscribeToConversation(
	conversationId: string,
	signal?: AbortSignal,
): AsyncGenerator<PubSubMessage> {
	const subscriber = createSubscriber();
	const channel = getConversationChannel(conversationId);

	const messageQueue: PubSubMessage[] = [];
	let resolveWaiting: ((value: void) => void) | null = null;
	let isSubscribed = true;

	subscriber.subscribe(channel);

	subscriber.on("message", (_channel, message) => {
		const parsed = JSON.parse(message) as PubSubMessage & { createdAt: string };
		messageQueue.push({
			...parsed,
			createdAt: new Date(parsed.createdAt),
		});
		if (resolveWaiting) {
			resolveWaiting();
			resolveWaiting = null;
		}
	});

	// Handle abort signal
	const cleanup = () => {
		isSubscribed = false;
		subscriber.unsubscribe(channel);
		subscriber.quit();
	};

	signal?.addEventListener("abort", cleanup);

	try {
		while (isSubscribed) {
			if (messageQueue.length > 0) {
				yield messageQueue.shift()!;
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

// Subscribe to all messages for a user (across all conversations)
export async function* subscribeToUserMessages(
	userId: string,
	signal?: AbortSignal,
): AsyncGenerator<PubSubMessage> {
	const subscriber = createSubscriber();
	const channel = getUserChannel(userId);

	const messageQueue: PubSubMessage[] = [];
	let resolveWaiting: ((value: void) => void) | null = null;
	let isSubscribed = true;

	subscriber.subscribe(channel);

	subscriber.on("message", (_channel, message) => {
		const parsed = JSON.parse(message) as PubSubMessage & { createdAt: string };
		messageQueue.push({
			...parsed,
			createdAt: new Date(parsed.createdAt),
		});
		if (resolveWaiting) {
			resolveWaiting();
			resolveWaiting = null;
		}
	});

	const cleanup = () => {
		isSubscribed = false;
		subscriber.unsubscribe(channel);
		subscriber.quit();
	};

	signal?.addEventListener("abort", cleanup);

	try {
		while (isSubscribed) {
			if (messageQueue.length > 0) {
				yield messageQueue.shift()!;
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

export { publisher };
