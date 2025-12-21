import { verifySignature } from "@chargily/chargily-pay";
import { env } from "@/env";
import { db } from "@/server/db";
import {
  payment,
  userSubscription,
  eventRegistration,
  event,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { invalidateDashboardCache } from "@/server/cache";

interface ChargilyWebhookData {
  id: string;
  entity: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  metadata: Record<string, string> | null;
}

interface ChargilyWebhookEvent {
  type: string;
  data: ChargilyWebhookData;
}

export async function POST(request: Request) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("signature") ?? "";

    // 2. Verify signature
    if (!env.CHARGILY_SK) {
      console.error("Webhook received but CHARGILY_SK is not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 },
      );
    }

    if (
      !signature ||
      !verifySignature(Buffer.from(rawBody), signature, env.CHARGILY_SK)
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 3. Parse event
    const event: ChargilyWebhookEvent = JSON.parse(rawBody);
    const { type, data } = event;

    console.log(`Received Chargily webhook: ${type}`, { checkoutId: data.id });

    // 4. Extract our paymentId from metadata
    const paymentId = data.metadata?.paymentId;
    if (!paymentId) {
      console.error("Missing paymentId in webhook metadata", data.metadata);
      return NextResponse.json(
        { error: "Missing paymentId in metadata" },
        { status: 400 },
      );
    }

    // 5. Get payment record
    const [paymentRecord] = await db
      .select()
      .from(payment)
      .where(eq(payment.id, paymentId));

    if (!paymentRecord) {
      console.error(`Payment not found: ${paymentId}`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 6. Check if already processed (idempotency)
    if (paymentRecord.status === "paid" && type === "checkout.paid") {
      console.log(`Payment ${paymentId} already processed, skipping`);
      return NextResponse.json({ status: "already_processed" });
    }

    // 7. Handle event types
    switch (type) {
      case "checkout.paid":
        await handlePaymentSuccess(paymentRecord, data);
        break;
      case "checkout.failed":
        await handlePaymentFailure(paymentRecord, data);
        break;
      case "checkout.expired":
        await handlePaymentExpired(paymentRecord);
        break;
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(
  paymentRecord: typeof payment.$inferSelect,
  data: ChargilyWebhookData,
) {
  const now = new Date();

  // Update payment status
  await db
    .update(payment)
    .set({
      status: "paid",
      paymentMethod: data.payment_method,
      paidAt: now,
      providerData: data,
    })
    .where(eq(payment.id, paymentRecord.id));

  // Update subscription if applicable
  if (paymentRecord.subscriptionId) {
    await db
      .update(userSubscription)
      .set({
        status: "active",
        updatedAt: now,
      })
      .where(eq(userSubscription.id, paymentRecord.subscriptionId));

    console.log(
      `Subscription ${paymentRecord.subscriptionId} activated for payment ${paymentRecord.id}`,
    );
  }

  // Update event registration if applicable
  if (paymentRecord.registrationId) {
    await db
      .update(eventRegistration)
      .set({
        paymentStatus: "paid",
      })
      .where(eq(eventRegistration.id, paymentRecord.registrationId));

    // Get the event to find the organizer and invalidate their dashboard cache
    const [registration] = await db
      .select({ eventId: eventRegistration.eventId })
      .from(eventRegistration)
      .where(eq(eventRegistration.id, paymentRecord.registrationId));

    if (registration) {
      const [eventData] = await db
        .select({ organizerId: event.organizerId })
        .from(event)
        .where(eq(event.id, registration.eventId));

      if (eventData) {
        await invalidateDashboardCache(eventData.organizerId);
      }
    }

    console.log(
      `Event registration ${paymentRecord.registrationId} marked as paid for payment ${paymentRecord.id}`,
    );
  }

  console.log(`Payment ${paymentRecord.id} marked as paid`);
}

async function handlePaymentFailure(
  paymentRecord: typeof payment.$inferSelect,
  data: ChargilyWebhookData,
) {
  // Update payment with failure info
  await db
    .update(payment)
    .set({
      status: "unpaid",
      failureReason: `Payment failed with status: ${data.status}`,
      providerData: data,
    })
    .where(eq(payment.id, paymentRecord.id));

  // Keep subscription as pending - user can retry
  console.log(`Payment ${paymentRecord.id} marked as failed`);
}

async function handlePaymentExpired(
  paymentRecord: typeof payment.$inferSelect,
) {
  // Update payment status
  await db
    .update(payment)
    .set({
      status: "unpaid",
      failureReason: "Checkout session expired",
    })
    .where(eq(payment.id, paymentRecord.id));

  // Delete pending subscription if exists
  if (paymentRecord.subscriptionId) {
    await db
      .delete(userSubscription)
      .where(eq(userSubscription.id, paymentRecord.subscriptionId));

    console.log(
      `Pending subscription ${paymentRecord.subscriptionId} deleted due to expired checkout`,
    );
  }

  console.log(`Payment ${paymentRecord.id} expired`);
}
