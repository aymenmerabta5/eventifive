import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { badge, event } from "@/server/db/schema";
import { eq, isNull } from "drizzle-orm";
import { myBadgesListSchema } from "@/lib/schemas/badges";

/**
 * List all badges received by the authenticated user.
 * Only shows valid (non-revoked) badges.
 */
export const listMyBadgesRouter = protectedProcedure
  .route({ method: "GET", path: "/badges/my" })
  .output(myBadgesListSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    const badges = await db
      .select({
        id: badge.id,
        eventId: badge.eventId,
        role: badge.role,
        verificationCode: badge.verificationCode,
        affiliation: badge.affiliation,
        issuedAt: badge.issuedAt,
        downloadedAt: badge.downloadedAt,
        // Event data from join
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
        eventLocation: event.location,
      })
      .from(badge)
      .innerJoin(event, eq(badge.eventId, event.id))
      .where(eq(badge.userId, userId))
      .orderBy(badge.issuedAt);

    // Filter out revoked badges
    return badges;
  });
