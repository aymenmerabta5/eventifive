import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventImages,
  files,
  eventTypeValues,
  eventStatusValues,
  user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputSchema = z.object({
  id: z.string().uuid(),
});

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  smallDescription: z.string().nullable(),
  bigDescription: z.unknown().nullable(),
  type: z.enum(eventTypeValues),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  theme: z.string().nullable(),
  priceAmount: z.number(),
  priceCurrency: z.string(),
  organizerId: z.string(),
  organizerName: z.string(),
  status: z.enum(eventStatusValues),
  cancellationReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  imageUrls: z.array(z.string()),
});

export const getEventRouter = publicProcedure
  .route({ method: "GET", path: "/events/{id}" })
  .input(inputSchema)
  .output(eventSchema)
  .handler(async ({ input, context }) => {
    try {
      const [found] = await db
        .select({
          id: event.id,
          title: event.title,
          smallDescription: event.smallDescription,
          bigDescription: event.bigDescription,
          type: event.type,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          theme: event.theme,
          priceAmount: event.priceAmount,
          priceCurrency: event.priceCurrency,
          organizerId: event.organizerId,
          organizerName: user.name,
          status: event.status,
          cancellationReason: event.cancellationReason,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })
        .from(event)
        .innerJoin(user, eq(event.organizerId, user.id))
        .where(eq(event.id, input.id))
        .limit(1);

      if (!found) {
        throw new ORPCError("NOT_FOUND", { message: "Event not found" });
      }

      // Check if current user is the organizer
      const isOrganizer = context.session?.user?.id === found.organizerId;

      // Draft and archived events are not publicly viewable
      // But organizers can always view their own events
      // Cancelled events are viewable by everyone with cancellation notice
      if (
        (found.status === "draft" || found.status === "archived") &&
        !isOrganizer
      ) {
        throw new ORPCError("NOT_FOUND", { message: "Event not found" });
      }

      // Get images from eventImages table
      const images = await db
        .select({ s3Key: files.s3Key })
        .from(eventImages)
        .innerJoin(files, eq(eventImages.fileId, files.id))
        .where(eq(eventImages.eventId, found.id));

      const imageUrlResults = await Promise.all(
        images.map(async (image) => {
          try {
            const { downloadUrl } = await generatePresignedDownloadUrl(
              image.s3Key,
            );
            return downloadUrl;
          } catch (error) {
            console.error(
              `Failed to generate image URL for event ${found.id}:`,
              error,
            );
            return null;
          }
        }),
      );

      // Filter out failed URLs
      const imageUrls = imageUrlResults.filter(
        (url): url is string => url !== null,
      );

      return {
        ...found,
        imageUrls,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to fetch event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch event",
      });
    }
  });
