/**
 * Rate Limiting Configuration for oRPC API Endpoints
 *
 * Uses @orpc/experimental-ratelimit with Redis backend for distributed rate limiting.
 * Different limiters are configured for different endpoint categories:
 * - Payment: 5 requests/minute (strict to prevent abuse)
 * - File uploads: 10 requests/minute
 * - Messaging: 30 requests/minute
 * - Q&A: 20 requests/minute
 * - Registration: 10 requests/minute
 * - General protected: 100 requests/minute
 */

import { RedisRatelimiter } from "@orpc/experimental-ratelimit/redis";
import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit";
import { publisher } from "@/server/realtime/redis";
import type { Context } from "./context";

// Helper to create Redis rate limiter with common configuration
function createRedisLimiter(
  prefix: string,
  maxRequests: number,
  windowMs: number = 60000,
): RedisRatelimiter {
  return new RedisRatelimiter({
    eval: async (script, numKeys, ...rest) => {
      return publisher.eval(script, numKeys, ...rest);
    },
    maxRequests,
    window: windowMs,
    prefix: `orpc:ratelimit:${prefix}:`,
  });
}

// ============================================================================
// Rate Limiters - Different limits for different endpoint categories
// ============================================================================

/**
 * Payment rate limiter: 5 requests per minute
 * Strict limit to prevent payment abuse and protect payment gateway
 */
export const paymentLimiter = createRedisLimiter("payment", 5);

/**
 * File upload rate limiter: 10 requests per minute
 * Moderate limit to prevent storage abuse
 */
export const uploadLimiter = createRedisLimiter("upload", 10);

/**
 * Messaging rate limiter: 30 requests per minute
 * Higher limit for real-time communication
 */
export const messagingLimiter = createRedisLimiter("messaging", 30);

/**
 * Q&A rate limiter: 20 requests per minute
 * Moderate limit for session Q&A features
 */
export const qaLimiter = createRedisLimiter("qa", 20);

/**
 * Poll voting rate limiter: 10 requests per minute
 * Moderate limit to prevent vote spam
 */
export const pollVotingLimiter = createRedisLimiter("poll-voting", 10);

/**
 * Poll creation rate limiter: 5 requests per minute
 * Strict limit since only session managers create polls
 */
export const pollCreationLimiter = createRedisLimiter("poll-creation", 5);

/**
 * AI rate limiter: 10 requests per minute
 * Moderate limit to protect API costs while allowing reasonable usage
 */
export const aiLimiter = createRedisLimiter("ai", 10);

/**
 * Registration rate limiter: 10 requests per minute
 * Moderate limit for event registrations
 */
export const registrationLimiter = createRedisLimiter("registration", 10);

/**
 * General protected rate limiter: 100 requests per minute
 * Default limit for general protected endpoints
 */
export const generalProtectedLimiter = createRedisLimiter("general", 100);

// ============================================================================
// Rate Limit Middleware Factories
// ============================================================================

/**
 * Creates a rate limit key based on user session
 * Uses user ID for authenticated requests
 */
function getUserKey(context: Context): string {
  return context.session?.user?.id ?? "anonymous";
}

/**
 * Payment rate limit middleware
 * Applied to: createCheckout, createEventCheckout
 */
export const paymentRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => paymentLimiter,
  key: ({ context }) => getUserKey(context),
});

/**
 * File upload rate limit middleware
 * Applied to: requestUpload
 */
export const uploadRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => uploadLimiter,
  key: ({ context }) => getUserKey(context),
});

/**
 * Messaging rate limit middleware
 * Applied to: sendMessage
 */
export const messagingRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => messagingLimiter,
  key: ({ context }) => getUserKey(context),
});

/**
 * Q&A rate limit middleware
 * Applied to: askQuestion, likeQuestion
 */
export const qaRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => qaLimiter,
  key: ({ context }) => getUserKey(context),
});

/**
 * Poll voting rate limit middleware
 * Applied to: vote
 */
export const pollVotingRateLimitMiddleware = createRatelimitMiddleware<Context>(
  {
    limiter: () => pollVotingLimiter,
    key: ({ context }) => getUserKey(context),
  },
);

/**
 * Poll creation rate limit middleware
 * Applied to: createPoll, updatePoll, closePoll
 */
export const pollCreationRateLimitMiddleware =
  createRatelimitMiddleware<Context>({
    limiter: () => pollCreationLimiter,
    key: ({ context }) => getUserKey(context),
  });

/**
 * AI rate limit middleware
 * Applied to: generateEventDescription, and other AI endpoints
 */
export const aiRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => aiLimiter,
  key: ({ context }) => getUserKey(context),
});

/**
 * Registration rate limit middleware
 * Applied to: register
 */
export const registrationRateLimitMiddleware =
  createRatelimitMiddleware<Context>({
    limiter: () => registrationLimiter,
    key: ({ context }) => getUserKey(context),
  });

/**
 * General protected rate limit middleware
 * Can be used for any protected endpoint that needs rate limiting
 */
export const generalRateLimitMiddleware = createRatelimitMiddleware<Context>({
  limiter: () => generalProtectedLimiter,
  key: ({ context }) => getUserKey(context),
});
