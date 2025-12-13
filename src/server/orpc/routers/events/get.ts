import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventTypeValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
	id: z.string().uuid(),
});


const eventSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	type: z.enum(eventTypeValues),
	startDate: z.date(),
	endDate: z.date(),
	location: z.string().nullable(),
	theme: z.string().nullable(),
	contactEmail: z.string().nullable(),
	organizerId: z.string(),
	priceAmount: z.number(),
	priceCurrency: z.string(),
	chargilyProductId: z.string().nullable(),
	chargilyPriceId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getEventRouter = publicProcedure
	.route({ method: "POST", path: "/events/get" })
	.input(inputSchema)
	.output(eventSchema)
	.handler(async ({ input }) => {
		try {
			const [found] = await db
				.select()
				.from(event)
				.where(eq(event.id, input.id))
				.limit(1);

			if (!found) {
				throw new ORPCError("NOT_FOUND", { message: "Event not found" });
			}

			return found;
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			console.error("Failed to fetch event:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to fetch event",
			});
		}
	});

