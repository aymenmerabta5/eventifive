import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventCommittee,
  eventReviewers,
  eventSpeakers,
  reviewAssignment,
  submission,
  user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { issueBadgeForRole } from "@/lib/badges/issueBadge";

// Constants
const REQUIRED_REVIEWERS = 3;

async function assertOrganizer(eventId: string, organizerId: string) {
  const [found] = await db
    .select({ id: event.id, organizerId: event.organizerId })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (!found) {
    throw new ORPCError("NOT_FOUND", { message: "Event not found" });
  }

  if (found.organizerId !== organizerId) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not the organizer of this event",
    });
  }
}

async function findUserByEmail(email: string) {
  const [foundUser] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!foundUser) {
    throw new ORPCError("NOT_FOUND", {
      message: "User not found. Ask them to create an account first.",
    });
  }

  return foundUser;
}

// Input schemas
const inviteSpeakerInput = z.object({
  eventId: z.string().min(1),
  email: z.string().email(),
  affiliation: z.string().max(255).optional(),
});

const inviteReviewerInput = z.object({
  eventId: z.string().min(1),
  email: z.string().email(),
});

const inviteCommitteeInput = z.object({
  eventId: z.string().min(1),
  email: z.string().email(),
});

const eventIdInput = z.object({
  eventId: z.string().min(1),
});

const removeInviteInput = z.object({
  eventId: z.string().min(1),
  inviteId: z.number().int(),
});

// Output schemas
const speakerInviteSchema = z.object({
  id: z.number(),
  eventId: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  affiliation: z.string().nullable(),
  status: z.enum(["pending", "accepted", "rejected"]),
  invitedAt: z.date(),
  respondedAt: z.date().nullable(),
});

const reviewerInviteSchema = z.object({
  id: z.number(),
  eventId: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  status: z.enum(["pending", "accepted", "rejected"]),
  invitedAt: z.date(),
  respondedAt: z.date().nullable(),
  eventTitle: z.string().optional(),
  eventType: z.string().optional(),
});

const committeeSchema = z.object({
  id: z.number(),
  eventId: z.string(),
  userId: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  assignedAt: z.date(),
});

const listInvitesOutput = z.object({
  speakers: z.array(speakerInviteSchema),
  reviewers: z.array(reviewerInviteSchema),
  committee: z.array(committeeSchema),
});

// List invites for an event (organizer only)
export const listInvitesRouter = protectedProcedure
  .route({ method: "GET", path: "/events/{eventId}/invites" })
  .input(z.object({ eventId: z.string().min(1) }))
  .output(listInvitesOutput)
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    // Get all speakers
    const speakerRows = await db
      .select({
        id: eventSpeakers.id,
        eventId: eventSpeakers.eventId,
        userId: eventSpeakers.userId,
        userName: user.name,
        userEmail: user.email,
        affiliation: eventSpeakers.affiliation,
        status: eventSpeakers.status,
        invitedAt: eventSpeakers.invitedAt,
        respondedAt: eventSpeakers.respondedAt,
      })
      .from(eventSpeakers)
      .innerJoin(user, eq(user.id, eventSpeakers.userId))
      .where(eq(eventSpeakers.eventId, input.eventId));

    const speakers = speakerRows.map((s) => ({
      id: s.id,
      eventId: s.eventId,
      userId: s.userId,
      userName: s.userName,
      userEmail: s.userEmail,
      affiliation: s.affiliation ?? null,
      status: s.status as "pending" | "accepted" | "rejected",
      invitedAt: s.invitedAt,
      respondedAt: s.respondedAt ?? null,
    }));

    // Get reviewers
    const reviewerRows = await db
      .select({
        id: eventReviewers.id,
        eventId: eventReviewers.eventId,
        userId: eventReviewers.userId,
        userName: user.name,
        userEmail: user.email,
        status: eventReviewers.status,
        invitedAt: eventReviewers.invitedAt,
        respondedAt: eventReviewers.respondedAt,
      })
      .from(eventReviewers)
      .innerJoin(user, eq(user.id, eventReviewers.userId))
      .where(eq(eventReviewers.eventId, input.eventId));

    const reviewers = reviewerRows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      status: r.status as "pending" | "accepted" | "rejected",
      invitedAt: r.invitedAt,
      respondedAt: r.respondedAt ?? null,
    }));

    // Get committee
    const committeeRows = await db
      .select({
        id: eventCommittee.id,
        eventId: eventCommittee.eventId,
        userId: eventCommittee.userId,
        userName: user.name,
        userEmail: user.email,
        assignedAt: eventCommittee.assignedAt,
      })
      .from(eventCommittee)
      .innerJoin(user, eq(user.id, eventCommittee.userId))
      .where(eq(eventCommittee.eventId, input.eventId));

    const committee = committeeRows.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      userId: c.userId,
      userName: c.userName,
      userEmail: c.userEmail,
      assignedAt: c.assignedAt,
    }));

    return { speakers, reviewers, committee };
  });

// Invite speaker (unlimited per event)
export const inviteSpeakerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/speaker" })
  .input(inviteSpeakerInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const foundUser = await findUserByEmail(input.email);

    // Check if user is already a speaker for this event
    const [existing] = await db
      .select({ id: eventSpeakers.id })
      .from(eventSpeakers)
      .where(
        and(
          eq(eventSpeakers.eventId, input.eventId),
          eq(eventSpeakers.userId, foundUser.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This user is already a speaker for this event",
      });
    }

    await db.insert(eventSpeakers).values({
      eventId: input.eventId,
      userId: foundUser.id,
      affiliation: input.affiliation ?? null,
      status: "pending",
    });

    return { ok: true as const };
  });

// Invite reviewer (max 3 per event)
export const inviteReviewerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/reviewer" })
  .input(inviteReviewerInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const foundUser = await findUserByEmail(input.email);

    // Check if event already has 3 reviewers
    const [existingCount] = await db
      .select({ count: count() })
      .from(eventReviewers)
      .where(eq(eventReviewers.eventId, input.eventId));

    if ((existingCount?.count ?? 0) >= REQUIRED_REVIEWERS) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Event already has ${REQUIRED_REVIEWERS} reviewers. Remove a reviewer first.`,
      });
    }

    // Check if user is already a reviewer for this event
    const [existing] = await db
      .select({ id: eventReviewers.id })
      .from(eventReviewers)
      .where(
        and(
          eq(eventReviewers.eventId, input.eventId),
          eq(eventReviewers.userId, foundUser.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: "This user is already a reviewer for this event",
      });
    }

    await db.insert(eventReviewers).values({
      eventId: input.eventId,
      userId: foundUser.id,
      status: "pending",
    });

    return { ok: true as const };
  });

// Add committee member
export const inviteCommitteeRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/committee" })
  .input(inviteCommitteeInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const foundUser = await findUserByEmail(input.email);

    // Check if user is already in committee
    const [existing] = await db
      .select({ id: eventCommittee.id })
      .from(eventCommittee)
      .where(
        and(
          eq(eventCommittee.eventId, input.eventId),
          eq(eventCommittee.userId, foundUser.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ORPCError("BAD_REQUEST", {
        message: "User is already in the committee for this event",
      });
    }

    await db.insert(eventCommittee).values({
      eventId: input.eventId,
      userId: foundUser.id,
    });

    // Issue committee badge (fire and forget)
    issueBadgeForRole(input.eventId, foundUser.id, "committee").catch((error) => {
      console.error(
        `Failed to issue committee badge for user ${foundUser.id}:`,
        error,
      );
    });

    return { ok: true as const };
  });

// Accept speaker invite
export const acceptSpeakerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/speaker/accept" })
  .input(eventIdInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    const [found] = await db
      .select({ id: eventSpeakers.id, status: eventSpeakers.status })
      .from(eventSpeakers)
      .where(
        and(
          eq(eventSpeakers.eventId, input.eventId),
          eq(eventSpeakers.userId, userId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", {
        message: "No speaker invite found for you in this event",
      });
    }

    if (found.status !== "pending") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Speaker invite already ${found.status}`,
      });
    }

    await db
      .update(eventSpeakers)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(eventSpeakers.id, found.id));

    // Issue speaker badge (fire and forget)
    issueBadgeForRole(input.eventId, userId, "speaker").catch((error) => {
      console.error(`Failed to issue speaker badge for user ${userId}:`, error);
    });

    return { ok: true as const };
  });

// Reject speaker invite
export const rejectSpeakerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/speaker/reject" })
  .input(eventIdInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    const [found] = await db
      .select({ id: eventSpeakers.id, status: eventSpeakers.status })
      .from(eventSpeakers)
      .where(
        and(
          eq(eventSpeakers.eventId, input.eventId),
          eq(eventSpeakers.userId, userId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", {
        message: "No speaker invite found for you in this event",
      });
    }

    if (found.status !== "pending") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Speaker invite already ${found.status}`,
      });
    }

    await db
      .update(eventSpeakers)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(eventSpeakers.id, found.id));

    return { ok: true as const };
  });

// Accept reviewer invite
export const acceptReviewerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/reviewer/accept" })
  .input(eventIdInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    await db.transaction(async (tx) => {
      const [found] = await tx
        .select({ id: eventReviewers.id, status: eventReviewers.status })
        .from(eventReviewers)
        .where(
          and(
            eq(eventReviewers.eventId, input.eventId),
            eq(eventReviewers.userId, userId),
          ),
        )
        .limit(1);

      if (!found) {
        throw new ORPCError("NOT_FOUND", {
          message: "No reviewer invite found for you in this event",
        });
      }

      if (found.status !== "pending") {
        throw new ORPCError("BAD_REQUEST", {
          message: `Reviewer invite already ${found.status}`,
        });
      }

      await tx
        .update(eventReviewers)
        .set({ status: "accepted", respondedAt: new Date() })
        .where(eq(eventReviewers.id, found.id));

      // Assign the reviewer to all current submissions for this event so they can review existing registrations.
      const submissions = await tx
        .select({ id: submission.id })
        .from(submission)
        .where(eq(submission.eventId, input.eventId));

      if (submissions.length > 0) {
        await tx
          .insert(reviewAssignment)
          .values(
            submissions.map((s) => ({
              submissionId: s.id,
              reviewerId: userId,
            })),
          )
          .onConflictDoNothing({
            target: [
              reviewAssignment.submissionId,
              reviewAssignment.reviewerId,
            ],
          });
      }
    });

    // Issue reviewer badge (fire and forget, after transaction)
    issueBadgeForRole(input.eventId, userId, "reviewer").catch((error) => {
      console.error(`Failed to issue reviewer badge for user ${userId}:`, error);
    });

    return { ok: true as const };
  });

// Reject reviewer invite
export const rejectReviewerRouter = protectedProcedure
  .route({ method: "POST", path: "/events/invites/reviewer/reject" })
  .input(eventIdInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    const [found] = await db
      .select({ id: eventReviewers.id, status: eventReviewers.status })
      .from(eventReviewers)
      .where(
        and(
          eq(eventReviewers.eventId, input.eventId),
          eq(eventReviewers.userId, userId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", {
        message: "No reviewer invite found for you in this event",
      });
    }

    if (found.status !== "pending") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Reviewer invite already ${found.status}`,
      });
    }

    await db
      .update(eventReviewers)
      .set({ status: "rejected", respondedAt: new Date() })
      .where(eq(eventReviewers.id, found.id));

    return { ok: true as const };
  });

// Remove speaker (organizer only)
export const removeSpeakerRouter = protectedProcedure
  .route({ method: "DELETE", path: "/events/invites/speaker" })
  .input(removeInviteInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const [found] = await db
      .select({ id: eventSpeakers.id })
      .from(eventSpeakers)
      .where(
        and(
          eq(eventSpeakers.eventId, input.eventId),
          eq(eventSpeakers.id, input.inviteId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Speaker not found" });
    }

    await db.delete(eventSpeakers).where(eq(eventSpeakers.id, found.id));

    return { ok: true as const };
  });

// Remove reviewer (organizer only)
export const removeReviewerRouter = protectedProcedure
  .route({ method: "DELETE", path: "/events/invites/reviewer" })
  .input(removeInviteInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const [found] = await db
      .select({ id: eventReviewers.id })
      .from(eventReviewers)
      .where(
        and(
          eq(eventReviewers.eventId, input.eventId),
          eq(eventReviewers.id, input.inviteId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", { message: "Reviewer not found" });
    }

    await db.delete(eventReviewers).where(eq(eventReviewers.id, found.id));

    return { ok: true as const };
  });

// Remove committee member (organizer only)
export const removeCommitteeRouter = protectedProcedure
  .route({ method: "DELETE", path: "/events/invites/committee" })
  .input(removeInviteInput)
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ context, input }) => {
    const organizerId = context.session.user.id;
    await assertOrganizer(input.eventId, organizerId);

    const [found] = await db
      .select({ id: eventCommittee.id })
      .from(eventCommittee)
      .where(
        and(
          eq(eventCommittee.eventId, input.eventId),
          eq(eventCommittee.id, input.inviteId),
        ),
      )
      .limit(1);

    if (!found) {
      throw new ORPCError("NOT_FOUND", {
        message: "Committee member not found",
      });
    }

    await db.delete(eventCommittee).where(eq(eventCommittee.id, found.id));

    return { ok: true as const };
  });

// List my invites (speaker and reviewer invites for current user)
const listMyInvitesOutput = z.object({
  speakerInvites: z.array(
    speakerInviteSchema.extend({ eventTitle: z.string() }),
  ),
  reviewerInvites: z.array(
    reviewerInviteSchema.extend({
      eventTitle: z.string(),
      eventType: z.string(),
    }),
  ),
  committeeAssignments: z.array(
    committeeSchema.extend({ eventTitle: z.string() }),
  ),
});

export const listMyInvitesRouter = protectedProcedure
  .route({ method: "GET", path: "/events/invites/mine" })
  .output(listMyInvitesOutput)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    // Get speaker invites
    const speakerRows = await db
      .select({
        id: eventSpeakers.id,
        eventId: eventSpeakers.eventId,
        userId: eventSpeakers.userId,
        userName: user.name,
        userEmail: user.email,
        affiliation: eventSpeakers.affiliation,
        status: eventSpeakers.status,
        invitedAt: eventSpeakers.invitedAt,
        respondedAt: eventSpeakers.respondedAt,
        eventTitle: event.title,
      })
      .from(eventSpeakers)
      .innerJoin(user, eq(user.id, eventSpeakers.userId))
      .innerJoin(event, eq(event.id, eventSpeakers.eventId))
      .where(eq(eventSpeakers.userId, userId));

    const speakerInvites = speakerRows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      affiliation: r.affiliation ?? null,
      status: r.status as "pending" | "accepted" | "rejected",
      invitedAt: r.invitedAt,
      respondedAt: r.respondedAt ?? null,
      eventTitle: r.eventTitle,
    }));

    // Get reviewer invites
    const reviewerRows = await db
      .select({
        id: eventReviewers.id,
        eventId: eventReviewers.eventId,
        userId: eventReviewers.userId,
        userName: user.name,
        userEmail: user.email,
        status: eventReviewers.status,
        invitedAt: eventReviewers.invitedAt,
        respondedAt: eventReviewers.respondedAt,
        eventTitle: event.title,
        eventType: event.type,
      })
      .from(eventReviewers)
      .innerJoin(user, eq(user.id, eventReviewers.userId))
      .innerJoin(event, eq(event.id, eventReviewers.eventId))
      .where(eq(eventReviewers.userId, userId));

    const reviewerInvites = reviewerRows.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      status: r.status as "pending" | "accepted" | "rejected",
      invitedAt: r.invitedAt,
      respondedAt: r.respondedAt ?? null,
      eventTitle: r.eventTitle,
      eventType: r.eventType,
    }));

    // Get committee assignments
    const committeeRows = await db
      .select({
        id: eventCommittee.id,
        eventId: eventCommittee.eventId,
        userId: eventCommittee.userId,
        userName: user.name,
        userEmail: user.email,
        assignedAt: eventCommittee.assignedAt,
        eventTitle: event.title,
      })
      .from(eventCommittee)
      .innerJoin(user, eq(user.id, eventCommittee.userId))
      .innerJoin(event, eq(event.id, eventCommittee.eventId))
      .where(eq(eventCommittee.userId, userId));

    const committeeAssignments = committeeRows.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      userId: c.userId,
      userName: c.userName,
      userEmail: c.userEmail,
      assignedAt: c.assignedAt,
      eventTitle: c.eventTitle,
    }));

    return { speakerInvites, reviewerInvites, committeeAssignments };
  });
