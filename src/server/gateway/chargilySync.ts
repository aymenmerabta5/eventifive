import { db } from "@/server/db";
import { subscriptionPlan, subscriptionPrice } from "@/server/db/schema";
import { getChargilyClient } from "./chargily";
import { eq, isNull, isNotNull, and } from "drizzle-orm";
import type { SyncResult } from "@/lib/schemas/payment";

/**
 * Sync all unsynced subscription plans to Chargily
 * Creates products and prices in Chargily, stores returned IDs in DB
 */
export async function syncPlansToChargily(): Promise<SyncResult> {
  const result: SyncResult = {
    plansCreated: 0,
    pricesCreated: 0,
    errors: [],
  };

  const client = getChargilyClient();

  // 1. Get plans without chargilyProductId
  const unsyncedPlans = await db
    .select()
    .from(subscriptionPlan)
    .where(
      and(isNull(subscriptionPlan.chargilyProductId), eq(subscriptionPlan.isActive, true))
    );

  // 2. Create products in Chargily for each plan
  for (const plan of unsyncedPlans) {
    try {
      const chargilyProduct = await client.createProduct({
        name: plan.displayName,
        description: plan.description ?? undefined,
      });

      // Update plan with Chargily product ID
      await db
        .update(subscriptionPlan)
        .set({
          chargilyProductId: chargilyProduct.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPlan.id, plan.id));

      result.plansCreated++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to sync plan "${plan.name}": ${message}`);
    }
  }

  // 3. Get prices without chargilyPriceId (for plans that have been synced)
  const unsyncedPrices = await db
    .select({
      price: subscriptionPrice,
      plan: subscriptionPlan,
    })
    .from(subscriptionPrice)
    .innerJoin(subscriptionPlan, eq(subscriptionPrice.planId, subscriptionPlan.id))
    .where(
      and(
        isNull(subscriptionPrice.chargilyPriceId),
        // Only sync prices for plans that have been synced to Chargily
        isNotNull(subscriptionPlan.chargilyProductId)
      )
    );

  // 4. Create prices in Chargily for each price
  for (const { price, plan } of unsyncedPrices) {
    if (!plan.chargilyProductId) {
      continue; // Skip if plan hasn't been synced yet
    }

    try {
      const chargilyPrice = await client.createPrice({
        amount: price.amountCents,
        currency: price.currency.toLowerCase() as "dzd",
        product_id: plan.chargilyProductId,
        metadata: {
          billing_period: price.billingPeriod,
          plan_name: plan.name,
        },
      });

      // Update price with Chargily price ID
      await db
        .update(subscriptionPrice)
        .set({
          chargilyPriceId: chargilyPrice.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPrice.id, price.id));

      result.pricesCreated++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(
        `Failed to sync price for "${plan.name}" (${price.billingPeriod}): ${message}`
      );
    }
  }

  return result;
}

/**
 * Sync a single plan and its prices to Chargily
 */
export async function syncSinglePlan(planId: string): Promise<SyncResult> {
  const result: SyncResult = {
    plansCreated: 0,
    pricesCreated: 0,
    errors: [],
  };

  const client = getChargilyClient();

  // Get the plan
  const [plan] = await db
    .select()
    .from(subscriptionPlan)
    .where(eq(subscriptionPlan.id, planId));

  if (!plan) {
    result.errors.push(`Plan with ID "${planId}" not found`);
    return result;
  }

  // Create or update product in Chargily
  if (!plan.chargilyProductId) {
    try {
      const chargilyProduct = await client.createProduct({
        name: plan.displayName,
        description: plan.description ?? undefined,
      });

      await db
        .update(subscriptionPlan)
        .set({
          chargilyProductId: chargilyProduct.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPlan.id, plan.id));

      // Update local reference for price syncing
      plan.chargilyProductId = chargilyProduct.id;
      result.plansCreated++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to sync plan: ${message}`);
      return result;
    }
  }

  // Sync all prices for this plan
  const prices = await db
    .select()
    .from(subscriptionPrice)
    .where(
      and(
        eq(subscriptionPrice.planId, planId),
        isNull(subscriptionPrice.chargilyPriceId)
      )
    );

  for (const price of prices) {
    try {
      const chargilyPrice = await client.createPrice({
        amount: price.amountCents,
        currency: price.currency.toLowerCase() as "dzd",
        product_id: plan.chargilyProductId!,
        metadata: {
          billing_period: price.billingPeriod,
          plan_name: plan.name,
        },
      });

      await db
        .update(subscriptionPrice)
        .set({
          chargilyPriceId: chargilyPrice.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPrice.id, price.id));

      result.pricesCreated++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(
        `Failed to sync price (${price.billingPeriod}): ${message}`
      );
    }
  }

  return result;
}

/**
 * Verify all synced products still exist in Chargily
 */
export async function verifySyncStatus(): Promise<{
  valid: number;
  missing: number;
  missingIds: string[];
}> {
  const client = getChargilyClient();

  const syncedPlans = await db
    .select()
    .from(subscriptionPlan)
    .where(isNotNull(subscriptionPlan.chargilyProductId));

  const result = {
    valid: 0,
    missing: 0,
    missingIds: [] as string[],
  };

  for (const plan of syncedPlans) {
    if (!plan.chargilyProductId) continue;

    try {
      await client.getProduct(plan.chargilyProductId);
      result.valid++;
    } catch {
      result.missing++;
      result.missingIds.push(plan.id);
    }
  }

  return result;
}

/**
 * Clear sync status for a plan (useful for re-syncing)
 */
export async function clearPlanSync(planId: string): Promise<void> {
  await db
    .update(subscriptionPlan)
    .set({
      chargilyProductId: null,
      chargilySyncedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionPlan.id, planId));

  await db
    .update(subscriptionPrice)
    .set({
      chargilyPriceId: null,
      chargilySyncedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptionPrice.planId, planId));
}
