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
import { eligibleRecipientsSchema } from "@/lib/schemas/certificates";
import type { CertificateRole } from "@/server/db/schema";

const inputSchema = z.object({
  eventId: z.string().uuid(),
});

/**
 * Get all eligible recipients for certificates for an event.
 * This is used to preview before generating certificates.
 */
export const getEligibleRecipientsRouter = protectedProcedure
  .route({ method: "GET", path: "/certificates/eligible/{eventId}" })
  .input(inputSchema)
  .output(eligibleRecipientsSchema)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;

    // Verify the event exists and user is the organizer
    const [eventData] = await db
      .select({
        id: event.id,
        title: event.title,
        endDate: event.endDate,
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

    const eventEnded = eventData.endDate < new Date();

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

    type Recipient = {
      userId: string;
      userName: string;
      userEmail: string;
      role: CertificateRole;
      sessionTitle: string | null;
      alreadyIssued: boolean;
    };

    const recipients: Recipient[] = [];

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
      recipients.push({
        userId: speaker.userId,
        userName: speaker.userName,
        userEmail: speaker.userEmail,
        role: "speaker",
        sessionTitle: null,
        alreadyIssued: existingSet.has(`${speaker.userId}-speaker`),
      });
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
      recipients.push({
        userId: member.userId,
        userName: member.userName,
        userEmail: member.userEmail,
        role: "communicator",
        sessionTitle: null,
        alreadyIssued: existingSet.has(`${member.userId}-communicator`),
      });
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
      recipients.push({
        userId: reviewer.userId,
        userName: reviewer.userName,
        userEmail: reviewer.userEmail,
        role: "reviewer",
        sessionTitle: null,
        alreadyIssued: existingSet.has(`${reviewer.userId}-reviewer`),
      });
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
      if (ws.facilitatorId) {
        recipients.push({
          userId: ws.facilitatorId,
          userName: ws.userName,
          userEmail: ws.userEmail,
          role: "facilitator",
          sessionTitle: ws.title,
          alreadyIssued: existingSet.has(`${ws.facilitatorId}-facilitator`),
        });
      }
    }

    const alreadyIssuedCount = recipients.filter((r) => r.alreadyIssued).length;
    const newRecipientsCount = recipients.length - alreadyIssuedCount;

    return {
      eventId: input.eventId,
      eventTitle: eventData.title,
      eventEnded,
      recipients,
      alreadyIssuedCount,
      newRecipientsCount,
    };
  });
