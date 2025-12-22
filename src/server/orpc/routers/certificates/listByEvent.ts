import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, certificate, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { certificateListWithUserSchema } from "@/lib/schemas/certificates";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

/**
 * List all certificates issued for an event.
 * Only accessible by the event organizer.
 */
export const listCertificatesByEventRouter = protectedProcedure
  .route({ method: "GET", path: "/certificates/event/{eventId}" })
  .input(inputSchema)
  .output(certificateListWithUserSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Verify the event exists and user is the organizer
    const [eventData] = await db
      .select({
        id: event.id,
        organizerId: event.organizerId,
      })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventData) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    const certificates = await db
      .select({
        id: certificate.id,
        eventId: certificate.eventId,
        userId: certificate.userId,
        role: certificate.role,
        verificationCode: certificate.verificationCode,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        eventTitle: certificate.eventTitle,
        eventType: certificate.eventType,
        eventStartDate: certificate.eventStartDate,
        eventEndDate: certificate.eventEndDate,
        eventLocation: certificate.eventLocation,
        sessionTitle: certificate.sessionTitle,
        contributionDetails: certificate.contributionDetails,
        issuedAt: certificate.issuedAt,
        downloadedAt: certificate.downloadedAt,
        revokedAt: certificate.revokedAt,
        revokeReason: certificate.revokeReason,
        createdAt: certificate.createdAt,
        updatedAt: certificate.updatedAt,
        userImage: user.image,
      })
      .from(certificate)
      .innerJoin(user, eq(certificate.userId, user.id))
      .where(eq(certificate.eventId, input.eventId))
      .orderBy(certificate.issuedAt);

    return certificates;
  });
