import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { event, eventRegistration, payment } from "@/server/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import {
  getChargilyClient,
  generateCallbackUrls,
} from "@/server/gateway/chargily";
import { syncEventToChargily } from "@/server/gateway/chargilySyncEvent";
import { paymentMethodSchema } from "@/lib/schemas/payment";

// Helper to check if error is a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unique") ||
      message.includes("duplicate") ||
      message.includes("23505") // PostgreSQL unique violation code
    );
  }
  return false;
}

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

    // Check if event is published
    if (eventData.status !== "published") {
      throw new ORPCError("BAD_REQUEST", {
        message:
          eventData.status === "cancelled"
            ? "This event has been cancelled."
            : "This event is not available for registration.",
      });
    }

    if (eventData.priceAmount <= 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This is a free event. No payment required.",
      });
    }

    // 2. Check if user already registered
    const [existingReg] = await db
      .select({
        registration: eventRegistration,
        payment: payment,
      })
      .from(eventRegistration)
      .leftJoin(payment, eq(payment.registrationId, eventRegistration.id))
      .where(
        and(
          eq(eventRegistration.eventId, input.eventId),
          eq(eventRegistration.userId, userId),
        ),
      )
      .orderBy(eventRegistration.registeredAt);

    if (existingReg) {
      const { registration, payment: existingPayment } = existingReg;

      // If already paid, reject
      if (registration.paymentStatus === "paid") {
        throw new ORPCError("BAD_REQUEST", {
          message: "You are already registered for this event.",
        });
      }

      // If pending with a valid checkout, return the existing checkout URL
      if (
        registration.paymentStatus === "pending" &&
        existingPayment?.chargilyCheckoutId
      ) {
        // Check if the pending payment is still valid (created within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (existingPayment.createdAt > oneHourAgo) {
          const client = getChargilyClient();
          try {
            const checkout = await client.getCheckout(
              existingPayment.chargilyCheckoutId,
            );
            if (checkout && checkout.status === "pending") {
              return {
                paymentId: existingPayment.id,
                checkoutUrl: checkout.checkout_url,
                chargilyCheckoutId: existingPayment.chargilyCheckoutId,
                registrationId: registration.id,
              };
            }
          } catch {
            // Checkout expired or invalid, clean up and create new one
          }
        }

        // Clean up stale pending payment, keep the registration
        await db.delete(payment).where(eq(payment.id, existingPayment.id));
        // Update registration status back to unpaid for retry
        await db
          .update(eventRegistration)
          .set({ paymentStatus: "unpaid" })
          .where(eq(eventRegistration.id, registration.id));
      }
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
    let isNewRegistration = false;

    if (existingReg) {
      // Update existing registration to pending
      registrationId = existingReg.registration.id;
      await db
        .update(eventRegistration)
        .set({ paymentStatus: "pending" })
        .where(eq(eventRegistration.id, existingReg.registration.id));
    } else {
      // Create new registration with try-catch for race condition handling
      try {
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
        isNewRegistration = true;
      } catch (insertError) {
        // Handle race condition - another request may have created the registration
        if (isUniqueConstraintError(insertError)) {
          // Re-fetch the registration that was created concurrently
          const [raceConditionReg] = await db
            .select({
              registration: eventRegistration,
              payment: payment,
            })
            .from(eventRegistration)
            .leftJoin(payment, eq(payment.registrationId, eventRegistration.id))
            .where(
              and(
                eq(eventRegistration.eventId, input.eventId),
                eq(eventRegistration.userId, userId),
              ),
            );

          if (!raceConditionReg) {
            throw insertError; // Unexpected state, re-throw
          }

          const { registration, payment: existingPayment } = raceConditionReg;

          // If already paid, reject
          if (registration.paymentStatus === "paid") {
            throw new ORPCError("BAD_REQUEST", {
              message: "You are already registered for this event.",
            });
          }

          // If pending with a valid checkout, return it
          if (
            registration.paymentStatus === "pending" &&
            existingPayment?.chargilyCheckoutId
          ) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (existingPayment.createdAt > oneHourAgo) {
              const client = getChargilyClient();
              try {
                const checkout = await client.getCheckout(
                  existingPayment.chargilyCheckoutId,
                );
                if (checkout && checkout.status === "pending") {
                  return {
                    paymentId: existingPayment.id,
                    checkoutUrl: checkout.checkout_url,
                    chargilyCheckoutId: existingPayment.chargilyCheckoutId,
                    registrationId: registration.id,
                  };
                }
              } catch {
                // Checkout expired, continue to create new one
              }
            }
          }

          // Update existing registration to pending and continue
          registrationId = registration.id;
          await db
            .update(eventRegistration)
            .set({ paymentStatus: "pending" })
            .where(eq(eventRegistration.id, registration.id));
        } else {
          throw insertError;
        }
      }
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
      // If we created a new registration, delete it; otherwise revert status
      if (isNewRegistration) {
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
