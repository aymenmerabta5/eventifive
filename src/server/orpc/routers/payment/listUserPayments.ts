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
import { eq, desc } from "drizzle-orm";
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

    // Fetch related data for each payment
    const result = await Promise.all(
      payments.map(async (p) => {
        let type: "subscription" | "event_registration" = "subscription";
        let description = "";

        if (p.subscriptionId) {
          const [sub] = await db
            .select({
              subscription: userSubscription,
              plan: subscriptionPlan,
            })
            .from(userSubscription)
            .innerJoin(
              subscriptionPlan,
              eq(userSubscription.planId, subscriptionPlan.id)
            )
            .where(eq(userSubscription.id, p.subscriptionId));

          if (sub) {
            type = "subscription";
            description = `${sub.plan.displayName} Subscription`;
          }
        } else if (p.registrationId) {
          const [reg] = await db
            .select({
              registration: eventRegistration,
              event: event,
            })
            .from(eventRegistration)
            .innerJoin(event, eq(eventRegistration.eventId, event.id))
            .where(eq(eventRegistration.id, p.registrationId));

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
      })
    );

    return result;
  });
