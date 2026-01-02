import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  workshop,
  workshopRegistration,
  event,
  user,
  eventImages,
  files,
} from "@/server/db/schema";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const workshopRegSchema = z.object({
  id: z.number(),
  workshopId: z.string(),
  registeredAt: z.date(),
  status: z.string(),
  workshop: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    capacity: z.number().nullable(),
    startAt: z.date().nullable(),
    endAt: z.date().nullable(),
    facilitator: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    }),
  }),
  event: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    location: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
});

const outputSchema = z.object({
  registrations: z.array(workshopRegSchema),
  total: z.number(),
});

/**
 * Get all workshop registrations for the current user.
 */
export const myWorkshopRegistrationsRouter = protectedProcedure
  .route({ method: "GET", path: "/workshops/my-registrations" })
  .output(outputSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    // Get all workshop registrations with workshop, event, and facilitator info
    const registrations = await db
      .select({
        id: workshopRegistration.id,
        workshopId: workshopRegistration.workshopId,
        registeredAt: workshopRegistration.registeredAt,
        status: workshopRegistration.status,
        // Workshop fields
        workshopTitle: workshop.title,
        workshopDescription: workshop.description,
        workshopCapacity: workshop.capacity,
        workshopStartAt: workshop.startAt,
        workshopEndAt: workshop.endAt,
        facilitatorId: workshop.facilitatorId,
        // Event fields
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
        eventLocation: event.location,
        // Facilitator fields
        facilitatorName: user.name,
        facilitatorImage: user.image,
      })
      .from(workshopRegistration)
      .innerJoin(workshop, eq(workshopRegistration.workshopId, workshop.id))
      .innerJoin(event, eq(workshop.eventId, event.id))
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(eq(workshopRegistration.userId, userId))
      .orderBy(desc(workshop.startAt));

    // Initialize registrations with null imageUrl
    let registrationsWithImages = registrations.map((reg) => ({
      ...reg,
      eventImageUrl: null as string | null,
    }));

    if (registrations.length > 0) {
      const eventIds = [...new Set(registrations.map((reg) => reg.eventId))];

      // Fetch all images for all events in one query
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

      // Apply URLs to all registrations
      registrationsWithImages = registrationsWithImages.map((reg) => ({
        ...reg,
        eventImageUrl: urlMap.get(reg.eventId) ?? null,
      }));
    }

    return {
      registrations: registrationsWithImages.map((reg) => ({
        id: reg.id,
        workshopId: reg.workshopId,
        registeredAt: reg.registeredAt,
        status: reg.status,
        workshop: {
          id: reg.workshopId,
          title: reg.workshopTitle,
          description: reg.workshopDescription,
          capacity: reg.workshopCapacity,
          startAt: reg.workshopStartAt,
          endAt: reg.workshopEndAt,
          facilitator: {
            id: reg.facilitatorId,
            name: reg.facilitatorName,
            image: reg.facilitatorImage,
          },
        },
        event: {
          id: reg.eventId,
          title: reg.eventTitle,
          type: reg.eventType,
          startDate: reg.eventStartDate,
          endDate: reg.eventEndDate,
          location: reg.eventLocation,
          imageUrl: reg.eventImageUrl,
        },
      })),
      total: registrationsWithImages.length,
    };
  });
