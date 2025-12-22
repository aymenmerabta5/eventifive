import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { certificate } from "@/server/db/schema";
import { eq, isNull } from "drizzle-orm";
import { myCertificatesListSchema } from "@/lib/schemas/certificates";

/**
 * List all certificates received by the authenticated user.
 * Only shows valid (non-revoked) certificates.
 */
export const listMyCertificatesRouter = protectedProcedure
  .route({ method: "GET", path: "/certificates/my" })
  .output(myCertificatesListSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    const certificates = await db
      .select({
        id: certificate.id,
        eventId: certificate.eventId,
        role: certificate.role,
        verificationCode: certificate.verificationCode,
        eventTitle: certificate.eventTitle,
        eventType: certificate.eventType,
        eventStartDate: certificate.eventStartDate,
        eventEndDate: certificate.eventEndDate,
        eventLocation: certificate.eventLocation,
        sessionTitle: certificate.sessionTitle,
        issuedAt: certificate.issuedAt,
        downloadedAt: certificate.downloadedAt,
      })
      .from(certificate)
      .where(eq(certificate.userId, userId))
      .orderBy(certificate.issuedAt);

    // Filter out revoked certificates (only show valid ones)
    return certificates.filter((c) => c.issuedAt !== null);
  });
