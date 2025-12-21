import { db } from "@/server/db";
import {
  event,
  eventRegistration,
  payment,
  submission,
} from "@/server/db/schema";
import { eq, and, sql, gte, lte, count, sum } from "drizzle-orm";

/**
 * Get total revenue from paid event registrations for an organizer
 */
export async function getTotalRevenue(organizerId: string): Promise<number> {
  const result = await db
    .select({
      total: sum(payment.amount),
    })
    .from(payment)
    .innerJoin(
      eventRegistration,
      eq(payment.registrationId, eventRegistration.id)
    )
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(and(eq(event.organizerId, organizerId), eq(payment.status, "paid")));

  return Number(result[0]?.total ?? 0);
}

/**
 * Get total revenue for a specific date range
 */
export async function getRevenueInRange(
  organizerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await db
    .select({
      total: sum(payment.amount),
    })
    .from(payment)
    .innerJoin(
      eventRegistration,
      eq(payment.registrationId, eventRegistration.id)
    )
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(
      and(
        eq(event.organizerId, organizerId),
        eq(payment.status, "paid"),
        gte(payment.paidAt, startDate),
        lte(payment.paidAt, endDate)
      )
    );

  return Number(result[0]?.total ?? 0);
}

/**
 * Get total participants across all organizer's events
 */
export async function getTotalParticipants(
  organizerId: string
): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(eventRegistration)
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(eq(event.organizerId, organizerId));

  return result[0]?.total ?? 0;
}

/**
 * Get participants count for a specific date range
 */
export async function getParticipantsInRange(
  organizerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(eventRegistration)
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(
      and(
        eq(event.organizerId, organizerId),
        gte(eventRegistration.registeredAt, startDate),
        lte(eventRegistration.registeredAt, endDate)
      )
    );

  return result[0]?.total ?? 0;
}

/**
 * Get total events count for an organizer
 */
export async function getTotalEvents(organizerId: string): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(event)
    .where(eq(event.organizerId, organizerId));

  return result[0]?.total ?? 0;
}

/**
 * Get events count for a specific date range
 */
export async function getEventsInRange(
  organizerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(event)
    .where(
      and(
        eq(event.organizerId, organizerId),
        gte(event.createdAt, startDate),
        lte(event.createdAt, endDate)
      )
    );

  return result[0]?.total ?? 0;
}

/**
 * Get total submissions count for an organizer's events
 */
export async function getTotalSubmissions(
  organizerId: string
): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(submission)
    .innerJoin(event, eq(submission.eventId, event.id))
    .where(eq(event.organizerId, organizerId));

  return result[0]?.total ?? 0;
}

/**
 * Get submissions count for a specific date range
 */
export async function getSubmissionsInRange(
  organizerId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await db
    .select({
      total: count(),
    })
    .from(submission)
    .innerJoin(event, eq(submission.eventId, event.id))
    .where(
      and(
        eq(event.organizerId, organizerId),
        gte(submission.submittedAt, startDate),
        lte(submission.submittedAt, endDate)
      )
    );

  return result[0]?.total ?? 0;
}

/**
 * Get time series data for registrations and revenue
 */
export async function getTimeSeriesData(
  organizerId: string,
  days: number
): Promise<Array<{ date: string; registrations: number; revenue: number }>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get daily registrations
  const registrationsData = await db
    .select({
      date: sql<string>`DATE(${eventRegistration.registeredAt})`.as("date"),
      count: count(),
    })
    .from(eventRegistration)
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(
      and(
        eq(event.organizerId, organizerId),
        gte(eventRegistration.registeredAt, startDate),
        lte(eventRegistration.registeredAt, endDate)
      )
    )
    .groupBy(sql`DATE(${eventRegistration.registeredAt})`)
    .orderBy(sql`DATE(${eventRegistration.registeredAt})`);

  // Get daily revenue
  const revenueData = await db
    .select({
      date: sql<string>`DATE(${payment.paidAt})`.as("date"),
      total: sum(payment.amount),
    })
    .from(payment)
    .innerJoin(
      eventRegistration,
      eq(payment.registrationId, eventRegistration.id)
    )
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(
      and(
        eq(event.organizerId, organizerId),
        eq(payment.status, "paid"),
        gte(payment.paidAt, startDate),
        lte(payment.paidAt, endDate)
      )
    )
    .groupBy(sql`DATE(${payment.paidAt})`)
    .orderBy(sql`DATE(${payment.paidAt})`);

  // Create a map for easy lookup
  const registrationsMap = new Map(
    registrationsData.map((r) => [r.date, r.count])
  );
  const revenueMap = new Map(
    revenueData.map((r) => [r.date, Number(r.total ?? 0)])
  );

  // Generate all dates in the range
  const result: Array<{ date: string; registrations: number; revenue: number }> =
    [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]!;
    result.push({
      date: dateStr,
      registrations: registrationsMap.get(dateStr) ?? 0,
      revenue: revenueMap.get(dateStr) ?? 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
