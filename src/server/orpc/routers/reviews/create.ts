import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  review,
  reviewAssignment,
  reviewRecommendationValues,
  submission,
  event,
  user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/sendEmail";
import { SubmissionReviewedEmail } from "@/lib/emails/SubmissionReviewedEmail";
import { env } from "@/env";

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

    // Verify the user is assigned to review this submission
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

      if (existingReview) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "You already submitted a review for this submission. Editing is not allowed.",
        });
      }

      const reviewId = uuidv4();
      const now = new Date();

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

      // Check if all 3 reviews are complete and auto-update status + send email
      checkAndFinalizeSubmission(input.submissionId).catch((error) => {
        console.error("Failed to finalize submission:", error);
      });

      return created;
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

/**
 * Check if all 3 reviews are complete for a submission.
 * If so, calculate the final status (2+ accepts = accepted) and send notification email.
 */
async function checkAndFinalizeSubmission(submissionId: string) {
  // Get all reviews for this submission
  const reviews = await db
    .select({
      id: review.id,
      recommendation: review.recommendation,
      comment: review.comment,
      reviewerId: review.reviewerId,
    })
    .from(review)
    .where(eq(review.submissionId, submissionId));

  // Only proceed if we have exactly 3 reviews
  if (reviews.length !== 3) {
    return;
  }

  // Count accepts and rejects
  const acceptCount = reviews.filter(
    (r) => r.recommendation === "accept",
  ).length;
  const finalStatus = acceptCount >= 2 ? "accepted" : "rejected";

  // Get submission details
  const [submissionData] = await db
    .select({
      id: submission.id,
      title: submission.title,
      status: submission.status,
      submitterId: submission.submitterId,
      eventId: submission.eventId,
    })
    .from(submission)
    .where(eq(submission.id, submissionId))
    .limit(1);

  if (!submissionData) {
    console.error("Submission not found for finalization:", submissionId);
    return;
  }

  // Skip if already finalized
  if (submissionData.status !== "draft") {
    return;
  }

  // Update submission status
  await db
    .update(submission)
    .set({
      status: finalStatus,
      updatedAt: new Date(),
    })
    .where(eq(submission.id, submissionId));

  // Get submitter and event details for email
  const [submitterData] = await db
    .select({
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, submissionData.submitterId))
    .limit(1);

  const [eventData] = await db
    .select({
      title: event.title,
    })
    .from(event)
    .where(eq(event.id, submissionData.eventId))
    .limit(1);

  if (!submitterData || !eventData) {
    console.error("Missing submitter or event data for email");
    return;
  }

  // Prepare reviewer feedback for email
  const reviewerFeedback = reviews.map((r) => ({
    reviewerName: `Reviewer`, // Anonymous reviewers
    recommendation: r.recommendation as "accept" | "reject",
    comment: r.comment,
  }));

  // Send notification email
  await sendEmail(
    submitterData.email,
    `Your submission has been ${finalStatus} - ${eventData.title}`,
    SubmissionReviewedEmail,
    {
      recipientName: submitterData.name,
      eventTitle: eventData.title,
      submissionTitle: submissionData.title,
      status: finalStatus,
      reviewerFeedback,
      viewUrl: `${env.BETTER_AUTH_URL}/my-applications`,
    },
  );

  console.log(
    `Submission ${submissionId} finalized as ${finalStatus}, email sent to ${submitterData.email}`,
  );
}
