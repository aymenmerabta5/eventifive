import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
	submission,
	reviewAssignment,
	files,
	submissionFile,
	user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
	eventId: z.string().min(1),
});

const submissionSummarySchema = z.object({
	id: z.string(),
	title: z.string(),
	submittedAt: z.date().nullable(),
	submitterName: z.string().nullable(),
	submitterEmail: z.string().nullable(),
	fileCount: z.number(),
});

export const listAssignedSubmissionsRouter = protectedProcedure
	.route({ method: "POST", path: "/submissions/list-assigned" })
	.input(inputSchema)
	.output(z.object({ submissions: z.array(submissionSummarySchema) }))
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		try {
			const rows = await db
				.select({
					id: submission.id,
					title: submission.title,
					submittedAt: submission.submittedAt,
					submitterName: user.name,
					submitterEmail: user.email,
					fileCount: sql<number>`count(${files.id})`,
				})
				.from(reviewAssignment)
				.innerJoin(submission, eq(reviewAssignment.submissionId, submission.id))
				.leftJoin(submissionFile, eq(submissionFile.submissionId, submission.id))
				.leftJoin(files, eq(files.id, submissionFile.fileId))
				.leftJoin(user, eq(user.id, submission.submitterId))
				.where(
					and(
						eq(reviewAssignment.reviewerId, session.user.id),
						eq(submission.eventId, input.eventId),
					),
				)
				.groupBy(submission.id, user.id);

			return {
				submissions: rows.map((row) => ({
					id: row.id,
					title: row.title,
					submittedAt: row.submittedAt,
					submitterName: row.submitterName ?? null,
					submitterEmail: row.submitterEmail ?? null,
					fileCount: Number(row.fileCount ?? 0),
				})),
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			console.error("Failed to list assigned submissions:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to list assigned submissions",
			});
		}
	});

