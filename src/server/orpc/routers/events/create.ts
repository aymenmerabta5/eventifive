import { protectedProcedure } from "../../index";
import { createEventSchema } from "@/lib/schemas/schemas";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";

const outputCreateEventSchema = z.object({
	status: z.enum(["success", "error"]),
	message: z.string(),
	eventId: z.string().optional(),
});

export const createEventRouter = protectedProcedure
	.route({ method: "POST", path: "/event/create" })
	.input(createEventSchema)
	.output(outputCreateEventSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		try {
			const eventId = randomUUID();
			const now = new Date();

			await db.insert(event).values({
				id: eventId,
				title: input.title,
				description: input.description || null,
				type: input.type,
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				location: input.location || null,
				organizerId: session.user.id,
				createdAt: now,
				updatedAt: now,
			});

			return {
				status: "success" as const,
				message: "Event created successfully",
				eventId: eventId,
			};
		} catch (error) {
			console.error("Failed to create event:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to create event",
			});
		}
	});
