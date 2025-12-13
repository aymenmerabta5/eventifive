import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventTypeValues } from "@/server/db/schema";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

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
	imageUrl: z.string().nullable(),
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

		// TEACHING: Generate presigned URLs for each event's image
		const eventsWithUrls = await Promise.all(
			events.map(async (evt) => {
				let imageUrl: string | null = null;

				if (evt.image) {
					try {
						const { downloadUrl } = await generatePresignedDownloadUrl(evt.image);
						imageUrl = downloadUrl;
					} catch (error) {
						console.error(`Failed to generate image URL for event ${evt.id}:`, error);
					}
				}

				return {
					...evt,
					imageUrl,
				};
			})
		);

		return {
			events: eventsWithUrls,
			total: eventsWithUrls.length,
		};
	});
