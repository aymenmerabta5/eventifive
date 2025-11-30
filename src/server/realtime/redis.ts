import Redis from "ioredis"
import { env } from "@/env";

/**
 * This is the redis client for the realtime data to be stored and retrieved from
 * i could use Event Iterator but for scalling purposes i choose redis
 * Uses REDIS_URL (native Redis connection) for pub/sub support
 */

const client = new Redis(env.REDIS_URL);

export { client };