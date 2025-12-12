import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { eq, ne } from "drizzle-orm";
import { db } from "../db.js";
import {
  review,
  reviewAssignment,
  submission,
  user,
  reviewRecommendationValues,
} from "../schema.js";

export function registerReviewTools(server: McpServer) {
  // Create a review for a submission
  server.registerTool(
    "eventifive_create_review",
    {
      description: "Create a review for a submission",
      inputSchema: z.object({
        submissionId: z.string().describe("Submission ID to review"),
        reviewerId: z.string().optional().describe("Reviewer user ID (uses random user if not provided)"),
        score: z.number().min(1).max(10).optional().describe("Review score (1-10, auto-generated if not provided)"),
        recommendation: z
          .enum(reviewRecommendationValues)
          .optional()
          .describe("Recommendation: accept, minor_revision, major_revision, reject"),
        comments: z.string().optional().describe("Review comments (auto-generated if not provided)"),
      }),
    },
    async (input) => {
      try {
        const [submissionData] = await db
          .select({
            id: submission.id,
            submitterId: submission.submitterId,
            title: submission.title,
          })
          .from(submission)
          .where(eq(submission.id, input.submissionId))
          .limit(1);

        if (!submissionData) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Submission not found with ID: ${input.submissionId}`,
              },
            ],
            isError: true,
          };
        }

        let reviewerId = input.reviewerId;
        if (!reviewerId) {
          const [randomUser] = await db
            .select({ id: user.id })
            .from(user)
            .where(ne(user.id, submissionData.submitterId))
            .limit(1);

          if (!randomUser) {
            const [anyUser] = await db.select({ id: user.id }).from(user).limit(1);
            if (!anyUser) {
              return {
                content: [
                  {
                    type: "text" as const,
                    text: "Error: No users found. Create users first.",
                  },
                ],
                isError: true,
              };
            }
            reviewerId = anyUser.id;
          } else {
            reviewerId = randomUser.id;
          }
        }

        const reviewId = uuidv4();
        const now = new Date();

        const score = input.score || Math.floor(Math.random() * 5) + 5;
        const recommendation =
          input.recommendation ||
          (score >= 8
            ? "accept"
            : score >= 6
              ? "minor_revision"
              : score >= 4
                ? "major_revision"
                : "reject");

        const comments = input.comments || generateReviewComments(recommendation, submissionData.title);

        await db.insert(review).values({
          id: reviewId,
          submissionId: input.submissionId,
          reviewerId,
          score,
          recommendation,
          comments,
          createdAt: now,
          updatedAt: now,
        });

        await db.insert(reviewAssignment).values({
          submissionId: input.submissionId,
          reviewerId,
          assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: "completed",
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  review: {
                    id: reviewId,
                    submissionId: input.submissionId,
                    reviewerId,
                    score,
                    recommendation,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating review: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create multiple reviews for submissions
  server.registerTool(
    "eventifive_create_reviews_for_event",
    {
      description: "Create reviews for all submissions of an event",
      inputSchema: z.object({
        eventId: z.string().describe("Event ID"),
        reviewsPerSubmission: z
          .number()
          .min(1)
          .max(5)
          .optional()
          .default(2)
          .describe("Number of reviews per submission (1-5)"),
      }),
    },
    async (input) => {
      try {
        const submissions = await db
          .select({
            id: submission.id,
            submitterId: submission.submitterId,
          })
          .from(submission)
          .where(eq(submission.eventId, input.eventId));

        if (submissions.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No submissions found for event: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        const users = await db.select({ id: user.id }).from(user);
        if (users.length < 2) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Need at least 2 users to create reviews.",
              },
            ],
            isError: true,
          };
        }

        const createdReviews: Array<{
          submissionId: string;
          reviewerId: string;
          score: number;
          recommendation: string;
        }> = [];

        const now = new Date();

        for (const sub of submissions) {
          const availableReviewers = users.filter((u) => u.id !== sub.submitterId);
          const reviewerCount = Math.min(input.reviewsPerSubmission || 2, availableReviewers.length);

          for (let i = 0; i < reviewerCount; i++) {
            const reviewer = availableReviewers[i % availableReviewers.length];
            if (!reviewer) {
              throw new Error("No reviewers available for this submission.");
            }
            const reviewerId = reviewer.id;
            const reviewId = uuidv4();
            const score = Math.floor(Math.random() * 5) + 5;
            const recommendation =
              score >= 8
                ? "accept"
                : score >= 6
                  ? "minor_revision"
                  : score >= 4
                    ? "major_revision"
                    : "reject";

            await db.insert(review).values({
              id: reviewId,
              submissionId: sub.id,
              reviewerId,
              score,
              recommendation,
              comments: generateReviewComments(recommendation, "the submission"),
              createdAt: now,
              updatedAt: now,
            });

            await db.insert(reviewAssignment).values({
              submissionId: sub.id,
              reviewerId,
              assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              status: "completed",
            });

            createdReviews.push({
              submissionId: sub.id,
              reviewerId,
              score,
              recommendation,
            });
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  eventId: input.eventId,
                  submissionsReviewed: submissions.length,
                  totalReviews: createdReviews.length,
                  reviews: createdReviews,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating reviews: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // List reviews for a submission
  server.registerTool(
    "eventifive_list_reviews",
    {
      description: "List reviews for a submission",
      inputSchema: z.object({
        submissionId: z.string().describe("Submission ID"),
      }),
    },
    async (input) => {
      try {
        const reviews = await db
          .select({
            id: review.id,
            reviewerId: review.reviewerId,
            score: review.score,
            recommendation: review.recommendation,
            comments: review.comments,
            createdAt: review.createdAt,
          })
          .from(review)
          .where(eq(review.submissionId, input.submissionId));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  submissionId: input.submissionId,
                  count: reviews.length,
                  reviews,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing reviews: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

function generateReviewComments(recommendation: string, _title?: string): string {
  const positiveComments = [
    "The paper presents a well-structured approach with clear methodology.",
    "The research contributes significantly to the field.",
    "The experimental results are convincing and well-documented.",
    "The writing is clear and the arguments are well-supported.",
  ];

  const negativeComments = [
    "The methodology could be explained in more detail.",
    "Some claims require additional supporting evidence.",
    "The related work section could be expanded.",
    "Consider addressing the limitations more explicitly.",
  ];

  let comments = "";

  switch (recommendation) {
    case "accept":
      comments = `${faker.helpers.arrayElement(positiveComments)} ${faker.helpers.arrayElement(positiveComments)} I recommend acceptance.`;
      break;
    case "minor_revision":
      comments = `${faker.helpers.arrayElement(positiveComments)} However, ${faker.helpers.arrayElement(negativeComments).toLowerCase()} Minor revisions are needed before publication.`;
      break;
    case "major_revision":
      comments = `While the topic is interesting, ${faker.helpers.arrayElement(negativeComments).toLowerCase()} Additionally, ${faker.helpers.arrayElement(negativeComments).toLowerCase()} Major revisions are required.`;
      break;
    case "reject":
      comments = `Unfortunately, ${faker.helpers.arrayElement(negativeComments).toLowerCase()} ${faker.helpers.arrayElement(negativeComments)} The paper is not suitable for publication in its current form.`;
      break;
    default:
      comments = faker.lorem.paragraph();
  }

  return comments;
}
