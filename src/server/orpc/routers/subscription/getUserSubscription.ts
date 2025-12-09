import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  userSubscription,
  subscriptionPlan,
  subscriptionPrice,
} from "@/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { userSubscriptionOutputSchema } from "@/lib/schemas/payment";

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
        eq(userSubscription.planId, subscriptionPlan.id)
      )
      .innerJoin(
        subscriptionPrice,
        eq(userSubscription.priceId, subscriptionPrice.id)
      )
      .where(
        and(
          eq(userSubscription.userId, userId),
          or(
            eq(userSubscription.status, "active"),
            eq(userSubscription.status, "pending")
          )
        )
      );

    if (!subscription) {
      return null;
    }

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
      },
      price: {
        id: subscription.price.id,
        billingPeriod: subscription.price.billingPeriod,
        amountCents: subscription.price.amountCents,
        currency: subscription.price.currency,
      },
    };
  });
