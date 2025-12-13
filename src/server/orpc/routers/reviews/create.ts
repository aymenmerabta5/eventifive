import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { review, reviewRecommendationValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const inputSchema = z.object({
	submissionId: z.string().uuid(),
	score: z.number().min(1).max(10).optional(),
	comment: z.string().optional(),
	recommendation: z.enum(reviewRecommendationValues),
});

const outputSchema = z.object({
	id: z.string(),
	submissionId: z.string(),
	reviewerId: z.string(),
	score: z.number().nullable(),
	comment: z.string().nullable(),
	recommendation: z.enum(reviewRecommendationValues).nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const createReviewRouter = protectedProcedure
	.route({ method: "POST", path: "/reviews/create" })
	.input(inputSchema)
	.output(outputSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		try {
			const [existingReview] = await db
				.select()
				.from(review)
				.where(
					and(
						eq(review.submissionId, input.submissionId),
						eq(review.reviewerId, session.user.id),
					),
				)
				.limit(1);

			const reviewId = existingReview?.id ?? uuidv4();
			const now = new Date();

			if (existingReview) {
				const [updated] = await db
					.update(review)
					.set({
						score: input.score ?? null,
						comment: input.comment ?? null,
						recommendation: input.recommendation,
						updatedAt: now,
					})
					.where(eq(review.id, reviewId))
					.returning();

				if (!updated) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Failed to update review",
					});
				}

				return updated;
			} else {
				const [created] = await db
					.insert(review)
					.values({
						id: reviewId,
						submissionId: input.submissionId,
						reviewerId: session.user.id,
						score: input.score ?? null,
						comment: input.comment ?? null,
						recommendation: input.recommendation,
						createdAt: now,
						updatedAt: now,
					})
					.returning();

				if (!created) {
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Failed to create review",
					});
				}

				return created;
			}
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			console.error("Failed to create/update review:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to create/update review",
			});
		}
	});
