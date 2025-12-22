import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { certificate } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";

const inputSchema = z.object({
  certificateId: z.string().uuid(),
});

const outputSchema = z.object({
  id: z.string(),
  verificationCode: z.string(),
  recipientName: z.string(),
  eventTitle: z.string(),
  eventType: z.string(),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
  role: z.string(),
  sessionTitle: z.string().nullable(),
  issuedAt: z.date(),
});

/**
 * Get certificate data for PDF generation.
 * This endpoint returns the certificate data needed to render the PDF.
 * The actual PDF rendering is done on the client side using @react-pdf/renderer.
 * Also updates the downloadedAt timestamp.
 */
export const downloadCertificateRouter = protectedProcedure
  .route({ method: "GET", path: "/certificates/download/{certificateId}" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get the certificate
    const [cert] = await db
      .select({
        id: certificate.id,
        userId: certificate.userId,
        verificationCode: certificate.verificationCode,
        recipientName: certificate.recipientName,
        eventTitle: certificate.eventTitle,
        eventType: certificate.eventType,
        eventStartDate: certificate.eventStartDate,
        eventEndDate: certificate.eventEndDate,
        eventLocation: certificate.eventLocation,
        role: certificate.role,
        sessionTitle: certificate.sessionTitle,
        issuedAt: certificate.issuedAt,
        revokedAt: certificate.revokedAt,
      })
      .from(certificate)
      .where(eq(certificate.id, input.certificateId))
      .limit(1);

    if (!cert) {
      throw new ORPCError("NOT_FOUND", { message: "Certificate not found" });
    }

    // Check if the user owns this certificate
    if (cert.userId !== userId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this certificate",
      });
    }

    // Check if the certificate is revoked
    if (cert.revokedAt) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This certificate has been revoked",
      });
    }

    // Update downloadedAt timestamp
    await db
      .update(certificate)
      .set({ downloadedAt: new Date() })
      .where(eq(certificate.id, input.certificateId));

    return {
      id: cert.id,
      verificationCode: cert.verificationCode,
      recipientName: cert.recipientName,
      eventTitle: cert.eventTitle,
      eventType: cert.eventType,
      eventStartDate: cert.eventStartDate,
      eventEndDate: cert.eventEndDate,
      eventLocation: cert.eventLocation,
      role: cert.role,
      sessionTitle: cert.sessionTitle,
      issuedAt: cert.issuedAt,
    };
  });
