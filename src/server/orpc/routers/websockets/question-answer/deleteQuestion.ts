import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { sessionQuestions, user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { publishSessionQAEvent } from "@/server/realtime/session-qa";
import { getSessionManagerInfo } from "./utils";

const inputDeleteQuestionSchema = z.object({
  questionId: z.string().min(1),
});

const outputDeleteQuestionSchema = z.object({
  success: z.boolean(),
  questionId: z.string(),
});

export const deleteQuestionRouter = protectedProcedure
  .route({ method: "DELETE", path: "/qa/questions" })
  .input(inputDeleteQuestionSchema)
  .output(outputDeleteQuestionSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { questionId } = input;

    // Get the question
    const question = await db
      .select({
        id: sessionQuestions.id,
        sessionId: sessionQuestions.sessionId,
        oderId: sessionQuestions.userId,
        content: sessionQuestions.content,
        isAnonymous: sessionQuestions.isAnonymous,
        isApproved: sessionQuestions.isApproved,
        isAnswered: sessionQuestions.isAnswered,
        likeCount: sessionQuestions.likeCount,
        createdAt: sessionQuestions.createdAt,
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

    // Check session manager permissions
    const managerInfo = await getSessionManagerInfo(
      questionData.sessionId,
      userId,
    );

    if (!managerInfo) {
      throw new ORPCError("NOT_FOUND", {
        message: "Session not found",
      });
    }

    const isOwner = questionData.oderId === userId;

    // Only owner or session managers can delete
    if (!isOwner && !managerInfo.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have permission to delete this question",
      });
    }

    // Get user info for the event
    const userData = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, questionData.oderId))
      .limit(1);

    // Delete the question (cascades to likes and answers)
    await db
      .delete(sessionQuestions)
      .where(eq(sessionQuestions.id, questionId));

    // Publish delete event
    await publishSessionQAEvent(questionData.sessionId, {
      type: "question_deleted",
      question: {
        id: questionData.id,
        sessionId: questionData.sessionId,
        userId: questionData.oderId,
        userName: userData[0]?.name ?? "Unknown",
        userImage: userData[0]?.image ?? null,
        content: questionData.content,
        isAnonymous: questionData.isAnonymous,
        isApproved: questionData.isApproved,
        isAnswered: questionData.isAnswered,
        likeCount: questionData.likeCount,
        createdAt: questionData.createdAt,
      },
    });

    return {
      success: true,
      questionId,
    };
  });
