import { z } from "zod";
import { rateLimitedQAProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { sessionQuestions, sessionQuestionLikes } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { publishSessionQAEvent } from "@/server/realtime/session-qa";

const inputLikeQuestionSchema = z.object({
  questionId: z.string().min(1),
});

const outputLikeQuestionSchema = z.object({
  questionId: z.string(),
  likeCount: z.number(),
  hasLiked: z.boolean(),
});

export const likeQuestionRouter = rateLimitedQAProcedure
  .route({ method: "POST", path: "/qa/questions/like" })
  .input(inputLikeQuestionSchema)
  .output(outputLikeQuestionSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { questionId } = input;

    // Get the question
    const question = await db
      .select({
        id: sessionQuestions.id,
        sessionId: sessionQuestions.sessionId,
        likeCount: sessionQuestions.likeCount,
        isApproved: sessionQuestions.isApproved,
      })
      .from(sessionQuestions)
      .where(eq(sessionQuestions.id, questionId))
      .limit(1);

    if (question.length === 0 || !question[0]) {
      throw new ORPCError("NOT_FOUND", {
        message: "Question not found",
      });
    }

    const questionData = question[0];

    if (!questionData.isApproved) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Cannot like an unapproved question",
      });
    }

    // Check if user already liked
    const existingLike = await db
      .select()
      .from(sessionQuestionLikes)
      .where(
        and(
          eq(sessionQuestionLikes.questionId, questionId),
          eq(sessionQuestionLikes.userId, userId),
        ),
      )
      .limit(1);

    let newLikeCount: number;
    let hasLiked: boolean;

    if (existingLike.length > 0) {
      // Unlike - remove the like
      await db
        .delete(sessionQuestionLikes)
        .where(
          and(
            eq(sessionQuestionLikes.questionId, questionId),
            eq(sessionQuestionLikes.userId, userId),
          ),
        );

      // Decrement like count
      await db
        .update(sessionQuestions)
        .set({
          likeCount: sql`${sessionQuestions.likeCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(sessionQuestions.id, questionId));

      newLikeCount = questionData.likeCount - 1;
      hasLiked = false;

      // Publish unlike event
      await publishSessionQAEvent(questionData.sessionId, {
        type: "question_unliked",
        questionId,
        likeCount: newLikeCount,
        userId,
      });
    } else {
      // Like - add the like
      await db.insert(sessionQuestionLikes).values({
        questionId,
        userId,
        createdAt: new Date(),
      });

      // Increment like count
      await db
        .update(sessionQuestions)
        .set({
          likeCount: sql`${sessionQuestions.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(sessionQuestions.id, questionId));

      newLikeCount = questionData.likeCount + 1;
      hasLiked = true;

      // Publish like event
      await publishSessionQAEvent(questionData.sessionId, {
        type: "question_liked",
        questionId,
        likeCount: newLikeCount,
        userId,
      });
    }

    return {
      questionId,
      likeCount: newLikeCount,
      hasLiked,
    };
  });
