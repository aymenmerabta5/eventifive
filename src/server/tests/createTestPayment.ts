/**
 * Create test pending payments for webhook testing
 *
 * Creates real pending payment records that can be used to test
 * the webhook flow without going through Chargily checkout.
 */

import { db } from "@/server/db";
import {
  payment,
  eventRegistration,
  userSubscription,
  event,
  user,
  subscriptionPrice,
  subscriptionPlan,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { colors, logSuccess, logError } from "./utils";

export interface CreateTestPaymentResult {
  success: boolean;
  paymentId?: string;
  registrationId?: number;
  subscriptionId?: string;
  message: string;
}

/**
 * Create a test pending payment for event registration
 */
export async function createTestRegistrationPayment(
  userId: string,
  eventId: string,
): Promise<CreateTestPaymentResult> {
  // 1. Verify user exists
  const [userData] = await db.select().from(user).where(eq(user.id, userId));
  if (!userData) {
    return { success: false, message: `User not found: ${userId}` };
  }

  // 2. Verify event exists and is paid
  const [eventData] = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId));
  if (!eventData) {
    return { success: false, message: `Event not found: ${eventId}` };
  }
  if (eventData.priceAmount <= 0) {
    return {
      success: false,
      message: `Event "${eventData.title}" is free, no payment needed`,
    };
  }

  // 3. Check if user already registered
  const [existingReg] = await db
    .select()
    .from(eventRegistration)
    .where(
      and(
        eq(eventRegistration.eventId, eventId),
        eq(eventRegistration.userId, userId),
      ),
    );

  if (existingReg && existingReg.paymentStatus === "paid") {
    return {
      success: false,
      message: `User already registered and paid for this event`,
    };
  }

  const now = new Date();
  let registrationId: number;

  // 4. Create or update registration
  if (existingReg) {
    registrationId = existingReg.id;
    await db
      .update(eventRegistration)
      .set({ paymentStatus: "pending" })
      .where(eq(eventRegistration.id, existingReg.id));
  } else {
    const [newReg] = await db
      .insert(eventRegistration)
      .values({
        eventId,
        userId,
        roleAtEvent: "participant",
        registeredAt: now,
        paymentStatus: "pending",
      })
      .returning({ id: eventRegistration.id });

    if (!newReg) {
      return { success: false, message: "Failed to create registration" };
    }
    registrationId = newReg.id;
  }

  // 5. Create payment record
  const paymentId = uuidv4();
  await db.insert(payment).values({
    id: paymentId,
    registrationId,
    userId,
    amount: eventData.priceAmount,
    currency: eventData.priceCurrency,
    status: "pending",
    provider: "chargily",
    chargilyCheckoutId: `test_checkout_${Date.now()}`,
    createdAt: now,
  });

  logSuccess(
    `Created test payment for ${colors.cyan}${userData.name}${colors.reset} → ${colors.cyan}${eventData.title}${colors.reset}`,
  );
  console.log(`  Payment ID: ${colors.yellow}${paymentId}${colors.reset}`);
  console.log(`  Amount: ${eventData.priceAmount} ${eventData.priceCurrency}`);

  return {
    success: true,
    paymentId,
    registrationId,
    message: `Test payment created for event registration`,
  };
}

/**
 * Create a test pending payment for subscription
 */
export async function createTestSubscriptionPayment(
  userId: string,
  priceId: string,
): Promise<CreateTestPaymentResult> {
  // 1. Verify user exists
  const [userData] = await db.select().from(user).where(eq(user.id, userId));
  if (!userData) {
    return { success: false, message: `User not found: ${userId}` };
  }

  // 2. Verify price exists and plan is active
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
        eq(subscriptionPrice.id, priceId),
        eq(subscriptionPlan.isActive, true),
      ),
    );

  if (!priceWithPlan) {
    return {
      success: false,
      message: `Price not found or plan inactive: ${priceId}`,
    };
  }

  const { price, plan } = priceWithPlan;

  // 3. Check for existing active subscription
  const [existingSub] = await db
    .select()
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.userId, userId),
        eq(userSubscription.status, "active"),
      ),
    );

  if (existingSub) {
    return {
      success: false,
      message: `User already has an active subscription`,
    };
  }

  const now = new Date();
  const periodEnd = new Date(now);
  if (price.billingPeriod === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  // 4. Create subscription record
  const subscriptionId = uuidv4();
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

  // 5. Create payment record
  const paymentId = uuidv4();
  await db.insert(payment).values({
    id: paymentId,
    subscriptionId,
    userId,
    amount: price.amount,
    currency: price.currency,
    status: "pending",
    provider: "chargily",
    chargilyCheckoutId: `test_checkout_${Date.now()}`,
    createdAt: now,
  });

  logSuccess(
    `Created test payment for ${colors.cyan}${userData.name}${colors.reset} → ${colors.cyan}${plan.name}${colors.reset} subscription`,
  );
  console.log(`  Payment ID: ${colors.yellow}${paymentId}${colors.reset}`);
  console.log(
    `  Amount: ${price.amount} ${price.currency}/${price.billingPeriod}`,
  );

  return {
    success: true,
    paymentId,
    subscriptionId,
    message: `Test payment created for subscription`,
  };
}

/**
 * List available events for testing (paid events only)
 */
export async function listPaidEvents(): Promise<void> {
  const events = await db
    .select({
      id: event.id,
      title: event.title,
      priceAmount: event.priceAmount,
      priceCurrency: event.priceCurrency,
    })
    .from(event)
    .where(eq(event.priceAmount, 0) ? undefined : undefined);

  const paidEvents = events.filter((e) => e.priceAmount > 0);

  console.log(`\n${colors.cyan}Paid Events:${colors.reset}\n`);

  if (paidEvents.length === 0) {
    console.log(`${colors.dim}  No paid events found${colors.reset}`);
    return;
  }

  for (const e of paidEvents) {
    console.log(`  ${colors.yellow}${e.id}${colors.reset}`);
    console.log(`    ${e.title} - ${e.priceAmount} ${e.priceCurrency}`);
    console.log();
  }
}

/**
 * List available users for testing
 */
export async function listUsers(limit = 10): Promise<void> {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .limit(limit);

  console.log(`\n${colors.cyan}Users (first ${limit}):${colors.reset}\n`);

  if (users.length === 0) {
    console.log(`${colors.dim}  No users found${colors.reset}`);
    return;
  }

  for (const u of users) {
    console.log(`  ${colors.yellow}${u.id}${colors.reset}`);
    console.log(`    ${u.name} (${u.email})`);
    console.log();
  }
}

/**
 * List available subscription plans and prices for testing
 */
export async function listSubscriptionPlans(): Promise<void> {
  const plans = await db
    .select({
      planId: subscriptionPlan.id,
      planName: subscriptionPlan.name,
      displayName: subscriptionPlan.displayName,
      isActive: subscriptionPlan.isActive,
      priceId: subscriptionPrice.id,
      amount: subscriptionPrice.amount,
      currency: subscriptionPrice.currency,
      billingPeriod: subscriptionPrice.billingPeriod,
    })
    .from(subscriptionPlan)
    .innerJoin(
      subscriptionPrice,
      eq(subscriptionPrice.planId, subscriptionPlan.id),
    )
    .where(eq(subscriptionPlan.isActive, true));

  console.log(`\n${colors.cyan}Subscription Plans:${colors.reset}\n`);

  if (plans.length === 0) {
    console.log(
      `${colors.dim}  No active subscription plans found${colors.reset}`,
    );
    console.log(`${colors.dim}  Run: bun run db:seed:plans${colors.reset}`);
    return;
  }

  // Group by plan
  const grouped = plans.reduce(
    (acc, p) => {
      const existing = acc[p.planId] ?? {
        name: p.planName,
        displayName: p.displayName,
        prices: [],
      };
      existing.prices.push({
        id: p.priceId,
        amount: p.amount,
        currency: p.currency,
        billingPeriod: p.billingPeriod,
      });
      acc[p.planId] = existing;
      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        displayName: string;
        prices: {
          id: string;
          amount: number;
          currency: string;
          billingPeriod: string;
        }[];
      }
    >,
  );

  for (const [planId, plan] of Object.entries(grouped)) {
    console.log(
      `  ${colors.magenta}${plan.displayName}${colors.reset} (${plan.name})`,
    );
    console.log(`    Plan ID: ${colors.dim}${planId}${colors.reset}`);
    for (const price of plan.prices) {
      console.log(`    ${colors.yellow}${price.id}${colors.reset}`);
      console.log(
        `      ${price.amount} ${price.currency}/${price.billingPeriod}`,
      );
    }
    console.log();
  }
}
