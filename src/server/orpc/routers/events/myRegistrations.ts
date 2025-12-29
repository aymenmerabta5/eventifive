import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventRegistration,
  eventImages,
  files,
  eventTypeValues,
  paymentStatusValues,
} from "@/server/db/schema";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const registrationSchema = z.object({
  id: z.number(),
  eventId: z.string(),
  roleAtEvent: z.string(),
  registeredAt: z.date(),
  paymentStatus: z.enum(paymentStatusValues),
  event: z.object({
    id: z.string(),
    title: z.string(),
    smallDescription: z.string().nullable(),
    type: z.enum(eventTypeValues),
    startDate: z.date(),
    endDate: z.date(),
    location: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
});

const outputSchema = z.object({
  registrations: z.array(registrationSchema),
  total: z.number(),
});

export const myRegistrationsRouter = protectedProcedure
  .route({ method: "GET", path: "/events/my-registrations" })
  .output(outputSchema)
  .handler(async ({ context }) => {
    const { session } = context;
    const userId = session.user.id;

    const registrations = await db
      .select({
        id: eventRegistration.id,
        eventId: eventRegistration.eventId,
        roleAtEvent: eventRegistration.roleAtEvent,
        registeredAt: eventRegistration.registeredAt,
        paymentStatus: eventRegistration.paymentStatus,
        event: {
          id: event.id,
          title: event.title,
          smallDescription: event.smallDescription,
          type: event.type,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
        },
      })
      .from(eventRegistration)
      .innerJoin(event, eq(eventRegistration.eventId, event.id))
      .where(eq(eventRegistration.userId, userId))
      .orderBy(desc(event.startDate));

    // Initialize registrations with null imageUrl
    let registrationsWithImages = registrations.map((reg) => ({
      ...reg,
      event: {
        ...reg.event,
        imageUrl: null as string | null,
      },
    }));

    if (registrations.length > 0) {
      const eventIds = registrations.map((reg) => reg.eventId);

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

      // Apply URLs to all registrations
      registrationsWithImages = registrationsWithImages.map((reg) => ({
        ...reg,
        event: {
          ...reg.event,
          imageUrl: urlMap.get(reg.eventId) ?? null,
        },
      }));
    }

    return {
      registrations: registrationsWithImages,
      total: registrationsWithImages.length,
    };
  });
