import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventTypeValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { updateEventSchema } from "@/lib/schemas/schemas";

const outputUpdateEventSchema = z.object({
	status: z.enum(["success", "error"]),
	message: z.string(),
	eventId: z.string().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	type: z.enum(eventTypeValues).optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	location: z.string().optional(),
});

export const updateEventRouter = protectedProcedure
	.route({ method: "PATCH", path: "/event/update" })
	.input(updateEventSchema)
	.output(outputUpdateEventSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;
		try {
			const { eventId, title, description, type, startDate, endDate, location } = input;

			const [eventData] = await db
				.select()
				.from(event)
				.where(and(eq(event.id, eventId), eq(event.organizerId, session.user.id)));

			if (!eventData) {
				throw new ORPCError("NOT_FOUND", {
					message: "Event not found",
				});
			}

			await db
				.update(event)
				.set({
					title,
					description,
					type,
					startDate: new Date(startDate),
					endDate: new Date(endDate),
					location,
					updatedAt: new Date(),
				})
				.where(eq(event.id, eventId));

			return {
				status: "success" as const,
				message: "Event updated successfully",
				eventId,
				title,
				description,
				type,
				startDate,
				endDate,
				location,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			console.error("Failed to update event:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error instanceof Error ? error.message : "Failed to update event",
			});
		}
	});
