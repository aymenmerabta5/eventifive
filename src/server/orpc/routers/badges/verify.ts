import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { badge, event, user } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { badgeVerificationResultSchema } from "@/lib/schemas/badges";

const inputSchema = z.object({
  code: z.string().min(1).max(20),
});

/**
 * Public endpoint to verify a badge by its verification code.
 * Returns badge details if valid, or indicates if it's invalid/revoked.
 */
export const verifyBadgeRouter = publicProcedure
  .route({ method: "GET", path: "/badges/verify/{code}" })
  .input(inputSchema)
  .output(badgeVerificationResultSchema)
  .handler(async ({ input }) => {
    const [badgeData] = await db
      .select({
        role: badge.role,
        affiliation: badge.affiliation,
        issuedAt: badge.issuedAt,
        revokedAt: badge.revokedAt,
        revokeReason: badge.revokeReason,
        // User data
        recipientName: user.name,
        // Event data
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
        eventLocation: event.location,
      })
      .from(badge)
      .innerJoin(event, eq(badge.eventId, event.id))
      .innerJoin(user, eq(badge.userId, user.id))
      .where(eq(badge.verificationCode, input.code))
      .limit(1);

    if (!badgeData) {
      return {
        valid: false,
        badge: null,
      };
    }

    return {
      valid: badgeData.revokedAt === null,
      badge: {
        recipientName: badgeData.recipientName,
        eventTitle: badgeData.eventTitle,
        eventType: badgeData.eventType,
        eventStartDate: badgeData.eventStartDate,
        eventEndDate: badgeData.eventEndDate,
        eventLocation: badgeData.eventLocation,
        role: badgeData.role,
        affiliation: badgeData.affiliation,
        issuedAt: badgeData.issuedAt,
        revoked: badgeData.revokedAt !== null,
        revokeReason: badgeData.revokeReason,
      },
    };
  });
