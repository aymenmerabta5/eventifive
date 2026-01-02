import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { sessionQuestions, user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { publishSessionQAEvent } from "@/server/realtime/session-qa";
import { getSessionManagerInfo } from "./utils";

const inputApproveQuestionSchema = z.object({
  questionId: z.string().min(1),
  approved: z.boolean(),
});

const outputApproveQuestionSchema = z.object({
  questionId: z.string(),
  isApproved: z.boolean(),
});

export const approveQuestionRouter = protectedProcedure
  .route({ method: "POST", path: "/qa/questions/approve" })
  .input(inputApproveQuestionSchema)
  .output(outputApproveQuestionSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { questionId, approved } = input;

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

    // Only session managers can approve/reject questions
    if (!managerInfo.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only session managers can approve or reject questions",
      });
    }

    // Update the question approval status
    await db
      .update(sessionQuestions)
      .set({
        isApproved: approved,
        updatedAt: new Date(),
      })
      .where(eq(sessionQuestions.id, questionId));

    // Get user info for the event
    const userData = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, questionData.oderId))
      .limit(1);

    // Publish approval event
    if (approved) {
      // When approved, publish as a new question so attendees can see it
      await publishSessionQAEvent(questionData.sessionId, {
        type: "question_created",
        question: {
          id: questionData.id,
          sessionId: questionData.sessionId,
          userId: questionData.oderId,
          userName: userData[0]?.name ?? "Unknown",
          userImage: userData[0]?.image ?? null,
          content: questionData.content,
          isAnonymous: questionData.isAnonymous,
          isApproved: true,
          isAnswered: questionData.isAnswered,
          likeCount: questionData.likeCount,
          createdAt: questionData.createdAt,
        },
      });
    } else {
      // When rejected, publish delete so it's removed from view
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
          isApproved: false,
          isAnswered: questionData.isAnswered,
          likeCount: questionData.likeCount,
          createdAt: questionData.createdAt,
        },
      });
    }

    return {
      questionId,
      isApproved: approved,
    };
  });
