import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { db } from "@/server/db";
import { roles, userRoles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  paymentRateLimitMiddleware,
  uploadRateLimitMiddleware,
  messagingRateLimitMiddleware,
  qaRateLimitMiddleware,
  registrationRateLimitMiddleware,
  pollVotingRateLimitMiddleware,
  pollCreationRateLimitMiddleware,
  aiRateLimitMiddleware,
} from "./ratelimit";

export const o = os.$context<Context>();

const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const user = await db
    .select({
      roleName: roles.name,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, context.session.user.id))
    .innerJoin(roles, eq(userRoles.roleId, roles.id));
  if (!user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  if (user[0]?.roleName !== "super_admin") {
    throw new ORPCError("FORBIDDEN");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const publicProcedure = o;

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(requireAdmin);

// ============================================================================
// Rate-Limited Procedures
// These procedures include rate limiting middleware for sensitive endpoints
// ============================================================================

/**
 * Payment rate-limited procedure: 5 requests/minute
 * Use for: createCheckout, createEventCheckout
 */
export const rateLimitedPaymentProcedure = protectedProcedure.use(
  paymentRateLimitMiddleware,
);

/**
 * Upload rate-limited procedure: 10 requests/minute
 * Use for: requestUpload
 */
export const rateLimitedUploadProcedure = protectedProcedure.use(
  uploadRateLimitMiddleware,
);

/**
 * Messaging rate-limited procedure: 30 requests/minute
 * Use for: sendMessage
 */
export const rateLimitedMessageProcedure = protectedProcedure.use(
  messagingRateLimitMiddleware,
);

/**
 * Q&A rate-limited procedure: 20 requests/minute
 * Use for: askQuestion, likeQuestion
 */
export const rateLimitedQAProcedure = protectedProcedure.use(
  qaRateLimitMiddleware,
);

/**
 * Registration rate-limited procedure: 10 requests/minute
 * Use for: register (free events)
 */
export const rateLimitedRegistrationProcedure = protectedProcedure.use(
  registrationRateLimitMiddleware,
);

/**
 * Poll voting rate-limited procedure: 10 requests/minute
 * Use for: vote
 */
export const rateLimitedPollVoteProcedure = protectedProcedure.use(
  pollVotingRateLimitMiddleware,
);

/**
 * Poll creation rate-limited procedure: 5 requests/minute
 * Use for: createPoll, updatePoll, closePoll
 */
export const rateLimitedPollCreationProcedure = protectedProcedure.use(
  pollCreationRateLimitMiddleware,
);

/**
 * AI rate-limited procedure: 10 requests/minute
 * Use for: generateEventDescription, and other AI-powered endpoints
 */
export const rateLimitedAIProcedure = protectedProcedure.use(
  aiRateLimitMiddleware,
);
