import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { getChargilyClient } from "./chargily";
import { eq, isNull, gt, and } from "drizzle-orm";

export interface EventSyncResult {
  productsCreated: number;
  pricesCreated: number;
  errors: string[];
}

/**
 * Sync a single event to Chargily (create product + price)
 * Only syncs if priceAmount > 0 and not already synced
 */
export async function syncEventToChargily(eventId: string): Promise<EventSyncResult> {
  const result: EventSyncResult = {
    productsCreated: 0,
    pricesCreated: 0,
    errors: [],
  };

  const client = getChargilyClient();

  // Get the event
  const [eventData] = await db.select().from(event).where(eq(event.id, eventId));

  if (!eventData) {
    result.errors.push(`Event ${eventId} not found`);
    return result;
  }

  // Free event - no sync needed
  if (eventData.priceAmount <= 0) {
    return result;
  }

  // Create product if not exists
  // Sanitize description: strip HTML tags and truncate to 255 chars for Chargily
  let sanitizedDescription: string | undefined;
  if (eventData.description) {
    // Remove HTML tags and trim
    sanitizedDescription = eventData.description
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 255);
    if (sanitizedDescription.length === 0) {
      sanitizedDescription = undefined;
    }
  }

  if (!eventData.chargilyProductId) {
    try {
      const chargilyProduct = await client.createProduct({
        name: eventData.title.slice(0, 100), // Ensure name isn't too long
        description: sanitizedDescription,
      });

      await db
        .update(event)
        .set({
          chargilyProductId: chargilyProduct.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(event.id, eventId));

      // Update local reference for price creation
      eventData.chargilyProductId = chargilyProduct.id;
      result.productsCreated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      result.errors.push(`Failed to create product for event "${eventData.title}": ${message}`);
      return result;
    }
  }

  // Create price if not exists
  if (!eventData.chargilyPriceId && eventData.chargilyProductId) {
    try {
      const chargilyPrice = await client.createPrice({
        amount: eventData.priceAmount,
        currency: eventData.priceCurrency.toLowerCase() as "dzd",
        product_id: eventData.chargilyProductId,
        metadata: {
          eventId: eventData.id,
          eventTitle: eventData.title,
        },
      });

      await db
        .update(event)
        .set({
          chargilyPriceId: chargilyPrice.id,
          chargilySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(event.id, eventId));

      result.pricesCreated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      result.errors.push(`Failed to create price for event "${eventData.title}": ${message}`);
    }
  }

  return result;
}

/**
 * Sync all unsynced paid events to Chargily
 */
export async function syncAllEventsToChargily(): Promise<EventSyncResult> {
  const result: EventSyncResult = {
    productsCreated: 0,
    pricesCreated: 0,
    errors: [],
  };

  // Get paid events without Chargily price ID
  const unsyncedEvents = await db
    .select()
    .from(event)
    .where(and(gt(event.priceAmount, 0), isNull(event.chargilyPriceId)));

  for (const ev of unsyncedEvents) {
    const syncResult = await syncEventToChargily(ev.id);
    result.productsCreated += syncResult.productsCreated;
    result.pricesCreated += syncResult.pricesCreated;
    result.errors.push(...syncResult.errors);
  }

  return result;
}

/**
 * Clear sync status for an event (useful for re-syncing after price change)
 */
export async function clearEventSync(eventId: string): Promise<void> {
  await db
    .update(event)
    .set({
      chargilyProductId: null,
      chargilyPriceId: null,
      chargilySyncedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(event.id, eventId));
}
