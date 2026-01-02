import { z } from "zod";
import { rateLimitedPollVoteProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  sessionPoll,
  sessionPollOption,
  sessionPollVote,
  programSession,
  eventRegistration,
  event,
} from "@/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { publishSessionPollEvent } from "@/server/realtime/session-polls";
import { calculatePollResults, getSessionManagerInfo } from "./utils";

const inputSchema = z.object({
  pollId: z.string().min(1),
  optionIds: z.array(z.number()).min(1),
});

const outputSchema = z.object({
  pollId: z.string(),
  votedOptionIds: z.array(z.number()),
  isVoteChange: z.boolean(),
});

export const voteRouter = rateLimitedPollVoteProcedure
  .route({ method: "POST", path: "/polls/vote" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { pollId, optionIds } = input;

    // Get poll info
    const pollData = await db
      .select({
        id: sessionPoll.id,
        sessionId: sessionPoll.sessionId,
        pollType: sessionPoll.pollType,
        isActive: sessionPoll.isActive,
        closedAt: sessionPoll.closedAt,
      })
      .from(sessionPoll)
      .where(eq(sessionPoll.id, pollId))
      .limit(1);

    if (pollData.length === 0 || !pollData[0]) {
      throw new ORPCError("NOT_FOUND", { message: "Poll not found" });
    }

    const poll = pollData[0];

    // Check if poll is open
    if (!poll.isActive || poll.closedAt !== null) {
      throw new ORPCError("BAD_REQUEST", { message: "Poll is closed" });
    }

    // Validate single vs multiple choice
    if (poll.pollType === "single" && optionIds.length > 1) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Single choice polls allow only one selection",
      });
    }

    // Verify options exist and belong to this poll
    const validOptions = await db
      .select({ id: sessionPollOption.id })
      .from(sessionPollOption)
      .where(
        and(
          eq(sessionPollOption.pollId, pollId),
          inArray(sessionPollOption.id, optionIds),
        ),
      );

    if (validOptions.length !== optionIds.length) {
      throw new ORPCError("BAD_REQUEST", { message: "Invalid option(s)" });
    }

    // Verify user can vote (registered for event OR session manager)
    const sessionData = await db
      .select({ eventId: programSession.eventId })
      .from(programSession)
      .where(eq(programSession.id, poll.sessionId))
      .limit(1);

    const eventId = sessionData[0]?.eventId;
    if (!eventId) {
      throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    }

    const managerInfo = await getSessionManagerInfo(poll.sessionId, userId);
    const isSessionManager = managerInfo?.isSessionManager ?? false;

    if (!isSessionManager) {
      // Check registration
      const registration = await db
        .select({ id: eventRegistration.id })
        .from(eventRegistration)
        .where(
          and(
            eq(eventRegistration.eventId, eventId),
            eq(eventRegistration.userId, userId),
          ),
        )
        .limit(1);

      // Also check if organizer
      const eventData = await db
        .select({ organizerId: event.organizerId })
        .from(event)
        .where(eq(event.id, eventId))
        .limit(1);

      const isOrganizer = eventData[0]?.organizerId === userId;

      if (registration.length === 0 && !isOrganizer) {
        throw new ORPCError("FORBIDDEN", {
          message: "You must be registered for this event to vote",
        });
      }
    }

    // Check for existing votes
    const existingVotes = await db
      .select({ id: sessionPollVote.id, optionId: sessionPollVote.optionId })
      .from(sessionPollVote)
      .where(
        and(
          eq(sessionPollVote.pollId, pollId),
          eq(sessionPollVote.userId, userId),
        ),
      );

    const isVoteChange = existingVotes.length > 0;

    // Delete existing votes if changing vote
    if (isVoteChange) {
      await db
        .delete(sessionPollVote)
        .where(
          and(
            eq(sessionPollVote.pollId, pollId),
            eq(sessionPollVote.userId, userId),
          ),
        );
    }

    // Insert new votes
    const now = new Date();
    for (const optionId of optionIds) {
      await db.insert(sessionPollVote).values({
        pollId,
        optionId,
        userId,
        votedAt: now,
      });
    }

    // Calculate and publish results
    const results = await calculatePollResults(pollId);

    await publishSessionPollEvent(poll.sessionId, {
      type: isVoteChange ? "vote_changed" : "vote_cast",
      pollId,
      results,
    });

    return {
      pollId,
      votedOptionIds: optionIds,
      isVoteChange,
    };
  });
