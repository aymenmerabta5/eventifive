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
import { desc, eq } from "drizzle-orm";
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

    // Generate presigned URLs for each event's image
    const registrationsWithImages = await Promise.all(
      registrations.map(async (reg) => {
        let imageUrl: string | null = null;

        // Get default image from eventImages table
        const [defaultImage] = await db
          .select({ s3Key: files.s3Key })
          .from(eventImages)
          .innerJoin(files, eq(eventImages.fileId, files.id))
          .where(eq(eventImages.eventId, reg.eventId))
          .limit(1);

        if (defaultImage?.s3Key) {
          try {
            const { downloadUrl } = await generatePresignedDownloadUrl(
              defaultImage.s3Key,
            );
            imageUrl = downloadUrl;
          } catch (error) {
            console.error(
              `Failed to generate image URL for event ${reg.eventId}:`,
              error,
            );
          }
        }

        return {
          ...reg,
          event: {
            ...reg.event,
            imageUrl,
          },
        };
      }),
    );

    return {
      registrations: registrationsWithImages,
      total: registrationsWithImages.length,
    };
  });
