import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  sessionQuestions,
  programSession,
  event,
  eventRegistration,
  user,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { publishSessionQAEvent } from "@/server/realtime/session-qa";
import { getSessionManagerInfo } from "./utils";

const inputAskQuestionSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().min(1).max(1000),
  isAnonymous: z.boolean().default(false),
});

const outputAskQuestionSchema = z.object({
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
});

export const askQuestionRouter = protectedProcedure
  .route({ method: "POST", path: "/qa/questions" })
  .input(inputAskQuestionSchema)
  .output(outputAskQuestionSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId, content, isAnonymous } = input;

    // Get the session and verify it exists and Q&A is enabled
    const programSessionResult = await db
      .select({
        id: programSession.id,
        eventId: programSession.eventId,
        qaEnabled: programSession.qaEnabled,
        qaModerated: programSession.qaModerated,
      })
      .from(programSession)
      .where(eq(programSession.id, sessionId))
      .limit(1);

    if (programSessionResult.length === 0 || !programSessionResult[0]) {
      throw new ORPCError("NOT_FOUND", {
        message: "Session not found",
      });
    }

    const sessionData = programSessionResult[0];

    if (!sessionData.qaEnabled) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Q&A is not enabled for this session",
      });
    }

    // Check if user is a session manager (organizer, chair, committee, speaker)
    // Session managers can only answer questions, not ask them
    const managerInfo = await getSessionManagerInfo(sessionId, userId);
    if (managerInfo?.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "Session hosts cannot ask questions. You can answer and moderate questions from participants.",
      });
    }

    // Verify user is registered for the event
    const registration = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, sessionData.eventId),
          eq(eventRegistration.userId, userId),
        ),
      )
      .limit(1);

    // Also check if user is the organizer
    const eventData = await db
      .select({ organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, sessionData.eventId))
      .limit(1);

    const isOrganizer = eventData[0]?.organizerId === userId;

    if (registration.length === 0 && !isOrganizer) {
      throw new ORPCError("FORBIDDEN", {
        message: "You must be registered for this event to ask questions",
      });
    }

    // Get user info
    const userData = await db
      .select({ name: user.name, image: user.image })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const questionId = uuidv4();
    const now = new Date();

    // If moderated, questions need approval
    const isApproved = !sessionData.qaModerated;

    // Insert the question
    await db.insert(sessionQuestions).values({
      id: questionId,
      sessionId,
      userId,
      content,
      isAnonymous,
      isApproved,
      isAnswered: false,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const question = {
      id: questionId,
      sessionId,
      userId,
      userName: userData[0]?.name ?? "Unknown",
      userImage: userData[0]?.image ?? null,
      content,
      isAnonymous,
      isApproved,
      isAnswered: false,
      likeCount: 0,
      createdAt: now,
    };

    // Only publish if approved (or publish with pending status for moderators)
    if (isApproved) {
      await publishSessionQAEvent(sessionId, {
        type: "question_created",
        question,
      });
    }

    return question;
  });
