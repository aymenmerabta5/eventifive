import Redis, { type RedisOptions } from "ioredis";
import { env } from "@/env";

/**
 * This is the redis client for the realtime data to be stored and retrieved from
 * i could use Event Iterator but for scalling purposes i choose redis
 * Uses REDIS_URL (native Redis connection) for pub/sub support
 */

const redisOptions: RedisOptions = {
  enableReadyCheck: false, // Upstash doesn't support INFO command
  maxRetriesPerRequest: null, // Required for pub/sub
  // Reconnection settings for Upstash (serverless Redis)
  retryStrategy(times: number) {
    // Exponential backoff: 50ms, 100ms, 200ms... max 2 seconds
    const delay = Math.min(times * 50, 2000);
    console.log(`[Redis] Reconnecting attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
  reconnectOnError(err: Error) {
    // Reconnect on connection-related errors
    const targetErrors = [
      "READONLY",
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
    ];
    const shouldReconnect = targetErrors.some((e) => err.message.includes(e));
    if (shouldReconnect) {
      console.log(`[Redis] Reconnecting due to error: ${err.message}`);
      return true;
    }
    return false;
  },
  // Keep connection alive
  keepAlive: 30000, // Send TCP keepalive every 30 seconds
  connectTimeout: 10000, // 10 second connection timeout
  // Prevent command queue from growing indefinitely during disconnect
  enableOfflineQueue: true,
};

function createRedisClient(name: string): Redis {
  const client = new Redis(env.REDIS_URL, redisOptions);

  // Add error handler to prevent crashes
  client.on("error", (err) => {
    console.error(`[Redis:${name}] Error:`, err.message);
  });

  client.on("connect", () => {
    console.log(`[Redis:${name}] Connected`);
  });

  client.on("ready", () => {
    console.log(`[Redis:${name}] Ready`);
  });

  client.on("close", () => {
    console.log(`[Redis:${name}] Connection closed`);
  });

  client.on("reconnecting", () => {
    console.log(`[Redis:${name}] Reconnecting...`);
  });

  return client;
}

const publisher = createRedisClient("publisher");

/**
 * Shared Subscription Manager
 * Uses a SINGLE Redis connection for ALL pub/sub subscriptions.
 * Prevents connection exhaustion on Upstash (which has connection limits).
 */
type MessageHandler = (channel: string, message: string) => void;

class SubscriptionManager {
  private subscriber: Redis;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private subscribedChannels: Set<string> = new Set();
  private isReady = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.subscriber = createRedisClient("shared-subscriber");

    // Create a promise that resolves when ready OR rejects on error with timeout
    this.readyPromise = new Promise<void>((resolve, reject) => {
      // If already ready, resolve immediately
      if (this.subscriber.status === "ready") {
        this.isReady = true;
        resolve();
        return;
      }

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        reject(new Error("Redis subscriber connection timeout"));
      }, 10000);

      this.subscriber.once("ready", () => {
        clearTimeout(timeout);
        this.isReady = true;
        resolve();
      });

      this.subscriber.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    }).catch((err: Error) => {
      // Log but don't crash - allow retries on individual subscribe calls
      console.error(
        `[SubscriptionManager] Initial connection failed:`,
        err.message,
      );
    });

    this.subscriber.on("message", (channel, message) => {
      const channelHandlers = this.handlers.get(channel);
      if (channelHandlers) {
        for (const handler of channelHandlers) {
          try {
            handler(channel, message);
          } catch (err) {
            console.error(
              `[SubscriptionManager] Handler error on ${channel}:`,
              err,
            );
          }
        }
      }
    });
  }

  async subscribe(
    channel: string,
    handler: MessageHandler,
  ): Promise<() => void> {
    // Wait for initial ready (may have already resolved/rejected)
    await this.readyPromise;

    // Check if subscriber is in a usable state
    const status = this.subscriber.status;
    if (status !== "ready" && status !== "connect") {
      // Try to wait for reconnection (with timeout)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(
            new Error(`Redis not ready for subscription (status: ${status})`),
          );
        }, 5000);

        if (this.subscriber.status === "ready") {
          clearTimeout(timeout);
          resolve();
        } else {
          this.subscriber.once("ready", () => {
            clearTimeout(timeout);
            resolve();
          });
        }
      });
    }

    // Add handler to the set for this channel
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    // Subscribe to channel if not already subscribed
    if (!this.subscribedChannels.has(channel)) {
      this.subscribedChannels.add(channel);
      await this.subscriber.subscribe(channel);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, handler);
    };
  }

  private async unsubscribe(
    channel: string,
    handler: MessageHandler,
  ): Promise<void> {
    const channelHandlers = this.handlers.get(channel);
    if (!channelHandlers) return;

    channelHandlers.delete(handler);

    // If no more handlers for this channel, unsubscribe from Redis
    if (channelHandlers.size === 0) {
      this.handlers.delete(channel);
      this.subscribedChannels.delete(channel);
      try {
        await this.subscriber.unsubscribe(channel);
      } catch {
        // Ignore unsubscribe errors (connection might be closed)
      }
    }
  }

  getStats(): { channels: number; handlers: number } {
    let totalHandlers = 0;
    for (const handlers of this.handlers.values()) {
      totalHandlers += handlers.size;
    }
    return {
      channels: this.subscribedChannels.size,
      handlers: totalHandlers,
    };
  }
}

// Singleton instance
const subscriptionManager = new SubscriptionManager();

export { publisher, subscriptionManager };
