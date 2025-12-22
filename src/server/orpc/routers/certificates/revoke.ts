import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, certificate } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  certificateId: z.string().uuid(),
  reason: z.string().min(1).max(255),
});

const outputSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

/**
 * Revoke a certificate. Only the event organizer can revoke certificates.
 */
export const revokeCertificateRouter = protectedProcedure
  .route({ method: "POST", path: "/certificates/revoke" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Get the certificate with event info
    const [cert] = await db
      .select({
        id: certificate.id,
        eventId: certificate.eventId,
        recipientName: certificate.recipientName,
        revokedAt: certificate.revokedAt,
      })
      .from(certificate)
      .where(eq(certificate.id, input.certificateId))
      .limit(1);

    if (!cert) {
      throw new ORPCError("NOT_FOUND", { message: "Certificate not found" });
    }

    // Verify the user is the organizer of the event
    const [eventData] = await db
      .select({
        organizerId: event.organizerId,
      })
      .from(event)
      .where(eq(event.id, cert.eventId))
      .limit(1);

    if (!eventData || eventData.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    // Check if already revoked
    if (cert.revokedAt) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This certificate has already been revoked",
      });
    }

    // Revoke the certificate
    await db
      .update(certificate)
      .set({
        revokedAt: new Date(),
        revokeReason: input.reason,
        updatedAt: new Date(),
      })
      .where(eq(certificate.id, input.certificateId));

    return {
      success: true as const,
      message: `Certificate for ${cert.recipientName} has been revoked`,
    };
  });
