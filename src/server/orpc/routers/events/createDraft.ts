import { protectedProcedure } from "../../index";
import { createDraftEventSchema } from "@/lib/schemas/schemas";
import { db } from "@/server/db";
import {
  event,
  userSubscription,
  subscriptionPlan,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { eq, and, gte, count } from "drizzle-orm";

const outputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  eventId: z.string().optional(),
});

/**
 * Check if user has an active subscription and is within quota
 */
async function checkSubscriptionAndQuota(userId: string): Promise<{
  hasSubscription: boolean;
  canCreate: boolean;
  used: number;
  limit: number;
}> {
  // Get user's active subscription with plan
  const [subscription] = await db
    .select({
      planId: userSubscription.planId,
      eventQuota: subscriptionPlan.eventQuota,
    })
    .from(userSubscription)
    .innerJoin(
      subscriptionPlan,
      eq(userSubscription.planId, subscriptionPlan.id),
    )
    .where(
      and(
        eq(userSubscription.userId, userId),
        eq(userSubscription.status, "active"),
      ),
    );

  if (!subscription) {
    return { hasSubscription: false, canCreate: false, used: 0, limit: 0 };
  }

  // Count non-ended events
  const now = new Date();
  const [result] = await db
    .select({ count: count() })
    .from(event)
    .where(and(eq(event.organizerId, userId), gte(event.endDate, now)));

  const used = result?.count ?? 0;
  const limit = subscription.eventQuota;
  const canCreate = limit === -1 || used < limit;

  return { hasSubscription: true, canCreate, used, limit };
}

export const createDraftEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/create-draft" })
  .input(createDraftEventSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Check subscription and quota
    const quota = await checkSubscriptionAndQuota(session.user.id);

    if (!quota.hasSubscription) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "You need an active subscription to create events. Please subscribe to a plan.",
      });
    }

    if (!quota.canCreate) {
      throw new ORPCError("FORBIDDEN", {
        message: `You have reached your event quota (${quota.used}/${quota.limit}). Please upgrade your plan or wait for existing events to end.`,
      });
    }

    try {
      const eventId = randomUUID();
      const now = new Date();

      await db.insert(event).values({
        id: eventId,
        title: input.title,
        smallDescription: input.description,
        bigDescription: input.bigDescription ?? null,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        location: input.location || null,
        organizerId: session.user.id,
        priceAmount: input.priceAmount ?? 0,
        priceCurrency: input.priceCurrency ?? "DZD",
        createdAt: now,
        updatedAt: now,
      });

      return {
        status: "success" as const,
        message: "Draft event created",
        eventId,
      };
    } catch (error) {
      console.error("Failed to create draft event:", error);
      const safeMessage =
        error instanceof Error ? error.message : "Failed to create draft event";
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: safeMessage,
      });
    }
  });
