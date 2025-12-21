import { publisher } from "@/server/realtime/redis";

/**
 * Redis cache utilities
 * Reuses the existing publisher connection from realtime/redis.ts
 */
export const cache = {
  /**
   * Get a cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await publisher.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a cached value with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await publisher.set(key, serialized, "EX", ttlSeconds);
      } else {
        await publisher.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete a cached value by key
   */
  async del(key: string): Promise<void> {
    try {
      await publisher.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
    }
  },

  /**
   * Delete all keys matching a pattern
   * Uses SCAN for production-safe pattern deletion
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await publisher.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await publisher.del(...keys);
        }
      } while (cursor !== "0");
    } catch (error) {
      console.error(`Cache invalidatePattern error for ${pattern}:`, error);
    }
  },
};
