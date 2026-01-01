import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventSpeakers,
  eventCommunicator,
  eventReviewers,
  workshop,
  certificate,
  user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { generateCertificatesResultSchema } from "@/lib/schemas/certificates";
import { generateVerificationCode } from "@/lib/certificates/generateVerificationCode";
import { sendEmail } from "@/lib/sendEmail";
import { CertificateIssuedEmail } from "@/lib/emails/CertificateIssuedEmail";
import { randomUUID } from "crypto";
import type { CertificateRole } from "@/server/db/schema";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

type RecipientData = {
  userId: string;
  userName: string;
  userEmail: string;
  role: CertificateRole;
  sessionTitle: string | null;
};

/**
 * Generate certificates for all eligible recipients of an event.
 * Only works for events that have ended.
 */
export const generateCertificatesRouter = protectedProcedure
  .route({ method: "POST", path: "/certificates/generate" })
  .input(inputSchema)
  .output(generateCertificatesResultSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Verify the event exists and user is the organizer
    const [eventData] = await db
      .select({
        id: event.id,
        title: event.title,
        type: event.type,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
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

    // Check if event has ended
    if (eventData.endDate > new Date()) {
      throw new ORPCError("FORBIDDEN", {
        message: "Certificates can only be generated after the event has ended",
      });
    }

    // Get existing certificates for this event
    const existingCertificates = await db
      .select({
        userId: certificate.userId,
        role: certificate.role,
      })
      .from(certificate)
      .where(eq(certificate.eventId, input.eventId));

    const existingSet = new Set(
      existingCertificates.map((c) => `${c.userId}-${c.role}`),
    );

    // Collect all eligible recipients
    const recipients: RecipientData[] = [];

    // 1. Get speakers (status = accepted)
    const speakers = await db
      .select({
        userId: eventSpeakers.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(eventSpeakers)
      .innerJoin(user, eq(eventSpeakers.userId, user.id))
      .where(
        and(
          eq(eventSpeakers.eventId, input.eventId),
          eq(eventSpeakers.status, "accepted"),
        ),
      );

    for (const speaker of speakers) {
      if (!existingSet.has(`${speaker.userId}-speaker`)) {
        recipients.push({
          userId: speaker.userId,
          userName: speaker.userName,
          userEmail: speaker.userEmail,
          role: "speaker",
          sessionTitle: null,
        });
      }
    }

    // 2. Get communicator members
    const communicators = await db
      .select({
        userId: eventCommunicator.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(eventCommunicator)
      .innerJoin(user, eq(eventCommunicator.userId, user.id))
      .where(eq(eventCommunicator.eventId, input.eventId));

    for (const member of communicators) {
      if (!existingSet.has(`${member.userId}-communicator`)) {
        recipients.push({
          userId: member.userId,
          userName: member.userName,
          userEmail: member.userEmail,
          role: "communicator",
          sessionTitle: null,
        });
      }
    }

    // 3. Get reviewers (status = accepted)
    const reviewers = await db
      .select({
        userId: eventReviewers.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(eventReviewers)
      .innerJoin(user, eq(eventReviewers.userId, user.id))
      .where(
        and(
          eq(eventReviewers.eventId, input.eventId),
          eq(eventReviewers.status, "accepted"),
        ),
      );

    for (const reviewer of reviewers) {
      if (!existingSet.has(`${reviewer.userId}-reviewer`)) {
        recipients.push({
          userId: reviewer.userId,
          userName: reviewer.userName,
          userEmail: reviewer.userEmail,
          role: "reviewer",
          sessionTitle: null,
        });
      }
    }

    // 4. Get workshop facilitators
    const workshops = await db
      .select({
        title: workshop.title,
        facilitatorId: workshop.facilitatorId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(workshop)
      .innerJoin(user, eq(workshop.facilitatorId, user.id))
      .where(eq(workshop.eventId, input.eventId));

    for (const ws of workshops) {
      if (
        ws.facilitatorId &&
        !existingSet.has(`${ws.facilitatorId}-facilitator`)
      ) {
        recipients.push({
          userId: ws.facilitatorId,
          userName: ws.userName,
          userEmail: ws.userEmail,
          role: "facilitator",
          sessionTitle: ws.title,
        });
      }
    }

    if (recipients.length === 0) {
      return {
        success: true,
        generated: 0,
        skipped: existingCertificates.length,
        message: "No new certificates to generate",
      };
    }

    // Generate certificates in a transaction
    const now = new Date();
    const certificatesToInsert = recipients.map((recipient) => ({
      id: randomUUID(),
      eventId: input.eventId,
      userId: recipient.userId,
      role: recipient.role,
      verificationCode: generateVerificationCode(),
      recipientName: recipient.userName,
      recipientEmail: recipient.userEmail,
      eventTitle: eventData.title,
      eventType: eventData.type,
      eventStartDate: eventData.startDate,
      eventEndDate: eventData.endDate,
      eventLocation: eventData.location,
      sessionTitle: recipient.sessionTitle,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(certificate).values(certificatesToInsert);

    // Send email notifications (fire and forget, don't block on failures)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eventifive.com";

    for (const [i, recipient] of recipients.entries()) {
      const cert = certificatesToInsert[i];
      if (!cert) continue;

      // Fire and forget - don't await
      sendEmail(
        recipient.userEmail,
        `Your Certificate from ${eventData.title}`,
        CertificateIssuedEmail,
        {
          recipientName: recipient.userName,
          eventTitle: eventData.title,
          role: recipient.role,
          verificationCode: cert.verificationCode,
          downloadUrl: `${baseUrl}/certificates`,
          verifyUrl: `${baseUrl}/verify/${cert.verificationCode}`,
        },
      ).catch((error) => {
        console.error(
          `Failed to send certificate email to ${recipient.userEmail}:`,
          error,
        );
      });
    }

    return {
      success: true,
      generated: recipients.length,
      skipped: existingCertificates.length,
      message: `Successfully generated ${recipients.length} certificate${recipients.length === 1 ? "" : "s"}`,
    };
  });
