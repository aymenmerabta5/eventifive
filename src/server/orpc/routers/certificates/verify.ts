import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { certificate } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { verificationResultSchema } from "@/lib/schemas/certificates";

const inputSchema = z.object({
  code: z.string().min(1).max(20),
});

/**
 * Public endpoint to verify a certificate by its verification code.
 * Returns certificate details if valid, or indicates if it's invalid/revoked.
 */
export const verifyCertificateRouter = publicProcedure
  .route({ method: "GET", path: "/certificates/verify/{code}" })
  .input(inputSchema)
  .output(verificationResultSchema)
  .handler(async ({ input }) => {
    const [cert] = await db
      .select({
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
        revokeReason: certificate.revokeReason,
      })
      .from(certificate)
      .where(eq(certificate.verificationCode, input.code))
      .limit(1);

    if (!cert) {
      return {
        valid: false,
        certificate: null,
      };
    }

    return {
      valid: cert.revokedAt === null,
      certificate: {
        recipientName: cert.recipientName,
        eventTitle: cert.eventTitle,
        eventType: cert.eventType,
        eventStartDate: cert.eventStartDate,
        eventEndDate: cert.eventEndDate,
        eventLocation: cert.eventLocation,
        role: cert.role,
        sessionTitle: cert.sessionTitle,
        issuedAt: cert.issuedAt,
        revoked: cert.revokedAt !== null,
        revokeReason: cert.revokeReason,
      },
    };
  });
