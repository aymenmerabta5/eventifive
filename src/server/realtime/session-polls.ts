import { createHmac } from "crypto";
import { env } from "@/env";
import { publisher, subscriptionManager } from "./redis";

/**
 * Hash a channel identifier using HMAC-SHA256 for defense-in-depth.
 * This prevents attackers with Redis access from targeting specific sessions
 * by making channel names unpredictable without the application secret.
 */
function hashChannel(type: string, id: string): string {
  const secret =
    env.BETTER_AUTH_SECRET ?? "dev-secret-do-not-use-in-production";
  const hmac = createHmac("sha256", secret);
  hmac.update(`${type}:${id}`);
  return hmac.digest("hex").substring(0, 16);
}

// Redis channel pattern for session polls
function getSessionPollsChannel(sessionId: string): string {
  return `session:${hashChannel("session-polls", sessionId)}:polls`;
}

// Event types for Polls
export type PollEventType =
  | "poll_created"
  | "poll_updated"
  | "poll_closed"
  | "vote_cast"
  | "vote_changed";

// Poll option result for aggregated results
export interface PollOptionResult {
  optionId: number;
  text: string;
  voteCount: number;
  percentage: number;
}

// Aggregated poll results
export interface PollResults {
  pollId: string;
  totalVotes: number;
  options: PollOptionResult[];
}

// Poll option data
export interface PollOptionData {
  id: number;
  text: string;
  displayOrder: number;
}

// Event interfaces
export interface PollCreatedEvent {
  type: "poll_created";
  poll: {
    id: string;
    sessionId: string;
    question: string;
    pollType: "single" | "multiple";
    isActive: boolean;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    options: PollOptionData[];
  };
}

export interface PollUpdatedEvent {
  type: "poll_updated";
  poll: {
    id: string;
    question: string;
    options: PollOptionData[];
  };
}

export interface PollClosedEvent {
  type: "poll_closed";
  pollId: string;
  closedAt: Date;
  results: PollResults;
}

export interface VoteCastEvent {
  type: "vote_cast";
  pollId: string;
  results: PollResults;
}

export interface VoteChangedEvent {
  type: "vote_changed";
  pollId: string;
  results: PollResults;
}

export type SessionPollEvent =
  | PollCreatedEvent
  | PollUpdatedEvent
  | PollClosedEvent
  | VoteCastEvent
  | VoteChangedEvent;

/**
 * Publish a poll event to a session channel
 */
export async function publishSessionPollEvent(
  sessionId: string,
  event: SessionPollEvent,
): Promise<void> {
  const channel = getSessionPollsChannel(sessionId);

  // Serialize dates
  const payload = JSON.stringify(event, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });

  await publisher.publish(channel, payload);
}

/**
 * Subscribe to poll events for a specific session
 * Returns an AsyncGenerator that yields poll events
 */
export async function* subscribeToSessionPolls(
  sessionId: string,
  signal?: AbortSignal,
): AsyncGenerator<SessionPollEvent> {
  const channel = getSessionPollsChannel(sessionId);

  const eventQueue: SessionPollEvent[] = [];
  let resolveWaiting: ((value: void) => void) | null = null;
  let isSubscribed = true;

  const handler = (_channel: string, message: string) => {
    const parsed = JSON.parse(message);

    // Deserialize dates
    if (parsed.poll?.createdAt) {
      parsed.poll.createdAt = new Date(parsed.poll.createdAt);
    }
    if (parsed.closedAt) {
      parsed.closedAt = new Date(parsed.closedAt);
    }

    eventQueue.push(parsed as SessionPollEvent);

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
