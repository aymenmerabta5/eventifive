import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  subscriptionPlan,
  subscriptionPrice,
  userRoles,
  roles,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { syncSinglePlan } from "@/server/gateway/chargilySync";
import { isChargilyConfigured } from "@/server/gateway/chargily";
import { createPlanInputSchema, planOutputSchema } from "@/lib/schemas/payment";

export const createPlanRouter = protectedProcedure
  .route({ method: "POST", path: "/subscription/plans" })
  .input(createPlanInputSchema)
  .output(planOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // Check if user is admin
    const [userRole] = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    if (!userRole || !["admin", "super_admin"].includes(userRole.roleName)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only administrators can create subscription plans",
      });
    }

    // Check if plan name already exists
    const [existingPlan] = await db
      .select()
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.name, input.name));

    if (existingPlan) {
      throw new ORPCError("BAD_REQUEST", {
        message: `A plan with name "${input.name}" already exists`,
      });
    }

    const now = new Date();
    const planId = uuidv4();

    // Create plan
    await db.insert(subscriptionPlan).values({
      id: planId,
      name: input.name,
      displayName: input.displayName,
      description: input.description,
      features: input.features ?? [],
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    });

    // Create prices
    const priceRecords = input.prices.map((price) => ({
      id: uuidv4(),
      planId,
      billingPeriod: price.billingPeriod as "monthly" | "yearly",
      amount: price.amount,
      currency: price.currency,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(subscriptionPrice).values(priceRecords);

    // Sync to Chargily if configured
    if (isChargilyConfigured()) {
      try {
        await syncSinglePlan(planId);
      } catch (error) {
        console.error("Failed to sync plan to Chargily:", error);
        // Don't throw - plan is created, sync can be retried
      }
    }

    // Fetch created plan with prices
    const [createdPlan] = await db
      .select()
      .from(subscriptionPlan)
      .where(eq(subscriptionPlan.id, planId));

    if (!createdPlan) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to retrieve created plan",
      });
    }

    const prices = await db
      .select()
      .from(subscriptionPrice)
      .where(eq(subscriptionPrice.planId, planId));

    return {
      id: createdPlan.id,
      name: createdPlan.name,
      displayName: createdPlan.displayName,
      description: createdPlan.description,
      features: createdPlan.features,
      sortOrder: createdPlan.sortOrder,
      isActive: createdPlan.isActive,
      chargilyProductId: createdPlan.chargilyProductId,
      chargilySyncedAt: createdPlan.chargilySyncedAt,
      createdAt: createdPlan.createdAt,
      updatedAt: createdPlan.updatedAt,
      prices: prices.map((price) => ({
        id: price.id,
        billingPeriod: price.billingPeriod,
        amount: price.amount,
        currency: price.currency,
        chargilyPriceId: price.chargilyPriceId,
        chargilySyncedAt: price.chargilySyncedAt,
      })),
    };
  });
