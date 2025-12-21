import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  event,
  eventReviewers,
  review,
  reviewAssignment,
  reviewRecommendationValues,
  submission,
  submissionFile,
  user,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const reviewerStatusSchema = z.object({
  id: z.number(),
  reviewerId: z.string(),
  reviewerName: z.string().nullable(),
  reviewerEmail: z.string(),
  inviteStatus: z.enum(["pending", "accepted", "rejected"]),
  reviewStatus: z.enum(["pending", "accepted", "rejected"]),
  recommendation: z.enum(reviewRecommendationValues).nullable(),
  assignedAt: z.date().nullable(),
  reviewedAt: z.date().nullable(),
});

const submissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  submitterName: z.string().nullable(),
  submitterEmail: z.string().nullable(),
  submittedAt: z.date().nullable(),
  fileCount: z.number(),
  reviewers: z.array(reviewerStatusSchema),
  status: z.enum(["draft", "accepted", "rejected"]),
  abstract: z.string().nullable(),
  keywords: z.string().nullable(),
  type: z.string(),
});

type Recommendation = (typeof reviewRecommendationValues)[number] | null;
type ReviewStatus = "pending" | "accepted" | "rejected";

export const listForOrganizerRouter = protectedProcedure
  .route({ method: "POST", path: "/submissions/list-for-organizer" })
  .input(inputSchema)
  .output(z.object({ submissions: z.array(submissionSchema) }))
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const organizerId = session.user.id;

    const [eventRow] = await db
      .select({ id: event.id, organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (!eventRow) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventRow.organizerId !== organizerId) {
      throw new ORPCError("FORBIDDEN", {
        message: "You are not the organizer of this event",
      });
    }

    try {
      const reviewers = await db
        .select({
          id: eventReviewers.id,
          reviewerId: eventReviewers.userId,
          reviewerName: user.name,
          reviewerEmail: user.email,
          inviteStatus: eventReviewers.status,
        })
        .from(eventReviewers)
        .innerJoin(user, eq(user.id, eventReviewers.userId))
        .where(eq(eventReviewers.eventId, input.eventId));

      const submissions = await db
        .select({
          id: submission.id,
          title: submission.title,
          submittedAt: submission.submittedAt,
          submitterName: user.name,
          submitterEmail: user.email,
          fileCount: sql<number>`count(${submissionFile.id})`,
          status: submission.status,
          abstract: submission.abstract,
          keywords: submission.keywords,
          type: submission.type,
        })
        .from(submission)
        .leftJoin(
          submissionFile,
          eq(submissionFile.submissionId, submission.id),
        )
        .leftJoin(user, eq(user.id, submission.submitterId))
        .where(eq(submission.eventId, input.eventId))
        .groupBy(submission.id, user.id);

      const assignments = await db
        .select({
          submissionId: reviewAssignment.submissionId,
          reviewerId: reviewAssignment.reviewerId,
          assignedAt: reviewAssignment.assignedAt,
        })
        .from(reviewAssignment)
        .innerJoin(submission, eq(submission.id, reviewAssignment.submissionId))
        .where(eq(submission.eventId, input.eventId));

      const reviews = await db
        .select({
          submissionId: review.submissionId,
          reviewerId: review.reviewerId,
          recommendation: review.recommendation,
          reviewedAt: review.updatedAt,
        })
        .from(review)
        .innerJoin(submission, eq(submission.id, review.submissionId))
        .where(eq(submission.eventId, input.eventId));

      const assignmentMap = new Map<
        string,
        Map<string, { assignedAt: Date }>
      >();
      for (const assignment of assignments) {
        const existing = assignmentMap.get(assignment.submissionId);
        if (existing) {
          existing.set(assignment.reviewerId, {
            assignedAt: assignment.assignedAt,
          });
        } else {
          assignmentMap.set(
            assignment.submissionId,
            new Map([
              [assignment.reviewerId, { assignedAt: assignment.assignedAt }],
            ]),
          );
        }
      }

      const reviewMap = new Map<
        string,
        Map<string, { recommendation: Recommendation; reviewedAt: Date | null }>
      >();
      for (const entry of reviews) {
        const existing = reviewMap.get(entry.submissionId);
        const payload = {
          recommendation: (entry.recommendation as Recommendation) ?? null,
          reviewedAt: entry.reviewedAt ?? null,
        };

        if (existing) {
          existing.set(entry.reviewerId, payload);
        } else {
          reviewMap.set(
            entry.submissionId,
            new Map([[entry.reviewerId, payload]]),
          );
        }
      }

      const submissionsWithReviewers = submissions.map((sub) => {
        const reviewerStatuses = reviewers.map((rev) => {
          const assignment = assignmentMap.get(sub.id)?.get(rev.reviewerId);
          const reviewEntry = reviewMap.get(sub.id)?.get(rev.reviewerId);

          const recommendation = reviewEntry?.recommendation ?? null;
          const reviewStatus: ReviewStatus =
            recommendation === "accept"
              ? "accepted"
              : recommendation === "reject"
                ? "rejected"
                : "pending";

          return {
            id: rev.id,
            reviewerId: rev.reviewerId,
            reviewerName: rev.reviewerName ?? null,
            reviewerEmail: rev.reviewerEmail,
            inviteStatus: rev.inviteStatus as ReviewStatus,
            reviewStatus,
            recommendation,
            assignedAt: assignment?.assignedAt ?? null,
            reviewedAt: reviewEntry?.reviewedAt ?? null,
          };
        });

        return {
          id: sub.id,
          title: sub.title,
          submitterName: sub.submitterName ?? null,
          submitterEmail: sub.submitterEmail ?? null,
          submittedAt: sub.submittedAt ?? null,
          fileCount: Number(sub.fileCount ?? 0),
          reviewers: reviewerStatuses,
          status: sub.status,
          abstract: sub.abstract ?? null,
          keywords: sub.keywords ?? null,
          type: sub.type,
        };
      });

      return { submissions: submissionsWithReviewers };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to list organizer submissions:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to load committee registrations",
      });
    }
  });
