import Redis from "ioredis"
import { env } from "@/env";

/**
 * This is the redis client for the realtime data to be stored and retrieved from
 * i could use Event Iterator but for scalling purposes i choose redis
 * Uses REDIS_URL (native Redis connection) for pub/sub support
 */

const redisOptions = {
	enableReadyCheck: false, // Upstash doesn't support INFO command
	maxRetriesPerRequest: null, // Required for pub/sub
};

const publisher = new Redis(env.REDIS_URL, redisOptions);

const createSubscriber = () => new Redis(env.REDIS_URL, redisOptions);

export { publisher, createSubscriber };