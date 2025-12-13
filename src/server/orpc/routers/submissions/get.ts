import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { submission, submissionFile, files, reviewAssignment, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
	id: z.string().uuid(),
});

const fileSchema = z.object({
	id: z.string(),
	fileName: z.string(),
	fileSize: z.number(),
	contentType: z.string(),
	purpose: z.string().nullable(),
});

const submissionSchema = z.object({
	id: z.string(),
	eventId: z.string(),
	title: z.string(),
	abstract: z.string().nullable(),
	keywords: z.string().nullable(),
	type: z.string(),
	status: z.string(),
	submitterId: z.string(),
	submittedAt: z.date().nullable(),
	updatedAt: z.date(),
	files: z.array(fileSchema),
});

export const getSubmissionRouter = protectedProcedure
	.route({ method: "POST", path: "/submissions/get" })
	.input(inputSchema)
	.output(submissionSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		try {
			const [found] = await db
				.select()
				.from(submission)
				.where(eq(submission.id, input.id))
				.limit(1);

			if (!found) {
				throw new ORPCError("NOT_FOUND", { message: "Submission not found" });
			}

			const isSubmitter = found.submitterId === session.user.id;

			const [reviewAssignmentRecord] = await db
				.select()
				.from(reviewAssignment)
				.where(
					and(
						eq(reviewAssignment.submissionId, found.id),
						eq(reviewAssignment.reviewerId, session.user.id),
					),
				)
				.limit(1);

			const isReviewer = !!reviewAssignmentRecord;

			const [eventRecord] = await db
				.select()
				.from(event)
				.where(eq(event.id, found.eventId))
				.limit(1);

			const isOrganizer = eventRecord?.organizerId === session.user.id;

			if (!isSubmitter && !isReviewer && !isOrganizer) {
				throw new ORPCError("FORBIDDEN", {
					message: "You do not have permission to access this submission",
				});
			}

			const submissionFiles = await db
				.select({
					id: files.id,
					fileName: files.fileName,
					fileSize: files.fileSize,
					contentType: files.contentType,
					purpose: submissionFile.purpose,
				})
				.from(submissionFile)
				.innerJoin(files, eq(submissionFile.fileId, files.id))
				.where(eq(submissionFile.submissionId, found.id));

			return {
				...found,
				files: submissionFiles,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			console.error("Failed to fetch submission:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to fetch submission",
			});
		}
	});
