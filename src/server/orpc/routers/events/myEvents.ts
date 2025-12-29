import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventImages, files, eventTypeValues, eventStatusValues } from "@/server/db/schema";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  smallDescription: z.string().nullable(),
  type: z.enum(eventTypeValues),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  theme: z.string().nullable(),
  organizerId: z.string(),
  priceAmount: z.number(),
  priceCurrency: z.string(),
  chargilyProductId: z.string().nullable(),
  chargilyPriceId: z.string().nullable(),
  status: z.enum(eventStatusValues),
  publishedAt: z.date().nullable(),
  cancelledAt: z.date().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  imageUrl: z.string().nullable(),
});

const outputSchema = z.object({
  events: z.array(eventSchema),
  total: z.number(),
});

export const myEventsRouter = protectedProcedure
  .route({ method: "GET", path: "/events/mine" })
  .output(outputSchema)
  .handler(async ({ context }) => {
    const { session } = context;
    const userId = session.user.id;

    const events = await db
      .select()
      .from(event)
      .where(eq(event.organizerId, userId))
      .orderBy(desc(event.createdAt));

    // Initialize events with null imageUrl
    let eventsWithUrls = events.map((evt) => ({ ...evt, imageUrl: null as string | null }));

    if (events.length > 0) {
      const eventIds = events.map((evt) => evt.id);

      // BATCHED: Fetch all images for all events in one query
      const allImages = await db
        .select({
          eventId: eventImages.eventId,
          s3Key: files.s3Key,
        })
        .from(eventImages)
        .innerJoin(files, eq(eventImages.fileId, files.id))
        .where(inArray(eventImages.eventId, eventIds));

      // Create a map of eventId -> s3Key (first image per event)
      const imageMap = new Map<string, string>();
      for (const img of allImages) {
        if (!imageMap.has(img.eventId)) {
          imageMap.set(img.eventId, img.s3Key);
        }
      }

      // Generate presigned URLs for all images in parallel
      const urlPromises: Promise<{ eventId: string; url: string | null }>[] = [];
      for (const [eventId, s3Key] of imageMap) {
        urlPromises.push(
          generatePresignedDownloadUrl(s3Key)
            .then(({ downloadUrl }) => ({ eventId, url: downloadUrl }))
            .catch((error) => {
              console.error(
                `Failed to generate image URL for event ${eventId}:`,
                error,
              );
              return { eventId, url: null };
            }),
        );
      }

      const urlResults = await Promise.all(urlPromises);
      const urlMap = new Map(urlResults.map((r) => [r.eventId, r.url]));

      // Apply URLs to all events
      eventsWithUrls = eventsWithUrls.map((evt) => ({
        ...evt,
        imageUrl: urlMap.get(evt.id) ?? null,
      }));
    }

    return {
      events: eventsWithUrls,
      total: eventsWithUrls.length,
    };
  });
