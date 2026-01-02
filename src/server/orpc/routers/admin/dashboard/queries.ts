import { db } from "@/server/db";
import {
  user,
  event,
  eventRegistration,
  payment,
  userSubscription,
} from "@/server/db/schema";
import { eq, and, gte, lte, count, sum } from "drizzle-orm";

/**
 * Get total users count (platform-wide)
 */
export async function getTotalUsers(): Promise<number> {
  const result = await db.select({ total: count() }).from(user);
  return result[0]?.total ?? 0;
}

/**
 * Get users count for a specific date range
 */
export async function getUsersInRange(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await db
    .select({ total: count() })
    .from(user)
    .where(and(gte(user.createdAt, startDate), lte(user.createdAt, endDate)));

  return result[0]?.total ?? 0;
}

/**
 * Get total events count (platform-wide)
 */
export async function getTotalEvents(): Promise<number> {
  const result = await db.select({ total: count() }).from(event);
  return result[0]?.total ?? 0;
}

/**
 * Get events count for a specific date range
 */
export async function getEventsInRange(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await db
    .select({ total: count() })
    .from(event)
    .where(and(gte(event.createdAt, startDate), lte(event.createdAt, endDate)));

  return result[0]?.total ?? 0;
}

/**
 * Get total revenue (platform-wide)
 */
export async function getTotalRevenue(): Promise<number> {
  const result = await db
    .select({ total: sum(payment.amount) })
    .from(payment)
    .where(eq(payment.status, "paid"));

  return Number(result[0]?.total ?? 0);
}

/**
 * Get revenue for a specific date range
 */
export async function getRevenueInRange(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await db
    .select({ total: sum(payment.amount) })
    .from(payment)
    .where(
      and(
        eq(payment.status, "paid"),
        gte(payment.paidAt, startDate),
        lte(payment.paidAt, endDate),
      ),
    );

  return Number(result[0]?.total ?? 0);
}

/**
 * Get active subscriptions count
 */
export async function getActiveSubscriptions(): Promise<number> {
  const result = await db
    .select({ total: count() })
    .from(userSubscription)
    .where(eq(userSubscription.status, "active"));

  return result[0]?.total ?? 0;
}

/**
 * Get subscriptions count for a specific date range
 */
export async function getSubscriptionsInRange(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await db
    .select({ total: count() })
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.status, "active"),
        gte(userSubscription.createdAt, startDate),
        lte(userSubscription.createdAt, endDate),
      ),
    );

  return result[0]?.total ?? 0;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
