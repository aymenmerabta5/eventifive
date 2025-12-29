import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  payment,
  userSubscription,
  subscriptionPlan,
  eventRegistration,
  event,
} from "@/server/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { listPaymentsOutputSchema } from "@/lib/schemas/payment";

const inputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const listUserPaymentsRouter = protectedProcedure
  .route({ method: "GET", path: "/payment/list" })
  .input(inputSchema)
  .output(listPaymentsOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // Get all payments for this user
    const payments = await db
      .select()
      .from(payment)
      .where(eq(payment.userId, userId))
      .orderBy(desc(payment.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    // Collect all subscription and registration IDs for batch fetching
    // Note: subscriptionId is text (string), registrationId is integer (number)
    const subscriptionIds = payments
      .map((p) => p.subscriptionId)
      .filter((id): id is string => id !== null);
    const registrationIds = payments
      .map((p) => p.registrationId)
      .filter((id): id is number => id !== null);

    // BATCHED: Fetch all subscriptions with their plans in one query
    const subscriptionsMap = new Map<
      string,
      { subscription: typeof userSubscription.$inferSelect; plan: typeof subscriptionPlan.$inferSelect }
    >();
    if (subscriptionIds.length > 0) {
      const subscriptions = await db
        .select({
          subscription: userSubscription,
          plan: subscriptionPlan,
        })
        .from(userSubscription)
        .innerJoin(
          subscriptionPlan,
          eq(userSubscription.planId, subscriptionPlan.id),
        )
        .where(inArray(userSubscription.id, subscriptionIds));

      for (const sub of subscriptions) {
        subscriptionsMap.set(sub.subscription.id, sub);
      }
    }

    // BATCHED: Fetch all registrations with their events in one query
    const registrationsMap = new Map<
      number,
      { registration: typeof eventRegistration.$inferSelect; event: typeof event.$inferSelect }
    >();
    if (registrationIds.length > 0) {
      const registrations = await db
        .select({
          registration: eventRegistration,
          event: event,
        })
        .from(eventRegistration)
        .innerJoin(event, eq(eventRegistration.eventId, event.id))
        .where(inArray(eventRegistration.id, registrationIds));

      for (const reg of registrations) {
        registrationsMap.set(reg.registration.id, reg);
      }
    }

    // Map payments to result format using the pre-fetched data
    const result = payments.map((p) => {
      let type: "subscription" | "event_registration" = "subscription";
      let description = "";

      if (p.subscriptionId) {
        const sub = subscriptionsMap.get(p.subscriptionId);
        if (sub) {
          type = "subscription";
          description = `${sub.plan.displayName} Subscription`;
        }
      } else if (p.registrationId) {
        const reg = registrationsMap.get(p.registrationId);
        if (reg) {
          type = "event_registration";
          description = `Event: ${reg.event.title}`;
        }
      }

      return {
        id: p.id,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        type,
        description,
      };
    });

    return result;
  });
