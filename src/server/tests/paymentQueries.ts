/**
 * Payment query functions for testing
 */

import { db } from "@/server/db";
import {
  payment,
  eventRegistration,
  userSubscription,
  event,
  user,
} from "@/server/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { colors } from "./utils";

export type PaymentRecord = typeof payment.$inferSelect;

export interface PaymentWithDetails {
  payment: PaymentRecord;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  event: {
    id: string;
    title: string;
  } | null;
  subscription: {
    id: string;
    planId: string;
  } | null;
}

/**
 * Get all pending payments with related details
 */
export async function getPendingPaymentsWithDetails(): Promise<
  PaymentWithDetails[]
> {
  const payments = await db
    .select({
      payment: payment,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      event: {
        id: event.id,
        title: event.title,
      },
      subscription: {
        id: userSubscription.id,
        planId: userSubscription.planId,
      },
    })
    .from(payment)
    .leftJoin(user, eq(payment.userId, user.id))
    .leftJoin(
      eventRegistration,
      eq(payment.registrationId, eventRegistration.id),
    )
    .leftJoin(event, eq(eventRegistration.eventId, event.id))
    .leftJoin(userSubscription, eq(payment.subscriptionId, userSubscription.id))
    .where(eq(payment.status, "pending"));

  return payments;
}

/**
 * Get a specific payment by ID
 */
export async function getPaymentById(
  paymentId: string,
): Promise<PaymentRecord | null> {
  const [result] = await db
    .select()
    .from(payment)
    .where(eq(payment.id, paymentId));
  return result ?? null;
}

/**
 * Get all pending payments for a user
 */
export async function getPendingPaymentsByUserId(
  userId: string,
): Promise<PaymentRecord[]> {
  return db
    .select()
    .from(payment)
    .where(and(eq(payment.status, "pending"), eq(payment.userId, userId)));
}

/**
 * Get all pending payments for an event (registrations)
 */
export async function getPendingPaymentsByEventId(
  eventId: string,
): Promise<PaymentRecord[]> {
  const registrations = await db
    .select({ id: eventRegistration.id })
    .from(eventRegistration)
    .where(eq(eventRegistration.eventId, eventId));

  const regIds = registrations.map((r) => r.id);
  if (regIds.length === 0) return [];

  const allPending = await db
    .select()
    .from(payment)
    .where(eq(payment.status, "pending"));

  return allPending.filter(
    (p) => p.registrationId && regIds.includes(p.registrationId),
  );
}

/**
 * Get all pending subscription payments
 */
export async function getPendingSubscriptionPayments(): Promise<
  PaymentRecord[]
> {
  return db
    .select()
    .from(payment)
    .where(
      and(eq(payment.status, "pending"), isNotNull(payment.subscriptionId)),
    );
}

/**
 * Get all pending registration payments
 */
export async function getPendingRegistrationPayments(): Promise<
  PaymentRecord[]
> {
  return db
    .select()
    .from(payment)
    .where(
      and(eq(payment.status, "pending"), isNotNull(payment.registrationId)),
    );
}

/**
 * Print pending payments in a formatted way
 */
export function printPendingPayments(payments: PaymentWithDetails[]): void {
  console.log(`\n${colors.cyan}Pending Payments:${colors.reset}\n`);

  if (payments.length === 0) {
    console.log(`${colors.dim}  No pending payments found${colors.reset}`);
    return;
  }

  for (const p of payments) {
    const type = p.payment.subscriptionId
      ? `${colors.magenta}[Subscription]${colors.reset}`
      : `${colors.blue}[Registration]${colors.reset}`;

    const target = p.payment.subscriptionId
      ? `Plan: ${p.subscription?.planId ?? "Unknown"}`
      : `Event: ${p.event?.title ?? "Unknown"}`;

    console.log(`  ${type} ${colors.yellow}${p.payment.id}${colors.reset}`);
    console.log(`    User: ${p.user?.name} (${p.user?.email})`);
    console.log(`    ${target}`);
    console.log(`    Amount: ${p.payment.amount} ${p.payment.currency}`);
    console.log(`    Created: ${p.payment.createdAt.toISOString()}`);
    console.log();
  }

  console.log(
    `${colors.dim}Total: ${payments.length} pending payment(s)${colors.reset}\n`,
  );
}
