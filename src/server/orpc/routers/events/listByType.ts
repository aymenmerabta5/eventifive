import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventImages, files, eventTypeValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

// TEACHING: We add imageUrl to the output schema
// This is the presigned URL that the client can use to display the image
// It's separate from the raw S3 key stored in the database
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

const inputSchema = z.object({
  eventType: z.enum(eventTypeValues),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().positive().max(50).default(9),
  search: z.string().optional(),
  sortBy: z
    .enum(["newest", "oldest", "title_asc", "title_desc"])
    .optional()
    .default("newest"),
});

const outputSchema = z.object({
  data: z.array(eventSchema),
  currentPage: z.number(),
  nextPage: z.number().nullable(),
});

export const listEventsByTypeRouter = publicProcedure
  .route({ method: "POST", path: "/events/by-type" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    try {
      const { eventType, page, limit, search, sortBy } = input;
      const offset = page * limit;

      // Build where conditions
      const conditions = [eq(event.type, eventType)];

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        // Use SQL template for proper null handling with ILIKE
        conditions.push(
          sql`(${event.title} ILIKE ${searchTerm} OR COALESCE(${event.smallDescription}, '') ILIKE ${searchTerm} OR COALESCE(${event.location}, '') ILIKE ${searchTerm})`,
        );
      }

      // Build order by clause
      let orderByClause;
      switch (sortBy) {
        case "oldest":
          orderByClause = asc(event.startDate);
          break;
        case "title_asc":
          orderByClause = asc(event.title);
          break;
        case "title_desc":
          orderByClause = desc(event.title);
          break;
        case "newest":
        default:
          orderByClause = desc(event.startDate);
          break;
      }

      const whereClause =
        conditions.length > 1 ? and(...conditions) : conditions[0]!;

      const events = await db
        .select()
        .from(event)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // TEACHING: Generate presigned URLs for each event's image from eventImages table
      // We use Promise.all to fetch all URLs in parallel for better performance
      // If an event has no image, we return null for the imageUrl
      const eventsWithImageUrls = await Promise.all(
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
              // TEACHING: If image URL generation fails, log but don't fail the whole request
              // The event card will show a fallback/placeholder image
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

      // Check if there are more pages
      const nextPageEvents = await db
        .select()
        .from(event)
        .where(whereClause)
        .limit(1)
        .offset(offset + limit);

      return {
        data: eventsWithImageUrls,
        currentPage: page,
        nextPage: nextPageEvents.length > 0 ? page + 1 : null,
      };
    } catch (error) {
      console.error("Failed to fetch events by type:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch events by type",
      });
    }
  });
