import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventCommittee, eventSpeakers, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

type CommitteeInviteType = "reviewer" | "workshop_facilitator";
type CommitteeInviteStatus = "pending" | "accepted" | "approved";

function encodeCommitteeRole(type: CommitteeInviteType, status: CommitteeInviteStatus) {
	return `${type}:${status}` as `${CommitteeInviteType}:${CommitteeInviteStatus}`;
}

function decodeCommitteeRole(role: string) {
	const [type, status] = role.split(":");
	if (type !== "reviewer" && type !== "workshop_facilitator") return null;
	if (status !== "pending" && status !== "accepted" && status !== "approved") return null;
	return { type, status } as const;
}

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
	bio: z.string().max(2000).optional(),
});

const inviteCommitteeInput = z.object({
	eventId: z.string().min(1),
	email: z.string().email(),
	type: z.enum(["reviewer", "workshop_facilitator"]),
});

const approveCommitteeInput = z.object({
	eventId: z.string().min(1),
	committeeId: z.number().int().positive(),
});

const acceptCommitteeInput = z.object({
	eventId: z.string().min(1),
	type: z.enum(["reviewer", "workshop_facilitator"]),
});

const acceptSpeakerInput = z.object({
	eventId: z.string().min(1),
});

const listForEventInput = z.object({
	eventId: z.string().min(1),
});

const committeeInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
	type: z.enum(["reviewer", "workshop_facilitator"]),
	status: z.enum(["pending", "accepted", "approved"]),
	assignedAt: z.date(),
});

const speakerInviteSchema = z.object({
	id: z.number(),
	eventId: z.string(),
	userId: z.string(),
	userName: z.string(),
	userEmail: z.string(),
	affiliation: z.string().nullable(),
	bio: z.string().nullable(),
	status: z.enum(["pending", "accepted"]),
});

const listForEventOutput = z.object({
	speakers: z.array(speakerInviteSchema),
	committee: z.array(committeeInviteSchema),
});

export const listInvitesForEventRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/list" })
	.input(listForEventInput)
	.output(listForEventOutput)
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
				bio: eventSpeakers.bio,
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
				role: eventCommittee.role,
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
			bio: r.bio ?? null,
			status: (r.isInvited ? "accepted" : "pending") as "accepted" | "pending",
		}));

		const committee = committeeRows
			.map((r) => {
				const parsed = r.role ? decodeCommitteeRole(r.role) : null;
				if (!parsed) return null;
				return {
					id: r.id,
					eventId: r.eventId,
					userId: r.userId,
					userName: r.userName,
					userEmail: r.userEmail,
					type: parsed.type,
					status: parsed.status,
					assignedAt: r.assignedAt,
				};
			})
			.filter((x): x is z.infer<typeof committeeInviteSchema> => x !== null);

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
			bio: input.bio ?? null,
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

		const roleValue = encodeCommitteeRole(input.type, "pending");

		const existing = await db
			.select({ id: eventCommittee.id, role: eventCommittee.role })
			.from(eventCommittee)
			.where(and(eq(eventCommittee.eventId, input.eventId), eq(eventCommittee.userId, foundUser.id)))
			.limit(50);

		const hasSameType = existing.some((r) => {
			if (!r.role) return false;
			const parsed = decodeCommitteeRole(r.role);
			return parsed?.type === input.type;
		});

		if (hasSameType) {
			throw new ORPCError("BAD_REQUEST", { message: `User already invited as ${input.type}` });
		}

		await db.insert(eventCommittee).values({
			eventId: input.eventId,
			userId: foundUser.id,
			role: roleValue,
		});

		return { ok: true as const };
	});

export const approveCommitteeRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/committee/approve" })
	.input(approveCommitteeInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const organizerId = context.session.user.id;
		await assertOrganizer(input.eventId, organizerId);

		const [found] = await db
			.select({
				id: eventCommittee.id,
				role: eventCommittee.role,
			})
			.from(eventCommittee)
			.where(and(eq(eventCommittee.id, input.committeeId), eq(eventCommittee.eventId, input.eventId)))
			.limit(1);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "Invite not found" });
		}

		if (!found.role) {
			throw new ORPCError("BAD_REQUEST", { message: "Invalid invite state" });
		}

		const parsed = decodeCommitteeRole(found.role);
		if (!parsed) {
			throw new ORPCError("BAD_REQUEST", { message: "Invalid invite state" });
		}

		if (parsed.status !== "accepted") {
			throw new ORPCError("BAD_REQUEST", { message: "Invite must be accepted by the user first" });
		}

		await db
			.update(eventCommittee)
			.set({ role: encodeCommitteeRole(parsed.type, "approved") })
			.where(eq(eventCommittee.id, input.committeeId));

		return { ok: true as const };
	});

export const acceptCommitteeRouter = protectedProcedure
	.route({ method: "POST", path: "/events/invites/committee/accept" })
	.input(acceptCommitteeInput)
	.output(z.object({ ok: z.literal(true) }))
	.handler(async ({ context, input }) => {
		const userId = context.session.user.id;

		const [found] = await db
			.select({
				id: eventCommittee.id,
				role: eventCommittee.role,
			})
			.from(eventCommittee)
			.where(and(eq(eventCommittee.eventId, input.eventId), eq(eventCommittee.userId, userId)))
			.limit(50);

		if (!found) {
			throw new ORPCError("NOT_FOUND", { message: "No invite found for you in this event" });
		}

		const parsed = found.role ? decodeCommitteeRole(found.role) : null;
		if (!parsed || parsed.type !== input.type) {
			throw new ORPCError("NOT_FOUND", { message: "No matching invite found for you" });
		}

		if (parsed.status !== "pending") {
			throw new ORPCError("BAD_REQUEST", { message: "Invite already accepted" });
		}

		await db
			.update(eventCommittee)
			.set({ role: encodeCommitteeRole(parsed.type, "accepted") })
			.where(eq(eventCommittee.id, found.id));

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
				bio: eventSpeakers.bio,
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
				role: eventCommittee.role,
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
			bio: r.bio ?? null,
			status: (r.isInvited ? "accepted" : "pending") as "accepted" | "pending",
		}));

		const committee = committeeRows
			.map((r) => {
				const parsed = r.role ? decodeCommitteeRole(r.role) : null;
				if (!parsed) return null;
				return {
					id: r.id,
					eventId: r.eventId,
					userId: r.userId,
					userName: r.userName,
					userEmail: r.userEmail,
					type: parsed.type,
					status: parsed.status,
					assignedAt: r.assignedAt,
				};
			})
			.filter((x): x is z.infer<typeof committeeInviteSchema> => x !== null);

		return { speakers, committee };
	});

export const invitesRouter = {
	listForEvent: listInvitesForEventRouter,
	inviteSpeaker: inviteSpeakerRouter,
	inviteCommittee: inviteCommitteeRouter,
	approveCommittee: approveCommitteeRouter,
	acceptCommittee: acceptCommitteeRouter,
	acceptSpeaker: acceptSpeakerRouter,
	mine: listMyInvitesRouter,
};


