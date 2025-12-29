import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError, eventIterator } from "@orpc/server";
import { db } from "@/server/db";
import { programSession, eventRegistration, event } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { subscribeToSessionPolls } from "@/server/realtime/session-polls";
import { getSessionManagerInfo } from "./utils";

const inputSchema = z.object({
  sessionId: z.string().min(1),
});

// Event schemas
const pollOptionSchema = z.object({
  id: z.number(),
  text: z.string(),
  displayOrder: z.number(),
});

const pollResultOptionSchema = z.object({
  optionId: z.number(),
  text: z.string(),
  voteCount: z.number(),
  percentage: z.number(),
});

const pollResultsSchema = z.object({
  pollId: z.string(),
  totalVotes: z.number(),
  options: z.array(pollResultOptionSchema),
});

const pollCreatedEventSchema = z.object({
  type: z.literal("poll_created"),
  poll: z.object({
    id: z.string(),
    sessionId: z.string(),
    question: z.string(),
    pollType: z.enum(["single", "multiple"]),
    isActive: z.boolean(),
    createdBy: z.string(),
    createdByName: z.string(),
    createdAt: z.date(),
    options: z.array(pollOptionSchema),
  }),
});

const pollUpdatedEventSchema = z.object({
  type: z.literal("poll_updated"),
  poll: z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(pollOptionSchema),
  }),
});

const pollClosedEventSchema = z.object({
  type: z.literal("poll_closed"),
  pollId: z.string(),
  closedAt: z.date(),
  results: pollResultsSchema,
});

const voteCastEventSchema = z.object({
  type: z.literal("vote_cast"),
  pollId: z.string(),
  results: pollResultsSchema,
});

const voteChangedEventSchema = z.object({
  type: z.literal("vote_changed"),
  pollId: z.string(),
  results: pollResultsSchema,
});

const sessionPollEventSchema = z.union([
  pollCreatedEventSchema,
  pollUpdatedEventSchema,
  pollClosedEventSchema,
  voteCastEventSchema,
  voteChangedEventSchema,
]);

export const subscribePollsRouter = protectedProcedure
  .route({ method: "GET", path: "/polls/subscribe" })
  .input(inputSchema)
  .output(eventIterator(sessionPollEventSchema))
  .handler(async function* ({ context, input, signal }) {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId } = input;

    // Verify session exists
    const sessionData = await db
      .select({ id: programSession.id, eventId: programSession.eventId })
      .from(programSession)
      .where(eq(programSession.id, sessionId))
      .limit(1);

    if (sessionData.length === 0 || !sessionData[0]) {
      throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    }

    const session = sessionData[0];

    // Check authorization (session manager or registered)
    const managerInfo = await getSessionManagerInfo(sessionId, userId);
    const isSessionManager = managerInfo?.isSessionManager ?? false;

    if (!isSessionManager) {
      // Check registration
      const registration = await db
        .select({ id: eventRegistration.id })
        .from(eventRegistration)
        .where(
          and(
            eq(eventRegistration.eventId, session.eventId),
            eq(eventRegistration.userId, userId)
          )
        )
        .limit(1);

      // Check if organizer
      const eventData = await db
        .select({ organizerId: event.organizerId })
        .from(event)
        .where(eq(event.id, session.eventId))
        .limit(1);

      const isOrganizer = eventData[0]?.organizerId === userId;

      if (registration.length === 0 && !isOrganizer) {
        throw new ORPCError("FORBIDDEN", {
          message: "You must be registered for this event to subscribe to polls",
        });
      }
    }

    // Subscribe to poll events
    for await (const pollEvent of subscribeToSessionPolls(sessionId, signal)) {
      yield pollEvent;
    }
  });
