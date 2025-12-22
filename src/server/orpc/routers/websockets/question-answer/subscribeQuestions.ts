import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { db } from "@/server/db";
import { programSession } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { subscribeToSessionQA } from "@/server/realtime/session-qa";

const inputSubscribeQuestionsSchema = z.object({
  sessionId: z.string().min(1),
});

const questionEventSchema = z.object({
  type: z.enum(["question_created", "question_updated", "question_deleted"]),
  question: z.object({
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
    createdAt: z.date(),
  }),
});

const likeEventSchema = z.object({
  type: z.enum(["question_liked", "question_unliked"]),
  questionId: z.string(),
  likeCount: z.number(),
  userId: z.string(),
});

const answerEventSchema = z.object({
  type: z.enum(["answer_created", "answer_updated", "answer_deleted"]),
  answer: z.object({
    id: z.string(),
    questionId: z.string(),
    userId: z.string(),
    userName: z.string(),
    userImage: z.string().nullable(),
    content: z.string(),
    createdAt: z.date(),
  }),
});

const sessionQAEventSchema = z.union([
  questionEventSchema,
  likeEventSchema,
  answerEventSchema,
]);

export const subscribeQuestionsRouter = protectedProcedure
  .route({ method: "GET", path: "/qa/subscribe" })
  .input(inputSubscribeQuestionsSchema)
  .output(eventIterator(sessionQAEventSchema))
  .handler(async function* ({ input, signal }) {
    const { sessionId } = input;

    // Verify session exists
    const sessionData = await db
      .select({ id: programSession.id, qaEnabled: programSession.qaEnabled })
      .from(programSession)
      .where(eq(programSession.id, sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: "Session not found",
      });
    }

    // Subscribe to Q&A events for this session
    for await (const event of subscribeToSessionQA(sessionId, signal)) {
      yield event;
    }
  });
