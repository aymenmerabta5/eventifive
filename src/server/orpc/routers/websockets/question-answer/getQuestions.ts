import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  sessionQuestions,
  sessionQuestionLikes,
  sessionQuestionAnswers,
  programSession,
  user,
} from "@/server/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getSessionManagerInfo } from "./utils";

const inputGetQuestionsSchema = z.object({
  sessionId: z.string().min(1),
  includeUnapproved: z.boolean().default(false), // For moderators
});

const questionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  content: z.string(),
  isAnonymous: z.boolean(),
  isApproved: z.boolean(),
  isAnswered: z.boolean(),
  likeCount: z.number(),
  hasLiked: z.boolean(),
  createdAt: z.date(),
  answers: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      userName: z.string(),
      userImage: z.string().nullable(),
      content: z.string(),
      role: z.enum(["organizer", "chair", "committee", "speaker"]),
      createdAt: z.date(),
    }),
  ),
});

const outputGetQuestionsSchema = z.object({
  questions: z.array(questionSchema),
  qaEnabled: z.boolean(),
  qaModerated: z.boolean(),
  isSessionManager: z.boolean(),
});

export const getQuestionsRouter = protectedProcedure
  .route({ method: "GET", path: "/qa/questions" })
  .input(inputGetQuestionsSchema)
  .output(outputGetQuestionsSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId, includeUnapproved } = input;

    // Get session info
    const sessionData = await db
      .select({
        id: programSession.id,
        qaEnabled: programSession.qaEnabled,
        qaModerated: programSession.qaModerated,
      })
      .from(programSession)
      .where(eq(programSession.id, sessionId))
      .limit(1);

    if (sessionData.length === 0 || !sessionData[0]) {
      throw new ORPCError("NOT_FOUND", {
        message: "Session not found",
      });
    }

    const session = sessionData[0];

    // Check if user is a session manager
    const managerInfo = await getSessionManagerInfo(sessionId, userId);
    const isSessionManager = managerInfo?.isSessionManager ?? false;

    // Only session managers can include unapproved questions
    const shouldIncludeUnapproved = includeUnapproved && isSessionManager;

    // Get questions (approved only, unless includeUnapproved and user is moderator)
    const questionsQuery = db
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
        userName: user.name,
        userImage: user.image,
      })
      .from(sessionQuestions)
      .leftJoin(user, eq(sessionQuestions.userId, user.id))
      .where(
        shouldIncludeUnapproved
          ? eq(sessionQuestions.sessionId, sessionId)
          : and(
              eq(sessionQuestions.sessionId, sessionId),
              eq(sessionQuestions.isApproved, true),
            ),
      )
      .orderBy(desc(sessionQuestions.likeCount), desc(sessionQuestions.createdAt));

    const questionsResult = await questionsQuery;

    if (questionsResult.length === 0) {
      return {
        questions: [],
        qaEnabled: session.qaEnabled,
        qaModerated: session.qaModerated,
        isSessionManager,
      };
    }

    const questionIds = questionsResult.map((q) => q.id);

    // Get user's likes
    const userLikes = await db
      .select({ questionId: sessionQuestionLikes.questionId })
      .from(sessionQuestionLikes)
      .where(
        and(
          inArray(sessionQuestionLikes.questionId, questionIds),
          eq(sessionQuestionLikes.userId, userId),
        ),
      );

    const likedQuestionIds = new Set(userLikes.map((l) => l.questionId));

    // Get answers for all questions
    const answers = await db
      .select({
        id: sessionQuestionAnswers.id,
        questionId: sessionQuestionAnswers.questionId,
        userId: sessionQuestionAnswers.userId,
        content: sessionQuestionAnswers.content,
        createdAt: sessionQuestionAnswers.createdAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(sessionQuestionAnswers)
      .leftJoin(user, eq(sessionQuestionAnswers.userId, user.id))
      .where(inArray(sessionQuestionAnswers.questionId, questionIds))
      .orderBy(sessionQuestionAnswers.createdAt);

    // Get unique answerer user IDs to determine their roles
    const answererUserIds = [...new Set(answers.map((a) => a.userId))];

    // Get roles for all answerers
    const answererRoles = new Map<string, "organizer" | "chair" | "committee" | "speaker">();
    for (const oderId of answererUserIds) {
      const roleInfo = await getSessionManagerInfo(sessionId, oderId);
      if (roleInfo) {
        const role = roleInfo.isOrganizer
          ? "organizer"
          : roleInfo.isChair
            ? "chair"
            : roleInfo.isCommitteeMember
              ? "committee"
              : "speaker";
        answererRoles.set(oderId, role);
      }
    }

    // Group answers by question
    const answersByQuestion = new Map<
      string,
      Array<{
        id: string;
        userId: string;
        userName: string;
        userImage: string | null;
        content: string;
        role: "organizer" | "chair" | "committee" | "speaker";
        createdAt: Date;
      }>
    >();

    for (const answer of answers) {
      const questionAnswers = answersByQuestion.get(answer.questionId) ?? [];
      questionAnswers.push({
        id: answer.id,
        userId: answer.userId,
        userName: answer.userName ?? "Unknown",
        userImage: answer.userImage,
        content: answer.content,
        role: answererRoles.get(answer.userId) ?? "speaker",
        createdAt: answer.createdAt,
      });
      answersByQuestion.set(answer.questionId, questionAnswers);
    }

    // Format response
    const questions = questionsResult.map((q) => ({
      id: q.id,
      sessionId: q.sessionId,
      userId: q.oderId,
      userName: q.isAnonymous ? "Anonymous" : (q.userName ?? "Unknown"),
      userImage: q.isAnonymous ? null : q.userImage,
      content: q.content,
      isAnonymous: q.isAnonymous,
      isApproved: q.isApproved,
      isAnswered: q.isAnswered,
      likeCount: q.likeCount,
      hasLiked: likedQuestionIds.has(q.id),
      createdAt: q.createdAt,
      answers: answersByQuestion.get(q.id) ?? [],
    }));

    return {
      questions,
      qaEnabled: session.qaEnabled,
      qaModerated: session.qaModerated,
      isSessionManager,
    };
  });
