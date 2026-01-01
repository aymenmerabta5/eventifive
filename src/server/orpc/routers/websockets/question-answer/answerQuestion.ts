import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { sessionQuestions, sessionQuestionAnswers, user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { publishSessionQAEvent } from "@/server/realtime/session-qa";
import { getSessionManagerInfo } from "./utils";

const inputAnswerQuestionSchema = z.object({
  questionId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

const answerRoleSchema = z.enum(["organizer", "chair", "communicator", "speaker"]);

const outputAnswerQuestionSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  content: z.string(),
  role: answerRoleSchema,
  createdAt: z.date(),
});

export const answerQuestionRouter = protectedProcedure
  .route({ method: "POST", path: "/qa/questions/answer" })
  .input(inputAnswerQuestionSchema)
  .output(outputAnswerQuestionSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { questionId, content } = input;

    // Get the question and session info
    const question = await db
      .select({
        id: sessionQuestions.id,
        sessionId: sessionQuestions.sessionId,
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

    // Only session managers can answer questions
    if (!managerInfo.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "Only session managers (organizer, chair, communicator, or speaker) can answer questions",
      });
    }

    // Get user info
    const userData = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const answerId = uuidv4();
    const now = new Date();

    // Insert the answer
    await db.insert(sessionQuestionAnswers).values({
      id: answerId,
      questionId,
      userId,
      content,
      createdAt: now,
      updatedAt: now,
    });

    // Mark question as answered
    await db
      .update(sessionQuestions)
      .set({
        isAnswered: true,
        updatedAt: now,
      })
      .where(eq(sessionQuestions.id, questionId));

    // Determine the role to display (priority: organizer > chair > communicator > speaker)
    const role = managerInfo.isOrganizer
      ? "organizer"
      : managerInfo.isChair
        ? "chair"
        : managerInfo.isCommunicator
          ? "communicator"
          : "speaker";

    const answer = {
      id: answerId,
      questionId,
      userId,
      userName: userData[0]?.name ?? "Unknown",
      userImage: userData[0]?.image ?? null,
      content,
      role: role as "organizer" | "chair" | "communicator" | "speaker",
      createdAt: now,
    };

    // Publish answer event
    await publishSessionQAEvent(questionData.sessionId, {
      type: "answer_created",
      answer,
    });

    return answer;
  });
