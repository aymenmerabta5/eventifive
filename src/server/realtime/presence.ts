import { publisher, subscriptionManager } from "./redis";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";

// Redis key patterns
const PRESENCE_KEY_PREFIX = "presence:";
const PRESENCE_CHANNEL = "presence:updates";

// TTL for presence keys (60 seconds - refreshed by heartbeat)
const PRESENCE_TTL = 60;

// Presence event types
export interface PresenceEvent {
  userId: string;
  status: "online" | "offline";
  lastSeenAt?: Date;
}

// Get presence key for a user
function getPresenceKey(userId: string): string {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}

// Set user as online
export async function setUserOnline(userId: string): Promise<void> {
  const key = getPresenceKey(userId);
  await publisher.set(key, "1", "EX", PRESENCE_TTL);

  // Publish presence change
  const event: PresenceEvent = { userId, status: "online" };
  await publisher.publish(PRESENCE_CHANNEL, JSON.stringify(event));
}

// Refresh presence TTL (called on heartbeat)
export async function refreshPresence(userId: string): Promise<void> {
  const key = getPresenceKey(userId);
  await publisher.expire(key, PRESENCE_TTL);
}

// Set user as offline and update lastSeenAt in DB
export async function setUserOffline(userId: string): Promise<void> {
  const key = getPresenceKey(userId);
  const now = new Date();

  // Delete presence key
  await publisher.del(key);

  // Update lastSeenAt in database
  await db.update(user).set({ lastSeenAt: now }).where(eq(user.id, userId));

  // Publish presence change
  const event: PresenceEvent = { userId, status: "offline", lastSeenAt: now };
  await publisher.publish(PRESENCE_CHANNEL, JSON.stringify(event));
}

// Check if a user is online
export async function isUserOnline(userId: string): Promise<boolean> {
  const key = getPresenceKey(userId);
  const result = await publisher.exists(key);
  return result === 1;
}

// Get online status for multiple users
export async function getUsersOnlineStatus(
  userIds: string[],
): Promise<Map<string, boolean>> {
  if (userIds.length === 0) return new Map();

  const pipeline = publisher.pipeline();
  for (const userId of userIds) {
    pipeline.exists(getPresenceKey(userId));
  }

  const results = await pipeline.exec();
  const statusMap = new Map<string, boolean>();

  if (results) {
    userIds.forEach((userId, index) => {
      const result = results[index];
      statusMap.set(userId, result?.[1] === 1);
    });
  }

  return statusMap;
}

// Get lastSeenAt for offline users from database
export async function getLastSeenAt(
  userIds: string[],
): Promise<Map<string, Date | null>> {
  if (userIds.length === 0) return new Map();

  const users = await db
    .select({ id: user.id, lastSeenAt: user.lastSeenAt })
    .from(user)
    .where(inArray(user.id, userIds));

  const lastSeenMap = new Map<string, Date | null>();
  for (const u of users) {
    lastSeenMap.set(u.id, u.lastSeenAt);
  }

  return lastSeenMap;
}

// Subscribe to presence updates for specific users
export async function* subscribeToPresence(
  userIds: string[],
  signal?: AbortSignal,
): AsyncGenerator<PresenceEvent> {
  const eventQueue: PresenceEvent[] = [];
  let resolveWaiting: ((value: void) => void) | null = null;
  let isSubscribed = true;

  // Track which users we care about
  const userIdSet = new Set(userIds);

  const handler = (_channel: string, message: string) => {
    const event = JSON.parse(message) as PresenceEvent & {
      lastSeenAt?: string;
    };

    // Only emit events for users we're tracking
    if (userIdSet.has(event.userId)) {
      const presenceEvent: PresenceEvent = {
        userId: event.userId,
        status: event.status,
        lastSeenAt: event.lastSeenAt ? new Date(event.lastSeenAt) : undefined,
      };

      eventQueue.push(presenceEvent);
      if (resolveWaiting) {
        resolveWaiting();
        resolveWaiting = null;
      }
    }
  };

  const unsubscribe = await subscriptionManager.subscribe(
    PRESENCE_CHANNEL,
    handler,
  );

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

// Get initial presence state for users
export async function getPresenceState(
  userIds: string[],
): Promise<Map<string, { isOnline: boolean; lastSeenAt: Date | null }>> {
  const [onlineStatus, lastSeenMap] = await Promise.all([
    getUsersOnlineStatus(userIds),
    getLastSeenAt(userIds),
  ]);

  const result = new Map<
    string,
    { isOnline: boolean; lastSeenAt: Date | null }
  >();

  for (const userId of userIds) {
    result.set(userId, {
      isOnline: onlineStatus.get(userId) ?? false,
      lastSeenAt: lastSeenMap.get(userId) ?? null,
    });
  }

  return result;
}
