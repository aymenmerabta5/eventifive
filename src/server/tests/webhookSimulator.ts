/**
 * Webhook simulator for testing Chargily payment flows
 *
 * Since Chargily doesn't invoke webhooks in test mode, i hate that
 * so much thats why i created this module.
 *
 * This module creates properly signed webhook payloads and POSTs them
 * to /api/webhooks/chargily to test the full webhook flow.
 */

import { createHmac } from "crypto";
import { env } from "@/env";
import { db } from "@/server/db";
import { payment } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  type WebhookEventType,
  type ChargilyWebhookData,
  type ChargilyWebhookEvent,
  colors,
} from "./utils";
import type { PaymentRecord } from "./paymentQueries";

export interface SimulateWebhookResult {
  success: boolean;
  paymentId: string;
  eventType: WebhookEventType;
  webhookEvent: ChargilyWebhookEvent;
  httpStatus: number;
  message: string;
}

/**
 * Create HMAC-SHA256 signature like Chargily does
 */
function createSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Build a mock Chargily webhook data object
 */
function buildWebhookData(
  paymentRecord: PaymentRecord,
  eventType: WebhookEventType,
): ChargilyWebhookData {
  const statusMap: Record<WebhookEventType, string> = {
    "checkout.paid": "paid",
    "checkout.failed": "failed",
    "checkout.expired": "expired",
  };

  return {
    id: paymentRecord.chargilyCheckoutId ?? `test_checkout_${Date.now()}`,
    entity: "checkout",
    status: statusMap[eventType],
    amount: paymentRecord.amount,
    currency: paymentRecord.currency,
    payment_method: "edahabia",
    metadata: {
      paymentId: paymentRecord.id,
      userId: paymentRecord.userId,
      ...(paymentRecord.subscriptionId && {
        subscriptionId: paymentRecord.subscriptionId,
      }),
      ...(paymentRecord.registrationId && {
        registrationId: String(paymentRecord.registrationId),
      }),
    },
  };
}

/**
 * Build the full webhook event payload
 */
function buildWebhookEvent(
  paymentRecord: PaymentRecord,
  eventType: WebhookEventType,
): ChargilyWebhookEvent {
  return {
    type: eventType,
    data: buildWebhookData(paymentRecord, eventType),
  };
}

/**
 * Get the webhook URL (supports custom base URL for testing)
 */
function getWebhookUrl(baseUrl?: string): string {
  const base = (baseUrl ?? env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  return `${base}/api/webhooks/chargily`;
}

/**
 * Simulate a Chargily webhook by POSTing to the actual endpoint
 */
export async function simulateWebhook(
  paymentRecord: PaymentRecord,
  eventType: WebhookEventType = "checkout.paid",
  baseUrl?: string,
): Promise<SimulateWebhookResult> {
  const webhookEvent = buildWebhookEvent(paymentRecord, eventType);
  const payload = JSON.stringify(webhookEvent);

  // Create signature using CHARGILY_SK (same key used for verification)
  const secret = env.CHARGILY_SK;
  if (!secret) {
    return {
      success: false,
      paymentId: paymentRecord.id,
      eventType,
      webhookEvent,
      httpStatus: 0,
      message: "CHARGILY_SK environment variable is not set",
    };
  }

  const signature = createSignature(payload, secret);
  const webhookUrl = getWebhookUrl(baseUrl);

  console.log(
    `  ${colors.dim}POST ${webhookUrl}${colors.reset}`,
  );

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        signature: signature,
      },
      body: payload,
    });

    const responseBody = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        success: true,
        paymentId: paymentRecord.id,
        eventType,
        webhookEvent,
        httpStatus: response.status,
        message: responseBody.status ?? "Webhook processed successfully",
      };
    } else {
      return {
        success: false,
        paymentId: paymentRecord.id,
        eventType,
        webhookEvent,
        httpStatus: response.status,
        message: responseBody.error ?? `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      paymentId: paymentRecord.id,
      eventType,
      webhookEvent,
      httpStatus: 0,
      message:
        error instanceof Error
          ? `Network error: ${error.message}`
          : "Unknown error",
    };
  }
}

/**
 * Simulate webhooks for multiple payments
 */
export async function simulateWebhookBatch(
  payments: PaymentRecord[],
  eventType: WebhookEventType = "checkout.paid",
  baseUrl?: string,
): Promise<SimulateWebhookResult[]> {
  const results: SimulateWebhookResult[] = [];

  for (const p of payments) {
    const result = await simulateWebhook(p, eventType, baseUrl);
    results.push(result);
  }

  return results;
}

/**
 * Quick helper: Simulate paid webhook for a payment by ID
 */
export async function simulatePaidById(
  paymentId: string,
  baseUrl?: string,
): Promise<SimulateWebhookResult | null> {
  const [paymentRecord] = await db
    .select()
    .from(payment)
    .where(eq(payment.id, paymentId));

  if (!paymentRecord) {
    return null;
  }

  return simulateWebhook(paymentRecord, "checkout.paid", baseUrl);
}

/**
 * Quick helper: Simulate failed webhook for a payment by ID
 */
export async function simulateFailedById(
  paymentId: string,
  baseUrl?: string,
): Promise<SimulateWebhookResult | null> {
  const [paymentRecord] = await db
    .select()
    .from(payment)
    .where(eq(payment.id, paymentId));

  if (!paymentRecord) {
    return null;
  }

  return simulateWebhook(paymentRecord, "checkout.failed", baseUrl);
}

/**
 * Quick helper: Simulate expired webhook for a payment by ID
 */
export async function simulateExpiredById(
  paymentId: string,
  baseUrl?: string,
): Promise<SimulateWebhookResult | null> {
  const [paymentRecord] = await db
    .select()
    .from(payment)
    .where(eq(payment.id, paymentId));

  if (!paymentRecord) {
    return null;
  }

  return simulateWebhook(paymentRecord, "checkout.expired", baseUrl);
}
