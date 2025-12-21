import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  payment,
  userSubscription,
  subscriptionPlan,
  eventRegistration,
  event,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getPaymentStatusInputSchema,
  paymentStatusOutputSchema,
} from "@/lib/schemas/payment";

export const getPaymentStatusRouter = protectedProcedure
  .route({ method: "GET", path: "/payment/status" })
  .input(getPaymentStatusInputSchema)
  .output(paymentStatusOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // Get payment with related data
    const [paymentRecord] = await db
      .select()
      .from(payment)
      .where(and(eq(payment.id, input.paymentId), eq(payment.userId, userId)));

    if (!paymentRecord) {
      throw new ORPCError("NOT_FOUND", {
        message: "Payment not found",
      });
    }

    // Get subscription details if applicable
    let subscriptionData = null;
    if (paymentRecord.subscriptionId) {
      const [sub] = await db
        .select({
          subscription: userSubscription,
          plan: subscriptionPlan,
        })
        .from(userSubscription)
        .innerJoin(
          subscriptionPlan,
          eq(userSubscription.planId, subscriptionPlan.id),
        )
        .where(eq(userSubscription.id, paymentRecord.subscriptionId));

      if (sub) {
        subscriptionData = {
          id: sub.subscription.id,
          planName: sub.plan.displayName,
          status: sub.subscription.status,
        };
      }
    }

    // Get event registration details if applicable
    let eventRegistrationData = null;
    if (paymentRecord.registrationId) {
      const [reg] = await db
        .select({
          registration: eventRegistration,
          event: event,
        })
        .from(eventRegistration)
        .innerJoin(event, eq(eventRegistration.eventId, event.id))
        .where(eq(eventRegistration.id, paymentRecord.registrationId));

      if (reg) {
        eventRegistrationData = {
          id: reg.registration.id,
          eventId: reg.event.id,
          eventTitle: reg.event.title,
        };
      }
    }

    return {
      id: paymentRecord.id,
      status: paymentRecord.status,
      amount: paymentRecord.amount,
      currency: paymentRecord.currency,
      paymentMethod: paymentRecord.paymentMethod,
      chargilyCheckoutId: paymentRecord.chargilyCheckoutId,
      failureReason: paymentRecord.failureReason,
      paidAt: paymentRecord.paidAt,
      createdAt: paymentRecord.createdAt,
      subscription: subscriptionData,
      eventRegistration: eventRegistrationData,
    };
  });
