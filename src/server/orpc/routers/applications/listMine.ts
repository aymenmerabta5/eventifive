import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { submission, workshop, event, review } from "@/server/db/schema";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

const submissionSchema = z.object({
  id: z.string(),
  type: z.literal("submission"),
  title: z.string(),
  abstract: z.string().nullable(),
  submissionType: z.enum(["oral", "poster", "displayed_paper"]),
  status: z.enum(["draft", "accepted", "rejected"]),
  submittedAt: z.date().nullable(),
  updatedAt: z.date(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
  reviewerFeedback: z
    .array(
      z.object({
        recommendation: z.enum(["accept", "reject"]).nullable(),
        comment: z.string().nullable(),
      }),
    )
    .nullable(),
});

const workshopSchema = z.object({
  id: z.string(),
  type: z.literal("workshop"),
  title: z.string(),
  description: z.string().nullable(),
  researchDomain: z.string().nullable(),
  status: z.enum(["pending", "accepted", "rejected"]),
  proposedAt: z.date(),
  respondedAt: z.date().nullable(),
  rejectionReason: z.string().nullable(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
});

const outputSchema = z.object({
  submissions: z.array(submissionSchema),
  workshops: z.array(workshopSchema),
});

/**
 * List all applications for the current user.
 * Returns both communicator submissions and workshop proposals.
 */
export const listMyApplicationsRouter = protectedProcedure
  .route({ method: "GET", path: "/applications/mine" })
  .output(outputSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    // Get user's submissions with event info
    const submissions = await db
      .select({
        id: submission.id,
        title: submission.title,
        abstract: submission.abstract,
        submissionType: submission.type,
        status: submission.status,
        submittedAt: submission.submittedAt,
        updatedAt: submission.updatedAt,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
      })
      .from(submission)
      .innerJoin(event, eq(submission.eventId, event.id))
      .where(eq(submission.submitterId, userId))
      .orderBy(desc(submission.updatedAt));

    // Get reviewer feedback for each submission
    const submissionsWithFeedback = await Promise.all(
      submissions.map(async (s) => {
        // Only fetch reviews if submission is finalized
        let reviewerFeedback = null;
        if (s.status !== "draft") {
          const reviews = await db
            .select({
              recommendation: review.recommendation,
              comment: review.comment,
            })
            .from(review)
            .where(eq(review.submissionId, s.id));

          if (reviews.length > 0) {
            reviewerFeedback = reviews.map((r) => ({
              recommendation: r.recommendation as "accept" | "reject" | null,
              comment: r.comment,
            }));
          }
        }

        return {
          id: s.id,
          type: "submission" as const,
          title: s.title,
          abstract: s.abstract,
          submissionType: s.submissionType as
            | "oral"
            | "poster"
            | "displayed_paper",
          status: s.status as "draft" | "accepted" | "rejected",
          submittedAt: s.submittedAt,
          updatedAt: s.updatedAt,
          event: {
            id: s.eventId,
            title: s.eventTitle,
            type: s.eventType,
            startDate: s.eventStartDate,
            endDate: s.eventEndDate,
          },
          reviewerFeedback,
        };
      }),
    );

    // Get user's workshop proposals with event info
    const workshops = await db
      .select({
        id: workshop.id,
        title: workshop.title,
        description: workshop.description,
        researchDomain: workshop.researchDomain,
        proposalStatus: workshop.proposalStatus,
        proposedAt: workshop.proposedAt,
        respondedAt: workshop.respondedAt,
        rejectionReason: workshop.rejectionReason,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
      })
      .from(workshop)
      .innerJoin(event, eq(workshop.eventId, event.id))
      .where(eq(workshop.facilitatorId, userId))
      .orderBy(desc(workshop.proposedAt));

    return {
      submissions: submissionsWithFeedback,
      workshops: workshops.map((w) => ({
        id: w.id,
        type: "workshop" as const,
        title: w.title,
        description: w.description,
        researchDomain: w.researchDomain,
        status: w.proposalStatus as "pending" | "accepted" | "rejected",
        proposedAt: w.proposedAt,
        respondedAt: w.respondedAt,
        rejectionReason: w.rejectionReason,
        event: {
          id: w.eventId,
          title: w.eventTitle,
          type: w.eventType,
          startDate: w.eventStartDate,
          endDate: w.eventEndDate,
        },
      })),
    };
  });
