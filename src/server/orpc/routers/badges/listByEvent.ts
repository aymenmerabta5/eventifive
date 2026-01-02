import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { badge, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { eventBadgesListSchema } from "@/lib/schemas/badges";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

/**
 * List all badges for an event. Only accessible by the event organizer.
 */
export const listBadgesByEventRouter = protectedProcedure
  .route({ method: "GET", path: "/badges/event/{eventId}" })
  .input(inputSchema)
  .output(eventBadgesListSchema)
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

    // Get all badges for this event with user data
    const badges = await db
      .select({
        id: badge.id,
        userId: badge.userId,
        role: badge.role,
        verificationCode: badge.verificationCode,
        affiliation: badge.affiliation,
        issuedAt: badge.issuedAt,
        downloadedAt: badge.downloadedAt,
        revokedAt: badge.revokedAt,
        revokeReason: badge.revokeReason,
        // User data
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(badge)
      .innerJoin(user, eq(badge.userId, user.id))
      .where(eq(badge.eventId, input.eventId))
      .orderBy(badge.issuedAt);

    // Generate presigned URLs for user images
    const badgesWithUrls = await Promise.all(
      badges.map(async (b) => {
        const presignedUrl = b.userImage
          ? await generatePresignedDownloadUrl(b.userImage)
          : null;
        return {
          ...b,
          userImage: presignedUrl?.downloadUrl ?? null,
        };
      }),
    );

    return badgesWithUrls;
  });
