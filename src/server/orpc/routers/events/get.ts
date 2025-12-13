import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { event, eventImages, files, eventTypeValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputSchema = z.object({
	id: z.string().uuid(),
});

const eventSchema = z.object({
	id: z.string(),
	title: z.string(),
	smallDescription: z.string().nullable(),
	type: z.enum(eventTypeValues),
	startDate: z.date(),
	endDate: z.date(),
	location: z.string().nullable(),
	priceAmount: z.number(),
	priceCurrency: z.string(),
	organizerId: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	imageUrl: z.string().nullable(),
});

export const getEventRouter = publicProcedure
	.route({ method: "GET", path: "/events/{id}" })
	.input(inputSchema)
	.output(eventSchema)
	.handler(async ({ input }) => {
		try {
			const found = await db.query.event.findFirst({
				where: eq(event.id, input.id),
			});

			if (!found) {
				throw new ORPCError("NOT_FOUND", { message: "Event not found" });
			}

			let imageUrl: string | null = null;

			// Get default image from eventImages table
			const [defaultImage] = await db
				.select({ s3Key: files.s3Key })
				.from(eventImages)
				.innerJoin(files, eq(eventImages.fileId, files.id))
				.where(eq(eventImages.eventId, found.id))
				.limit(1);

			if (defaultImage?.s3Key) {
				try {
					const { downloadUrl } = await generatePresignedDownloadUrl(defaultImage.s3Key);
					imageUrl = downloadUrl;
				} catch (error) {
					console.error(`Failed to generate image URL for event ${found.id}:`, error);
				}
			}

			return {
				...found,
				imageUrl,
			};
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
