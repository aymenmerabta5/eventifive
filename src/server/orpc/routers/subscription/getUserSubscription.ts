import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  userSubscription,
  subscriptionPlan,
  subscriptionPrice,
  event,
  roles,
  userRoles,
} from "@/server/db/schema";
import { eq, and, or, gte, count } from "drizzle-orm";
import { userSubscriptionOutputSchema } from "@/lib/schemas/payment";

/**
 * Check if user is a super admin
 */
async function checkIsAdmin(userId: string): Promise<boolean> {
  const [adminRole] = await db
    .select({ roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.name, "super_admin")))
    .limit(1);

  return !!adminRole;
}

/**
 * Count published, non-ended events (upcoming + ongoing) for a user
 * Only published events count against the user's event quota
 * Draft, cancelled, and archived events do NOT count
 */
async function countActiveEvents(userId: string): Promise<number> {
  const now = new Date();
  const [result] = await db
    .select({ count: count() })
    .from(event)
    .where(
      and(
        eq(event.organizerId, userId),
        eq(event.status, "published"),
        gte(event.endDate, now)
      )
    );

  return result?.count ?? 0;
}

export const getUserSubscriptionRouter = protectedProcedure
  .route({ method: "GET", path: "/subscription/current" })
  .input(z.object({}))
  .output(userSubscriptionOutputSchema.nullable())
  .handler(async ({ context }) => {
    const { session } = context;
    const userId = session.user.id;

    // Check if user is admin - admins get unlimited quota
    const isAdmin = await checkIsAdmin(userId);

    if (isAdmin) {
      const usedEvents = await countActiveEvents(userId);

      // Return admin subscription with unlimited quota
      return {
        id: "admin",
        status: "active" as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        cancelledAt: null,
        createdAt: new Date(),
        plan: {
          id: "admin",
          name: "admin",
          displayName: "Administrator",
          features: ["Unlimited events", "Platform management", "Full access"],
          eventQuota: -1, // -1 = unlimited
        },
        price: {
          id: "admin",
          billingPeriod: "yearly" as const,
          amount: 0,
          currency: "DZD",
        },
        quotaUsage: {
          used: usedEvents,
          limit: -1, // unlimited
          canCreate: true,
        },
      };
    }

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
