import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, eventRegistration, payment } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getChargilyClient,
  generateCallbackUrls,
} from "@/server/gateway/chargily";
import { syncEventToChargily } from "@/server/gateway/chargilySyncEvent";
import { paymentMethodSchema } from "@/lib/schemas/payment";

const inputSchema = z.object({
  eventId: z.string().min(1),
  paymentMethod: paymentMethodSchema.optional(),
});

const outputSchema = z.object({
  paymentId: z.string(),
  checkoutUrl: z.string().url(),
  chargilyCheckoutId: z.string(),
  registrationId: z.number(),
});

export const createEventCheckoutRouter = protectedProcedure
  .route({ method: "POST", path: "/payment/event-checkout" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // 1. Get event and verify it's a paid event
    const [eventData] = await db
      .select()
      .from(event)
      .where(eq(event.id, input.eventId));

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData.priceAmount <= 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This is a free event. No payment required.",
      });
    }

    // 2. Check if user already registered and paid
    const [existingReg] = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, input.eventId),
          eq(eventRegistration.userId, userId),
        ),
      );

    if (existingReg && existingReg.paymentStatus === "paid") {
      throw new ORPCError("BAD_REQUEST", {
        message: "You are already registered for this event.",
      });
    }

    // 3. Ensure event is synced to Chargily
    if (!eventData.chargilyPriceId) {
      const syncResult = await syncEventToChargily(eventData.id);
      if (syncResult.errors.length > 0) {
        console.error("Failed to sync event to Chargily:", syncResult.errors);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message:
            "Event payment is not yet configured. Please try again later.",
        });
      }
      // Refetch event to get Chargily IDs
      const [refreshed] = await db
        .select()
        .from(event)
        .where(eq(event.id, input.eventId));
      if (!refreshed?.chargilyPriceId) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to configure event payment.",
        });
      }
      eventData.chargilyPriceId = refreshed.chargilyPriceId;
    }

    // 4. Create or update registration with pending status
    const now = new Date();
    let registrationId: number;

    if (existingReg) {
      // Update existing registration to pending
      registrationId = existingReg.id;
      await db
        .update(eventRegistration)
        .set({ paymentStatus: "pending" })
        .where(eq(eventRegistration.id, existingReg.id));
    } else {
      // Create new registration
      const [newReg] = await db
        .insert(eventRegistration)
        .values({
          eventId: input.eventId,
          userId,
          roleAtEvent: "participant",
          registeredAt: now,
          paymentStatus: "pending",
        })
        .returning({ id: eventRegistration.id });
      if (!newReg) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create registration",
        });
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
      createdAt: now,
    });

    // 6. Create Chargily checkout
    const client = getChargilyClient();
    const callbackUrls = generateCallbackUrls(paymentId);

    try {
      const checkout = await client.createCheckout({
        items: [
          {
            price: eventData.chargilyPriceId,
            quantity: 1,
          },
        ],
        success_url: callbackUrls.success_url,
        failure_url: callbackUrls.failure_url,
        payment_method: input.paymentMethod,
        metadata: {
          paymentId,
          userId,
          eventId: input.eventId,
          registrationId: String(registrationId),
          type: "event_registration",
        },
      });

      // 7. Update payment with Chargily checkout ID
      await db
        .update(payment)
        .set({ chargilyCheckoutId: checkout.id })
        .where(eq(payment.id, paymentId));

      return {
        paymentId,
        checkoutUrl: checkout.checkout_url,
        chargilyCheckoutId: checkout.id,
        registrationId,
      };
    } catch (error) {
      // Rollback: delete payment record
      await db.delete(payment).where(eq(payment.id, paymentId));
      // If we created a new registration, delete it too
      if (!existingReg) {
        await db
          .delete(eventRegistration)
          .where(eq(eventRegistration.id, registrationId));
      } else {
        // Revert status to unpaid
        await db
          .update(eventRegistration)
          .set({ paymentStatus: "unpaid" })
          .where(eq(eventRegistration.id, registrationId));
      }

      console.error("Failed to create Chargily checkout:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create checkout. Please try again.",
      });
    }
  });
