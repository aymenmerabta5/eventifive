import { z } from "zod";
import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { subscriptionPlan, subscriptionPrice } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";
import { listPlansOutputSchema } from "@/lib/schemas/payment";

const inputSchema = z.object({
  includeInactive: z.boolean().default(false),
});

export const listPlansRouter = publicProcedure
  .route({ method: "GET", path: "/subscription/plans" })
  .input(inputSchema)
  .output(listPlansOutputSchema)
  .handler(async ({ input }) => {
    // Get all plans
    const plans = await db
      .select()
      .from(subscriptionPlan)
      .where(
        input.includeInactive ? undefined : eq(subscriptionPlan.isActive, true),
      )
      .orderBy(asc(subscriptionPlan.sortOrder));

    // Get prices for all plans
    const result = await Promise.all(
      plans.map(async (plan) => {
        const prices = await db
          .select()
          .from(subscriptionPrice)
          .where(eq(subscriptionPrice.planId, plan.id));

        return {
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          features: plan.features,
          sortOrder: plan.sortOrder,
          isActive: plan.isActive,
          chargilyProductId: plan.chargilyProductId,
          chargilySyncedAt: plan.chargilySyncedAt,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
          prices: prices.map((price) => ({
            id: price.id,
            billingPeriod: price.billingPeriod,
            amount: price.amount,
            currency: price.currency,
            chargilyPriceId: price.chargilyPriceId,
            chargilySyncedAt: price.chargilySyncedAt,
          })),
        };
      }),
    );

    return result;
  });
