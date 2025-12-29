import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventImages,
  files,
  eventTypeValues,
  type EventType,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, desc, gt, and, inArray } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

// TEACHING: eventSchema now includes imageUrl for the presigned S3 URL
const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  smallDescription: z.string().nullable(),
  type: z.enum(eventTypeValues),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  organizerId: z.string(),
  priceAmount: z.number(),
  priceCurrency: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  imageUrl: z.string().nullable(),
});

const outputListEventsSchema = z.object({
  congress: z.array(eventSchema).max(3),
  seminar: z.array(eventSchema).max(3),
  workshop: z.array(eventSchema).max(3),
  scientific_meeting: z.array(eventSchema).max(3),
  conference: z.array(eventSchema).max(3),
  symposium: z.array(eventSchema).max(3),
});

// TEACHING: We define a type for events with imageUrl
// This is the shape returned to clients, not the raw DB shape
type EventWithImageUrl = z.infer<typeof eventSchema>;

type GroupedEvents = {
  [K in EventType]: EventWithImageUrl[];
};

export const listEventsRouter = publicProcedure
  .route({ method: "GET", path: "/events" })
  .output(outputListEventsSchema)
  .handler(async () => {
    try {
      const eventTypes = eventTypeValues;

      const grouped: GroupedEvents = {
        congress: [],
        seminar: [],
        workshop: [],
        scientific_meeting: [],
        conference: [],
        symposium: [],
      };

      // Fetch 3 upcoming events for each type
      const now = new Date();
      await Promise.all(
        eventTypes.map(async (type) => {
          const events = await db
            .select()
            .from(event)
            .where(
              and(
                eq(event.type, type),
                gt(event.startDate, now),
                eq(event.status, "published")
              )
            )
            .orderBy(desc(event.startDate))
            .limit(3);

          grouped[type] = events.map((evt) => ({ ...evt, imageUrl: null }));
        }),
      );

      // BATCHED: Collect all event IDs and fetch images in one query
      const allEventIds = Object.values(grouped)
        .flat()
        .map((evt) => evt.id);

      if (allEventIds.length > 0) {
        // Batch fetch all images for all events in one query
        const allImages = await db
          .select({
            eventId: eventImages.eventId,
            s3Key: files.s3Key,
          })
          .from(eventImages)
          .innerJoin(files, eq(eventImages.fileId, files.id))
          .where(inArray(eventImages.eventId, allEventIds));

        // Create a map of eventId -> s3Key (first image per event)
        const imageMap = new Map<string, string>();
        for (const img of allImages) {
          if (!imageMap.has(img.eventId)) {
            imageMap.set(img.eventId, img.s3Key);
          }
        }

        // Generate presigned URLs for all images in parallel
        const urlPromises: Promise<{ eventId: string; url: string | null }>[] =
          [];
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
        for (const type of eventTypes) {
          grouped[type] = grouped[type].map((evt) => ({
            ...evt,
            imageUrl: urlMap.get(evt.id) ?? null,
          }));
        }
      }

      return grouped;
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch events",
      });
    }
  });
