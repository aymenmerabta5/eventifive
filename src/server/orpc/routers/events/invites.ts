import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
	event,
	eventCommittee,
	eventReviewerInvite,
	eventSpeakerInvite,
	user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

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
		throw new ORPCError("FORBIDDEN", { message: "You are not the organizer of this event" });
	}
}

const inviteSpeakerInput = z.object({
	eventId: z.string().min(1),
	email: z.string().email(),
	affiliation: z.string().max(255).optional(),
	// Slot 1 = primary speaker, 2-3 = backups.
	slot: z.number().int().min(1).max(3),
});

const inviteCommitteeInput = z.object({
	eventId: z.string().min(1),
	email: z.string().email(),
});

const inviteReviewerInput = z.object({
	eventId: z.string().min(1),
	email: z.string().email(),
	// Slot 1-3 = primary reviewers, 4-5 = backups.
	slot: z.number().int().min(1).max(5),
});

const acceptSpeakerInput = z.object({
	eventId: z.string().min(1),
});

const respondReviewerInput = z.object({
	eventId: z.string().min(1),
});

// Simplified schema without bio and role
const speakerInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string().nullable(),
	userEmail: z.string(),
	affiliation: z.string().nullable(),
	slot: z.number(),
	status: z.enum(["pending", "accepted", "rejected"]),
	invitedAt: z.date(),
	respondedAt: z.date().nullable(),
});

const committeeInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string().nullable(),
	userEmail: z.string(),
	assignedAt: z.date(),
});

const reviewerInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string().nullable(),
	userEmail: z.string(),
	slot: z.number(),
	status: z.enum(["pending", "accepted", "rejected"]),
	invitedAt: z.date(),
	respondedAt: z.date().nullable(),
});

const listInvitesOutput = z.object({
	speakers: z.array(speakerInviteSchema),
	committee: z.array(committeeInviteSchema),
	reviewers: z.array(reviewerInviteSchema),
});

export const listInvitesRouter = protectedProcedure
	.route({ method: "GET", path: "/events/{eventId}/invites" })
	.input(z.object({ eventId: z.string().min(1) }))
	.output(listInvitesOutput)
	.handler(async ({ context, input }) => {
		const organizerId = context.session.user.id;
		await assertOrganizer(input.eventId, organizerId);

		const speakersRows = await db
			.select({
				id: eventSpeakerInvite.id,
				eventId: eventSpeakerInvite.eventId,
				userId: eventSpeakerInvite.userId,
				userName: user.name,
				userEmail: user.email,
				affiliation: eventSpeakerInvite.affiliation,
				slot: eventSpeakerInvite.slot,
				status: eventSpeakerInvite.status,
				invitedAt: eventSpeakerInvite.invitedAt,
				respondedAt: eventSpeakerInvite.respondedAt,
			})
			.from(eventSpeakerInvite)
			.innerJoin(user, eq(user.id, eventSpeakerInvite.userId))
			.where(eq(eventSpeakerInvite.eventId, input.eventId));

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

		const reviewerRows = await db
			.select({
				id: eventReviewerInvite.id,
				eventId: eventReviewerInvite.eventId,
				userId: eventReviewerInvite.userId,
				userName: user.name,
				userEmail: user.email,
				slot: eventReviewerInvite.slot,
				status: eventReviewerInvite.status,
				invitedAt: eventReviewerInvite.invitedAt,
				respondedAt: eventReviewerInvite.respondedAt,
			})
			.from(eventReviewerInvite)
			.innerJoin(user, eq(user.id, eventReviewerInvite.userId))
			.where(eq(eventReviewerInvite.eventId, input.eventId));

		const speakers = speakersRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			affiliation: r.affiliation ?? null,
			slot: r.slot,
			status: r.status as "pending" | "accepted" | "rejected",
			invitedAt: r.invitedAt,
			respondedAt: r.respondedAt ?? null,
		}));

		const committee = committeeRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			assignedAt: r.assignedAt,
		}));

		const reviewers = reviewerRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			slot: r.slot,
			status: r.status as "pending" | "accepted" | "rejected",
			invitedAt: r.invitedAt,
			respondedAt: r.respondedAt ?? null,
		}));

		return { speakers, committee, reviewers };
	});

export const inviteSpeakerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/speaker" })
	.input(inviteSpeakerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const organizerId = context.session.user.id;
		await assertOrganizer(input.eventId, organizerId);

		const [foundUser] = await db
			.select({ id: user.id, email: user.email })
			.from(user)
			.where(eq(user.email, input.email))
			.limit(1);

		if (!foundUser) {
			throw new ORPCError("NOT_FOUND", {
				message: "User not found. Ask them to create an account first.",
			});
		}

		// Enforce backup rule: slot 2-3 only allowed after at least one rejection exists.
		if (input.slot >= 2) {
			const rejectedRows = await db
				.select({
					rejectedCount: count(),
				})
				.from(eventSpeakerInvite)
				.where(and(eq(eventSpeakerInvite.eventId, input.eventId), eq(eventSpeakerInvite.status, "rejected")));

			const rejectedCount = rejectedRows[0]?.rejectedCount ?? 0;

			if (rejectedCount < 1) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Backup speakers can only be invited after a speaker rejects.",
				});
			}
		}

		const existing = await db
			.select({ id: eventSpeakerInvite.id })
			.from(eventSpeakerInvite)
			.where(and(eq(eventSpeakerInvite.eventId, input.eventId), eq(eventSpeakerInvite.userId, foundUser.id)))
			.limit(1);

		if (existing.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Speaker already invited/added for this event" });
		}

		const existingSlot = await db
			.select({ id: eventSpeakerInvite.id })
			.from(eventSpeakerInvite)
			.where(and(eq(eventSpeakerInvite.eventId, input.eventId), eq(eventSpeakerInvite.slot, input.slot)))
			.limit(1);

		if (existingSlot.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: `Speaker slot ${input.slot} is already used.` });
		}

		await db.insert(eventSpeakerInvite).values({
			eventId: input.eventId,
			userId: foundUser.id,
			slot: input.slot,
			affiliation: input.affiliation ?? null,
			status: "pending",
		});

		return { ok: true as const };
	});

export const inviteCommitteeRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/committee" })
	.input(inviteCommitteeInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const organizerId = context.session.user.id;
		await assertOrganizer(input.eventId, organizerId);

		const [foundUser] = await db
			.select({ id: user.id, email: user.email })
			.from(user)
			.where(eq(user.email, input.email))
			.limit(1);

		if (!foundUser) {
			throw new ORPCError("NOT_FOUND", {
				message: "User not found. Ask them to create an account first.",
			});
		}

		const existing = await db
			.select({ id: eventCommittee.id })
			.from(eventCommittee)
			.where(and(eq(eventCommittee.eventId, input.eventId), eq(eventCommittee.userId, foundUser.id)))
			.limit(1);

		if (existing.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: "User already in committee for this event" });
		}

		await db.insert(eventCommittee).values({
			eventId: input.eventId,
			userId: foundUser.id,
		});

		return { ok: true as const };
	});

export const inviteReviewerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/reviewer" })
	.input(inviteReviewerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const organizerId = context.session.user.id;
		await assertOrganizer(input.eventId, organizerId);

		const [foundUser] = await db
			.select({ id: user.id, email: user.email })
			.from(user)
			.where(eq(user.email, input.email))
			.limit(1);

		if (!foundUser) {
			throw new ORPCError("NOT_FOUND", {
				message: "User not found. Ask them to create an account first.",
			});
		}

		// Enforce backup rule: slot 4-5 only allowed after at least one rejection exists.
		if (input.slot >= 4) {
			const rejectedRows = await db
				.select({
					rejectedCount: count(),
				})
				.from(eventReviewerInvite)
				.where(
					and(
						eq(eventReviewerInvite.eventId, input.eventId),
						eq(eventReviewerInvite.status, "rejected"),
					),
				);

			const rejectedCount = rejectedRows[0]?.rejectedCount ?? 0;

			if (rejectedCount < 1) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Backup reviewers can only be invited after a reviewer rejects.",
				});
			}
		}

		const existingUser = await db
			.select({ id: eventReviewerInvite.id })
			.from(eventReviewerInvite)
			.where(
				and(
					eq(eventReviewerInvite.eventId, input.eventId),
					eq(eventReviewerInvite.userId, foundUser.id),
				),
			)
			.limit(1);

		if (existingUser.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Reviewer already invited for this event" });
		}

		const existingSlot = await db
			.select({ id: eventReviewerInvite.id })
			.from(eventReviewerInvite)
			.where(and(eq(eventReviewerInvite.eventId, input.eventId), eq(eventReviewerInvite.slot, input.slot)))
			.limit(1);

		if (existingSlot.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: `Reviewer slot ${input.slot} is already used.` });
		}

		await db.insert(eventReviewerInvite).values({
			eventId: input.eventId,
			userId: foundUser.id,
			slot: input.slot,
			status: "pending",
		});

		return { ok: true as const };
	});

export const acceptSpeakerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/speaker/accept" })
	.input(acceptSpeakerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({ id: eventSpeakerInvite.id, status: eventSpeakerInvite.status })
			.from(eventSpeakerInvite)
			.where(and(eq(eventSpeakerInvite.eventId, input.eventId), eq(eventSpeakerInvite.userId, userId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No speaker invite found for you in this event" });
		}

		if (found.status !== "pending") {
			throw new ORPCError("BAD_REQUEST", { message: `Speaker invite already ${found.status}` });
		}

		await db
			.update(eventSpeakerInvite)
			.set({ status: "accepted", respondedAt: new Date() })
			.where(eq(eventSpeakerInvite.id, found.id));

		return { ok: true as const };
	});

export const rejectSpeakerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/speaker/reject" })
	.input(acceptSpeakerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({ id: eventSpeakerInvite.id, status: eventSpeakerInvite.status })
			.from(eventSpeakerInvite)
			.where(and(eq(eventSpeakerInvite.eventId, input.eventId), eq(eventSpeakerInvite.userId, userId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No speaker invite found for you in this event" });
		}

		if (found.status !== "pending") {
			throw new ORPCError("BAD_REQUEST", { message: `Speaker invite already ${found.status}` });
		}

		await db
			.update(eventSpeakerInvite)
			.set({ status: "rejected", respondedAt: new Date() })
			.where(eq(eventSpeakerInvite.id, found.id));

		return { ok: true as const };
	});

const listForMeOutput = z.object({
	committee: z.array(committeeInviteSchema),
	speakers: z.array(speakerInviteSchema),
	reviewers: z.array(reviewerInviteSchema),
});

export const listMyInvitesRouter = protectedProcedure
	.route({ method: "GET", path: "/events/invites/mine" })
	.output(listForMeOutput)
	.handler(async ({ context }) => {
		const userId = context.session.user.id;

		const speakersRows = await db
			.select({
				id: eventSpeakerInvite.id,
				eventId: eventSpeakerInvite.eventId,
				userId: eventSpeakerInvite.userId,
				userName: user.name,
				userEmail: user.email,
				affiliation: eventSpeakerInvite.affiliation,
				slot: eventSpeakerInvite.slot,
				status: eventSpeakerInvite.status,
				invitedAt: eventSpeakerInvite.invitedAt,
				respondedAt: eventSpeakerInvite.respondedAt,
			})
			.from(eventSpeakerInvite)
			.innerJoin(user, eq(user.id, eventSpeakerInvite.userId))
			.where(eq(eventSpeakerInvite.userId, userId));

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
			.where(eq(eventCommittee.userId, userId));

		const reviewerRows = await db
			.select({
				id: eventReviewerInvite.id,
				eventId: eventReviewerInvite.eventId,
				userId: eventReviewerInvite.userId,
				userName: user.name,
				userEmail: user.email,
				slot: eventReviewerInvite.slot,
				status: eventReviewerInvite.status,
				invitedAt: eventReviewerInvite.invitedAt,
				respondedAt: eventReviewerInvite.respondedAt,
			})
			.from(eventReviewerInvite)
			.innerJoin(user, eq(user.id, eventReviewerInvite.userId))
			.where(eq(eventReviewerInvite.userId, userId));

		const speakers = speakersRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			affiliation: r.affiliation ?? null,
			slot: r.slot,
			status: r.status as "pending" | "accepted" | "rejected",
			invitedAt: r.invitedAt,
			respondedAt: r.respondedAt ?? null,
		}));

		const committee = committeeRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			assignedAt: r.assignedAt,
		}));

		const reviewers = reviewerRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			slot: r.slot,
			status: r.status as "pending" | "accepted" | "rejected",
			invitedAt: r.invitedAt,
			respondedAt: r.respondedAt ?? null,
		}));

		return { speakers, committee, reviewers };
	});

export const acceptReviewerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/reviewer/accept" })
	.input(respondReviewerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({ id: eventReviewerInvite.id, status: eventReviewerInvite.status })
			.from(eventReviewerInvite)
			.where(and(eq(eventReviewerInvite.eventId, input.eventId), eq(eventReviewerInvite.userId, userId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No reviewer invite found for you in this event" });
		}

		if (found.status !== "pending") {
			throw new ORPCError("BAD_REQUEST", { message: `Reviewer invite already ${found.status}` });
		}

		await db
			.update(eventReviewerInvite)
			.set({ status: "accepted", respondedAt: new Date() })
			.where(eq(eventReviewerInvite.id, found.id));

		return { ok: true as const };
	});

export const rejectReviewerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/reviewer/reject" })
	.input(respondReviewerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({ id: eventReviewerInvite.id, status: eventReviewerInvite.status })
			.from(eventReviewerInvite)
			.where(and(eq(eventReviewerInvite.eventId, input.eventId), eq(eventReviewerInvite.userId, userId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No reviewer invite found for you in this event" });
		}

		if (found.status !== "pending") {
			throw new ORPCError("BAD_REQUEST", { message: `Reviewer invite already ${found.status}` });
		}

		await db
			.update(eventReviewerInvite)
			.set({ status: "rejected", respondedAt: new Date() })
			.where(eq(eventReviewerInvite.id, found.id));

		return { ok: true as const };
	});
