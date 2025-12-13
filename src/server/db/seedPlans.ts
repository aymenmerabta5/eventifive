import { config } from "dotenv";
config({ path: ".env" });

import { v4 as uuidv4 } from "uuid";

interface PlanSeed {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  sortOrder: number;
  prices: {
    billingPeriod: "monthly" | "yearly";
    amount: number;
    currency: string;
  }[];
}

const INITIAL_PLANS: PlanSeed[] = [
  {
    name: "basic",
    displayName: "Basic",
    description: "Perfect for trying out our event generator.",
    features: [
      "Up to 10 events per month",
      "Basic event templates",
      "Email support",
    ],
    sortOrder: 0,
    prices: [
      { billingPeriod: "monthly", amount: 1000, currency: "DZD" }, // 1000 DZD
      { billingPeriod: "yearly", amount: 9000, currency: "DZD" }, // 9000 DZD (25% off)
    ],
  },
  {
    name: "standard",
    displayName: "Standard",
    description:
      "Perfect for small businesses and organizations that require a more comprehensive event management solution.",
    features: [
      "Up to 100 events per month",
      "Premium event templates",
      "Priority email support",
      "Advanced event analytics",
      "Custom branding",
    ],
    sortOrder: 1,
    prices: [
      { billingPeriod: "monthly", amount: 2000, currency: "DZD" }, // 2000 DZD
      { billingPeriod: "yearly", amount: 18000, currency: "DZD" }, // 18000 DZD (25% off)
    ],
  },
  {
    name: "premium",
    displayName: "Premium",
    description:
      "Perfect for large businesses and organizations that require a fully customizable event management solution.",
    features: [
      "Unlimited events",
      "All premium templates",
      "24/7 phone & email support",
      "Real-time analytics & reporting",
      "Full custom branding",
      "Full API access",
      "Dedicated account manager",
    ],
    sortOrder: 2,
    prices: [
      { billingPeriod: "monthly", amount: 5000, currency: "DZD" }, // 5000 DZD
      { billingPeriod: "yearly", amount: 45000, currency: "DZD" }, // 45000 DZD (25% off)
    ],
  },
];

export async function seedPlans(): Promise<{
  created: number;
  skipped: number;
  synced: boolean;
}> {
  // Dynamic imports to ensure env is loaded first
  const { db } = await import("@/server/db");
  const { subscriptionPlan, subscriptionPrice } = await import("./schema");
  const { eq } = await import("drizzle-orm");
  const { syncPlansToChargily } = await import("../gateway/chargilySync");
  const { isChargilyConfigured } = await import("../gateway/chargily");

  const result = {
    created: 0,
    skipped: 0,
    synced: false,
  };

  const now = new Date();

  for (const planData of INITIAL_PLANS) {
    // Check if plan already exists
    const [existingPlan] = await db
      .select()
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.name, planData.name));

    if (existingPlan) {
      console.log(`Plan "${planData.name}" already exists, skipping`);
      result.skipped++;
      continue;
    }

    // Create plan
    const planId = uuidv4();
    await db.insert(subscriptionPlan).values({
      id: planId,
      name: planData.name,
      displayName: planData.displayName,
      description: planData.description,
      features: planData.features,
      sortOrder: planData.sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create prices
    for (const priceData of planData.prices) {
      await db.insert(subscriptionPrice).values({
        id: uuidv4(),
        planId,
        billingPeriod: priceData.billingPeriod,
        amount: priceData.amount,
        currency: priceData.currency,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(
      `Created plan "${planData.name}" with ${planData.prices.length} prices`,
    );
    result.created++;
  }

  // Sync to Chargily if configured
  if (isChargilyConfigured()) {
    try {
      console.log("Syncing plans to Chargily...");
      const syncResult = await syncPlansToChargily();
      console.log("Sync result:", syncResult);
      result.synced = syncResult.errors.length === 0;
    } catch (error) {
      console.error("Failed to sync plans to Chargily:", error);
    }
  } else {
    console.log("Chargily not configured, skipping sync");
  }

  return result;
}

seedPlans()
  .then((result) => {
    console.log("\nSeed completed:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
