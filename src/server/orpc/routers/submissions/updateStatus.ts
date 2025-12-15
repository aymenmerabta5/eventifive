import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event, submission } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
	submissionId: z.string().uuid(),
	status: z.enum(["accepted", "rejected"]),
});

export const updateSubmissionStatusRouter = protectedProcedure
	.route({ method: "POST", path: "/submissions/update-status" })
	.input(inputSchema)
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		const { submissionId, status } = input;

		const [foundSubmission] = await db
			.select({
				id: submission.id,
				eventId: submission.eventId,
				currentStatus: submission.status,
			})
			.from(submission)
			.where(eq(submission.id, submissionId))
			.limit(1);

		if (!foundSubmission) {
			throw new ORPCError("NOT_FOUND", { message: "Submission not found" });
		}

		const [foundEvent] = await db
			.select({ organizerId: event.organizerId })
			.from(event)
			.where(eq(event.id, foundSubmission.eventId))
			.limit(1);

		if (!foundEvent) {
			throw new ORPCError("NOT_FOUND", { message: "Event not found for submission" });
		}

		if (foundEvent.organizerId !== session.user.id) {
			throw new ORPCError("FORBIDDEN", {
				message: "You are not the organizer of this event",
			});
		}

		if (foundSubmission.currentStatus === status) {
			return { success: true };
		}

		await db
			.update(submission)
			.set({ status, updatedAt: new Date() })
			.where(eq(submission.id, submissionId));

		return { success: true };
	});

