import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { db } from "@/server/db";
import { programSession, eventRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { subscribeToSessionQA } from "@/server/realtime/session-qa";
import { getSessionManagerInfo } from "./utils";

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
    role: z.enum(["organizer", "chair", "committee", "speaker"]),
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
  .handler(async function* ({ context, input, signal }) {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId } = input;

    // Verify session exists and get eventId
    const sessionData = await db
      .select({
        id: programSession.id,
        eventId: programSession.eventId,
        qaEnabled: programSession.qaEnabled,
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

    // Check if user is a session manager (organizer, chair, committee, speaker)
    const managerInfo = await getSessionManagerInfo(sessionId, userId);
    const isSessionManager = managerInfo?.isSessionManager ?? false;

    // Check if user is registered for the event
    let isRegistered = false;
    if (!isSessionManager) {
      const registration = await db
        .select({ id: eventRegistration.id })
        .from(eventRegistration)
        .where(
          and(
            eq(eventRegistration.eventId, session.eventId),
            eq(eventRegistration.userId, userId),
          ),
        )
        .limit(1);

      isRegistered = registration.length > 0;
    }

    // User must be either a session manager or registered for the event
    if (!isSessionManager && !isRegistered) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "You must be registered for this event or be a session manager to subscribe to Q&A",
      });
    }

    // Subscribe to Q&A events for this session
    for await (const event of subscribeToSessionQA(sessionId, signal)) {
      yield event;
    }
  });
