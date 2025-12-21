import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  userSubscription,
  subscriptionPlan,
  subscriptionPrice,
  event,
} from "@/server/db/schema";
import { eq, and, or, gte, count } from "drizzle-orm";
import { userSubscriptionOutputSchema } from "@/lib/schemas/payment";

/**
 * Count non-ended events (upcoming + ongoing) for a user
 * These count against the user's event quota
 */
async function countActiveEvents(userId: string): Promise<number> {
  const now = new Date();
  const [result] = await db
    .select({ count: count() })
    .from(event)
    .where(and(eq(event.organizerId, userId), gte(event.endDate, now)));

  return result?.count ?? 0;
}

export const getUserSubscriptionRouter = protectedProcedure
  .route({ method: "GET", path: "/subscription/current" })
  .input(z.object({}))
  .output(userSubscriptionOutputSchema.nullable())
  .handler(async ({ context }) => {
    const { session } = context;
    const userId = session.user.id;

    // Get user's active or pending subscription
    const [subscription] = await db
      .select({
        subscription: userSubscription,
        plan: subscriptionPlan,
        price: subscriptionPrice,
      })
      .from(userSubscription)
      .innerJoin(
        subscriptionPlan,
        eq(userSubscription.planId, subscriptionPlan.id),
      )
      .innerJoin(
        subscriptionPrice,
        eq(userSubscription.priceId, subscriptionPrice.id),
      )
      .where(
        and(
          eq(userSubscription.userId, userId),
          or(
            eq(userSubscription.status, "active"),
            eq(userSubscription.status, "pending"),
          ),
        ),
      );

    if (!subscription) {
      return null;
    }

    // Calculate quota usage
    const usedEvents = await countActiveEvents(userId);
    const eventQuota = subscription.plan.eventQuota;
    const canCreate = eventQuota === -1 || usedEvents < eventQuota;

    return {
      id: subscription.subscription.id,
      status: subscription.subscription.status,
      currentPeriodStart: subscription.subscription.currentPeriodStart,
      currentPeriodEnd: subscription.subscription.currentPeriodEnd,
      cancelledAt: subscription.subscription.cancelledAt,
      createdAt: subscription.subscription.createdAt,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        features: subscription.plan.features,
        eventQuota: subscription.plan.eventQuota,
      },
      price: {
        id: subscription.price.id,
        billingPeriod: subscription.price.billingPeriod,
        amount: subscription.price.amount,
        currency: subscription.price.currency,
      },
      quotaUsage: {
        used: usedEvents,
        limit: eventQuota,
        canCreate,
      },
    };
  });
