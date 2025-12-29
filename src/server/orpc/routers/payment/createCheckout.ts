import { z } from "zod";
import { rateLimitedPaymentProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  subscriptionPrice,
  subscriptionPlan,
  userSubscription,
  payment,
} from "@/server/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import {
  getChargilyClient,
  generateCallbackUrls,
} from "@/server/gateway/chargily";
import {
  createCheckoutInputSchema,
  createCheckoutOutputSchema,
} from "@/lib/schemas/payment";

// Helper to check if error is a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unique") ||
      message.includes("duplicate") ||
      message.includes("23505") // PostgreSQL unique violation code
    );
  }
  return false;
}

export const createCheckoutRouter = rateLimitedPaymentProcedure
  .route({ method: "POST", path: "/payment/checkout" })
  .input(createCheckoutInputSchema)
  .output(createCheckoutOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // 1. Get the subscription price from DB
    const [priceWithPlan] = await db
      .select({
        price: subscriptionPrice,
        plan: subscriptionPlan,
      })
      .from(subscriptionPrice)
      .innerJoin(
        subscriptionPlan,
        eq(subscriptionPrice.planId, subscriptionPlan.id),
      )
      .where(
        and(
          eq(subscriptionPrice.id, input.priceId),
          eq(subscriptionPlan.isActive, true),
        ),
      );

    if (!priceWithPlan) {
      throw new ORPCError("NOT_FOUND", {
        message: "Subscription price not found or plan is inactive",
      });
    }

    const { price, plan } = priceWithPlan;

    // 2. Verify price is synced to Chargily
    if (!price.chargilyPriceId) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "This subscription plan is not yet available for purchase. Please try again later.",
      });
    }

    // 3. Check if user already has an active or pending subscription
    const [existingSubscription] = await db
      .select({
        subscription: userSubscription,
        payment: payment,
      })
      .from(userSubscription)
      .leftJoin(payment, eq(payment.subscriptionId, userSubscription.id))
      .where(
        and(
          eq(userSubscription.userId, userId),
          or(
            eq(userSubscription.status, "active"),
            eq(userSubscription.status, "pending"),
          ),
        ),
      )
      .orderBy(userSubscription.createdAt);

    if (existingSubscription) {
      const { subscription, payment: existingPayment } = existingSubscription;

      // If active subscription exists, reject
      if (subscription.status === "active") {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "You already have an active subscription. Please cancel it first before subscribing to a new plan.",
        });
      }

      // If pending subscription exists with a valid checkout, return it
      if (
        subscription.status === "pending" &&
        existingPayment?.chargilyCheckoutId
      ) {
        // Check if the pending payment is still valid (created within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (existingPayment.createdAt > oneHourAgo) {
          // Return the existing checkout URL
          const client = getChargilyClient();
          try {
            const checkout = await client.getCheckout(
              existingPayment.chargilyCheckoutId,
            );
            if (checkout && checkout.status === "pending") {
              return {
                paymentId: existingPayment.id,
                checkoutUrl: checkout.checkout_url,
                chargilyCheckoutId: existingPayment.chargilyCheckoutId,
              };
            }
          } catch {
            // Checkout expired or invalid, clean up and create new one
          }
        }

        // Clean up stale pending subscription
        await db.delete(payment).where(eq(payment.id, existingPayment.id));
        await db
          .delete(userSubscription)
          .where(eq(userSubscription.id, subscription.id));
      }
    }

    // 4. Calculate subscription period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (price.billingPeriod === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // 5. Create subscription record with pending status
    // Use try-catch to handle race condition where another request created a subscription
    const subscriptionId = uuidv4();
    try {
      await db.insert(userSubscription).values({
        id: subscriptionId,
        userId,
        planId: plan.id,
        priceId: price.id,
        status: "pending",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        createdAt: now,
        updatedAt: now,
      });
    } catch (insertError) {
      // Check if this was a race condition (another subscription was created concurrently)
      // Re-check for existing subscriptions
      const [raceConditionSub] = await db
        .select()
        .from(userSubscription)
        .where(
          and(
            eq(userSubscription.userId, userId),
            or(
              eq(userSubscription.status, "active"),
              eq(userSubscription.status, "pending"),
            ),
          ),
        );

      if (raceConditionSub) {
        if (raceConditionSub.status === "active") {
          throw new ORPCError("BAD_REQUEST", {
            message:
              "You already have an active subscription. Please cancel it first before subscribing to a new plan.",
          });
        }
        throw new ORPCError("CONFLICT", {
          message:
            "A subscription checkout is already in progress. Please complete or cancel it first.",
        });
      }

      // Re-throw if it was a different error
      throw insertError;
    }

    // 6. Create payment record
    const paymentId = uuidv4();
    await db.insert(payment).values({
      id: paymentId,
      subscriptionId,
      userId,
      amount: price.amount,
      currency: price.currency,
      status: "pending",
      provider: "chargily",
      createdAt: now,
    });

    // 7. Create Chargily checkout
    const client = getChargilyClient();
    const callbackUrls = generateCallbackUrls(paymentId);

    try {
      const checkout = await client.createCheckout({
        items: [
          {
            price: price.chargilyPriceId,
            quantity: 1,
          },
        ],
        success_url: callbackUrls.success_url,
        failure_url: callbackUrls.failure_url,
        payment_method: input.paymentMethod,
        metadata: {
          paymentId,
          userId,
          subscriptionId,
          planName: plan.name,
        },
      });

      // 8. Update payment with Chargily checkout ID
      await db
        .update(payment)
        .set({
          chargilyCheckoutId: checkout.id,
        })
        .where(eq(payment.id, paymentId));

      return {
        paymentId,
        checkoutUrl: checkout.checkout_url,
        chargilyCheckoutId: checkout.id,
      };
    } catch (error) {
      // Rollback: delete payment and subscription records
      await db.delete(payment).where(eq(payment.id, paymentId));
      await db
        .delete(userSubscription)
        .where(eq(userSubscription.id, subscriptionId));

      console.error("Failed to create Chargily checkout:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create checkout. Please try again.",
      });
    }
  });
