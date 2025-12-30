import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { badge, event, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { badgeDownloadDataSchema } from "@/lib/schemas/badges";

const inputSchema = z.object({
  badgeId: z.string().uuid(),
});

/**
 * Get badge data for PDF generation.
 * This endpoint returns the badge data needed to render the PDF.
 * The actual PDF rendering is done on the client side using @react-pdf/renderer.
 * Also updates the downloadedAt timestamp.
 */
export const downloadBadgeRouter = protectedProcedure
  .route({ method: "GET", path: "/badges/download/{badgeId}" })
  .input(inputSchema)
  .output(badgeDownloadDataSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Get the badge with event and user data
    const [badgeData] = await db
      .select({
        id: badge.id,
        userId: badge.userId,
        role: badge.role,
        verificationCode: badge.verificationCode,
        affiliation: badge.affiliation,
        issuedAt: badge.issuedAt,
        revokedAt: badge.revokedAt,
        // User data
        recipientName: user.name,
        recipientEmail: user.email,
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
      .where(eq(badge.id, input.badgeId))
      .limit(1);

    if (!badgeData) {
      throw new ORPCError("NOT_FOUND", { message: "Badge not found" });
    }

    // Check if the user owns this badge
    if (badgeData.userId !== userId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this badge",
      });
    }

    // Check if the badge is revoked
    if (badgeData.revokedAt) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This badge has been revoked",
      });
    }

    // Update downloadedAt timestamp
    await db
      .update(badge)
      .set({ downloadedAt: new Date() })
      .where(eq(badge.id, input.badgeId));

    return {
      id: badgeData.id,
      role: badgeData.role,
      verificationCode: badgeData.verificationCode,
      affiliation: badgeData.affiliation,
      issuedAt: badgeData.issuedAt,
      recipientName: badgeData.recipientName,
      recipientEmail: badgeData.recipientEmail,
      eventTitle: badgeData.eventTitle,
      eventType: badgeData.eventType,
      eventStartDate: badgeData.eventStartDate,
      eventEndDate: badgeData.eventEndDate,
      eventLocation: badgeData.eventLocation,
    };
  });
