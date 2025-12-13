import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventCommittee, eventSpeakers, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
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
});

const inviteCommitteeInput = z.object({
	eventId: z.string().min(1),
	email: z.string().email(),
});

const acceptSpeakerInput = z.object({
	eventId: z.string().min(1),
});

const acceptCommitteeInput = z.object({
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
	status: z.enum(["pending", "accepted"]),
});

const committeeInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string().nullable(),
	userEmail: z.string(),
	assignedAt: z.date(),
});

const listInvitesOutput = z.object({
	speakers: z.array(speakerInviteSchema),
	committee: z.array(committeeInviteSchema),
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
				id: eventSpeakers.id,
				eventId: eventSpeakers.eventId,
				userId: eventSpeakers.userId,
				userName: user.name,
				userEmail: user.email,
				affiliation: eventSpeakers.affiliation,
				isInvited: eventSpeakers.isInvited,
			})
			.from(eventSpeakers)
			.innerJoin(user, eq(user.id, eventSpeakers.userId))
			.where(eq(eventSpeakers.eventId, input.eventId));

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

		const speakers = speakersRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			affiliation: r.affiliation ?? null,
			status: (r.isInvited ? "accepted" : "pending") as "accepted" | "pending",
		}));

		const committee = committeeRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			assignedAt: r.assignedAt,
		}));

		return { speakers, committee };
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

		const existing = await db
			.select({ id: eventSpeakers.id })
			.from(eventSpeakers)
			.where(and(eq(eventSpeakers.eventId, input.eventId), eq(eventSpeakers.userId, foundUser.id)))
			.limit(1);

		if (existing.length > 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Speaker already invited/added for this event" });
		}

		await db.insert(eventSpeakers).values({
			eventId: input.eventId,
			userId: foundUser.id,
			affiliation: input.affiliation ?? null,
			isInvited: false, // pending until they accept on /invites
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

export const acceptSpeakerRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/speaker/accept" })
	.input(acceptSpeakerInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({ id: eventSpeakers.id, isInvited: eventSpeakers.isInvited })
			.from(eventSpeakers)
			.where(and(eq(eventSpeakers.eventId, input.eventId), eq(eventSpeakers.userId, userId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No speaker invite found for you in this event" });
		}

		if (found.isInvited) {
			throw new ORPCError("BAD_REQUEST", { message: "Speaker invite already accepted" });
		}

		await db.update(eventSpeakers).set({ isInvited: true }).where(eq(eventSpeakers.id, found.id));

		return { ok: true as const };
	});

const listForMeOutput = z.object({
	committee: z.array(committeeInviteSchema),
	speakers: z.array(speakerInviteSchema),
});

export const listMyInvitesRouter = protectedProcedure
	.route({ method: "GET", path: "/events/invites/mine" })
	.output(listForMeOutput)
	.handler(async ({ context }) => {
		const userId = context.session.user.id;

		const speakersRows = await db
			.select({
				id: eventSpeakers.id,
				eventId: eventSpeakers.eventId,
				userId: eventSpeakers.userId,
				userName: user.name,
				userEmail: user.email,
				affiliation: eventSpeakers.affiliation,
				isInvited: eventSpeakers.isInvited,
			})
			.from(eventSpeakers)
			.innerJoin(user, eq(user.id, eventSpeakers.userId))
			.where(eq(eventSpeakers.userId, userId));

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

		const speakers = speakersRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			affiliation: r.affiliation ?? null,
			status: (r.isInvited ? "accepted" : "pending") as "accepted" | "pending",
		}));

		const committee = committeeRows.map((r) => ({
			id: r.id,
			eventId: r.eventId,
			userId: r.userId,
			userName: r.userName,
			userEmail: r.userEmail,
			assignedAt: r.assignedAt,
		}));

		return { speakers, committee };
	});
