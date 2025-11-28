import { protectedProcedure } from "../index";
import { db } from "@/server/db";
import { event, roles, userRoles } from "@/server/db/schema";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

const eventSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	type: z.enum(["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"]),
	startDate: z.date(),
	endDate: z.date(),
	location: z.string().nullable(),
	theme: z.string().nullable(),
	contactEmail: z.string().nullable(),
	organizerId: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const outputSchema = z.object({
	events: z.array(eventSchema),
	total: z.number(),
});

export const myEventsRouter = protectedProcedure
	.route({ method: "GET", path: "/events/mine" })
	.output(outputSchema)
	.handler(async ({ context }) => {
		const { session } = context;
		const userId = session.user.id;

		const events = await db
			.select()
			.from(event)
			.where(eq(event.organizerId, userId))
			.orderBy(desc(event.createdAt));

		return {
			events,
			total: events.length,
		};
	});

