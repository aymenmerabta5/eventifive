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
import { eq, desc, gt, and } from "drizzle-orm";
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

      // Fetch 3 upcoming events for each type and generate image URLs
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

          // TEACHING: Generate presigned URLs for each event's image from eventImages table
          const eventsWithUrls = await Promise.all(
            events.map(async (evt) => {
              let imageUrl: string | null = null;

              // Get default image from eventImages table
              const [defaultImage] = await db
                .select({ s3Key: files.s3Key })
                .from(eventImages)
                .innerJoin(files, eq(eventImages.fileId, files.id))
                .where(eq(eventImages.eventId, evt.id))
                .limit(1);

              if (defaultImage?.s3Key) {
                try {
                  const { downloadUrl } = await generatePresignedDownloadUrl(
                    defaultImage.s3Key,
                  );
                  imageUrl = downloadUrl;
                } catch (error) {
                  console.error(
                    `Failed to generate image URL for event ${evt.id}:`,
                    error,
                  );
                }
              }

              return {
                ...evt,
                imageUrl,
              };
            }),
          );

          grouped[type] = eventsWithUrls;
        }),
      );

      return grouped;
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch events",
      });
    }
  });
