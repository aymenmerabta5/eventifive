import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { review, reviewAssignment, reviewRecommendationValues } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const inputSchema = z.object({
	submissionId: z.string().uuid(),
});

const outputSchema = z
	.object({
		id: z.string(),
		submissionId: z.string(),
		reviewerId: z.string(),
		score: z.number().nullable(),
		comment: z.string().nullable(),
		recommendation: z.enum(reviewRecommendationValues).nullable(),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.nullable();

export const getMyReviewRouter = protectedProcedure
	.route({ method: "POST", path: "/reviews/get-mine" })
	.input(inputSchema)
	.output(outputSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		// Only allow reviewers assigned to this submission to view their review
		const [assignment] = await db
			.select()
			.from(reviewAssignment)
			.where(
				and(
					eq(reviewAssignment.submissionId, input.submissionId),
					eq(reviewAssignment.reviewerId, session.user.id),
				),
			)
			.limit(1);

		if (!assignment) {
			throw new ORPCError("FORBIDDEN", {
				message: "You are not assigned to review this submission",
			});
		}

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

		return existingReview ?? null;
	});

