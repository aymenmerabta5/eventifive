import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { sessionPoll, sessionPollVote } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { calculatePollResults } from "./utils";

const inputSchema = z.object({
  pollId: z.string().min(1),
});

const outputSchema = z.object({
  pollId: z.string(),
  question: z.string(),
  pollType: z.enum(["single", "multiple"]),
  isActive: z.boolean(),
  closedAt: z.date().nullable(),
  totalVotes: z.number(),
  userVotedOptionIds: z.array(z.number()),
  options: z.array(
    z.object({
      optionId: z.number(),
      text: z.string(),
      voteCount: z.number(),
      percentage: z.number(),
    }),
  ),
});

export const getResultsRouter = protectedProcedure
  .route({ method: "GET", path: "/polls/results" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { pollId } = input;

    // Get poll
    const pollData = await db
      .select({
        id: sessionPoll.id,
        question: sessionPoll.question,
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
    const results = await calculatePollResults(pollId);

    // Get user's votes
    const userVotes = await db
      .select({ optionId: sessionPollVote.optionId })
      .from(sessionPollVote)
      .where(
        and(
          eq(sessionPollVote.pollId, pollId),
          eq(sessionPollVote.userId, userId),
        ),
      );

    return {
      pollId,
      question: poll.question,
      pollType: poll.pollType as "single" | "multiple",
      isActive: poll.isActive,
      closedAt: poll.closedAt,
      totalVotes: results.totalVotes,
      userVotedOptionIds: userVotes.map((v) => v.optionId),
      options: results.options,
    };
  });
