import { db } from "@/server/db";
import {
  badge,
  event,
  eventRegistration,
  user,
  eventSpeakers,
} from "@/server/db/schema";
import type { BadgeRole } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { generateBadgeVerificationCode } from "./generateVerificationCode";
import { sendEmail } from "@/lib/sendEmail";
import { BadgeIssuedEmail } from "@/lib/emails/BadgeIssuedEmail";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eventifive.com";

/**
 * Issue a badge for a paid registration (participant role)
 * Called when:
 * - Payment webhook confirms payment
 * - Free registration is completed
 */
export async function issueBadgeForRegistration(
  registrationId: number
): Promise<void> {
  // Get registration with event and user data
  const [registration] = await db
    .select({
      userId: eventRegistration.userId,
      eventId: eventRegistration.eventId,
      paymentStatus: eventRegistration.paymentStatus,
      userName: user.name,
      userEmail: user.email,
      eventTitle: event.title,
      eventType: event.type,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
      eventLocation: event.location,
    })
    .from(eventRegistration)
    .innerJoin(user, eq(eventRegistration.userId, user.id))
    .innerJoin(event, eq(eventRegistration.eventId, event.id))
    .where(eq(eventRegistration.id, registrationId))
    .limit(1);

  if (!registration) {
    console.error(`Registration ${registrationId} not found for badge issuance`);
    return;
  }

  // Check if registration is paid
  if (registration.paymentStatus !== "paid") {
    console.log(
      `Skipping badge for registration ${registrationId}: payment status is ${registration.paymentStatus}`
    );
    return;
  }

  // Check if badge already exists
  const [existingBadge] = await db
    .select({ id: badge.id })
    .from(badge)
    .where(
      and(
        eq(badge.eventId, registration.eventId),
        eq(badge.userId, registration.userId),
        eq(badge.role, "participant")
      )
    )
    .limit(1);

  if (existingBadge) {
    console.log(
      `Badge already exists for user ${registration.userId} at event ${registration.eventId}`
    );
    return;
  }

  // Create badge
  const verificationCode = generateBadgeVerificationCode();
  const now = new Date();

  await db.insert(badge).values({
    id: randomUUID(),
    eventId: registration.eventId,
    userId: registration.userId,
    role: "participant",
    verificationCode,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  console.log(
    `Badge issued for participant ${registration.userId} at event ${registration.eventId}`
  );

  // Send email notification (fire and forget)
  sendEmail(
    registration.userEmail,
    `Your Event Badge for ${registration.eventTitle}`,
    BadgeIssuedEmail,
    {
      recipientName: registration.userName,
      eventTitle: registration.eventTitle,
      role: "participant" as BadgeRole,
      verificationCode,
      downloadUrl: `${baseUrl}/registrations`,
      verifyUrl: `${baseUrl}/verify-badge/${verificationCode}`,
    }
  ).catch((error) => {
    console.error(
      `Failed to send badge email to ${registration.userEmail}:`,
      error
    );
  });
}

/**
 * Issue a badge for a specific role (speaker, reviewer, committee)
 * Called when:
 * - Speaker accepts invitation
 * - Reviewer accepts invitation
 * - Committee member is assigned
 */
export async function issueBadgeForRole(
  eventId: string,
  userId: string,
  role: BadgeRole
): Promise<void> {
  // Get event and user data
  const [eventData] = await db
    .select({
      title: event.title,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
    })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (!eventData) {
    console.error(`Event ${eventId} not found for badge issuance`);
    return;
  }

  const [userData] = await db
    .select({
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    console.error(`User ${userId} not found for badge issuance`);
    return;
  }

  // Check if badge already exists
  const [existingBadge] = await db
    .select({ id: badge.id })
    .from(badge)
    .where(
      and(eq(badge.eventId, eventId), eq(badge.userId, userId), eq(badge.role, role))
    )
    .limit(1);

  if (existingBadge) {
    console.log(`Badge already exists for user ${userId} at event ${eventId} with role ${role}`);
    return;
  }

  // Get affiliation for speakers
  let affiliation: string | null = null;
  if (role === "speaker") {
    const [speakerData] = await db
      .select({ affiliation: eventSpeakers.affiliation })
      .from(eventSpeakers)
      .where(
        and(eq(eventSpeakers.eventId, eventId), eq(eventSpeakers.userId, userId))
      )
      .limit(1);
    affiliation = speakerData?.affiliation ?? null;
  }

  // Create badge
  const verificationCode = generateBadgeVerificationCode();
  const now = new Date();

  await db.insert(badge).values({
    id: randomUUID(),
    eventId,
    userId,
    role,
    verificationCode,
    affiliation,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Badge issued for ${role} ${userId} at event ${eventId}`);

  // Send email notification (fire and forget)
  sendEmail(
    userData.email,
    `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Badge for ${eventData.title}`,
    BadgeIssuedEmail,
    {
      recipientName: userData.name,
      eventTitle: eventData.title,
      role,
      verificationCode,
      downloadUrl: `${baseUrl}/registrations`,
      verifyUrl: `${baseUrl}/verify-badge/${verificationCode}`,
    }
  ).catch((error) => {
    console.error(`Failed to send badge email to ${userData.email}:`, error);
  });
}
