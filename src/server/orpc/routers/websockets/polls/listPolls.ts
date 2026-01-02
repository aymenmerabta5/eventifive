import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { db } from "@/server/db";
import {
  sessionPoll,
  sessionPollOption,
  sessionPollVote,
  user,
} from "@/server/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { calculatePollResults, getSessionManagerInfo } from "./utils";

const inputSchema = z.object({
  sessionId: z.string().min(1),
  includeResults: z.boolean().default(true),
});

const pollOptionSchema = z.object({
  id: z.number(),
  text: z.string(),
  displayOrder: z.number(),
  voteCount: z.number().optional(),
  percentage: z.number().optional(),
});

const pollSchema = z.object({
  id: z.string(),
  question: z.string(),
  pollType: z.enum(["single", "multiple"]),
  isActive: z.boolean(),
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.date(),
  closedAt: z.date().nullable(),
  options: z.array(pollOptionSchema),
  totalVotes: z.number().optional(),
  userVotedOptionIds: z.array(z.number()),
});

const outputSchema = z.object({
  polls: z.array(pollSchema),
  isSessionManager: z.boolean(),
});

export const listPollsRouter = protectedProcedure
  .route({ method: "GET", path: "/polls/list" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId, includeResults } = input;

    // Check if user is session manager
    const sessionManagerInfo = await getSessionManagerInfo(sessionId, userId);
    const isSessionManager = sessionManagerInfo?.isSessionManager ?? false;

    // Get all polls for session
    const polls = await db
      .select({
        id: sessionPoll.id,
        question: sessionPoll.question,
        pollType: sessionPoll.pollType,
        isActive: sessionPoll.isActive,
        createdBy: sessionPoll.createdBy,
        createdAt: sessionPoll.createdAt,
        closedAt: sessionPoll.closedAt,
        createdByName: user.name,
      })
      .from(sessionPoll)
      .leftJoin(user, eq(sessionPoll.createdBy, user.id))
      .where(eq(sessionPoll.sessionId, sessionId))
      .orderBy(desc(sessionPoll.createdAt));

    if (polls.length === 0) {
      return { polls: [], isSessionManager };
    }

    const pollIds = polls.map((p) => p.id);

    // Get all options
    const allOptions = await db
      .select()
      .from(sessionPollOption)
      .where(inArray(sessionPollOption.pollId, pollIds))
      .orderBy(sessionPollOption.displayOrder);

    // Get user's votes for all polls
    const userVotes = await db
      .select({
        pollId: sessionPollVote.pollId,
        optionId: sessionPollVote.optionId,
      })
      .from(sessionPollVote)
      .where(
        and(
          inArray(sessionPollVote.pollId, pollIds),
          eq(sessionPollVote.userId, userId),
        ),
      );

    // Group options and votes by poll
    const optionsByPoll = new Map<string, typeof allOptions>();
    for (const opt of allOptions) {
      const existing = optionsByPoll.get(opt.pollId) ?? [];
      existing.push(opt);
      optionsByPoll.set(opt.pollId, existing);
    }

    const userVotesByPoll = new Map<string, number[]>();
    for (const vote of userVotes) {
      const existing = userVotesByPoll.get(vote.pollId) ?? [];
      existing.push(vote.optionId);
      userVotesByPoll.set(vote.pollId, existing);
    }

    // Build response with optional results
    const pollsWithDetails = await Promise.all(
      polls.map(async (poll) => {
        const options = optionsByPoll.get(poll.id) ?? [];
        const results = includeResults
          ? await calculatePollResults(poll.id)
          : null;

        return {
          id: poll.id,
          question: poll.question,
          pollType: poll.pollType as "single" | "multiple",
          isActive: poll.isActive,
          createdBy: poll.createdBy,
          createdByName: poll.createdByName ?? "Unknown",
          createdAt: poll.createdAt,
          closedAt: poll.closedAt,
          options: options.map((opt) => {
            const resultOpt = results?.options.find(
              (r) => r.optionId === opt.id,
            );
            return {
              id: opt.id,
              text: opt.text,
              displayOrder: opt.displayOrder,
              ...(includeResults && resultOpt
                ? {
                    voteCount: resultOpt.voteCount,
                    percentage: resultOpt.percentage,
                  }
                : {}),
            };
          }),
          ...(includeResults && results
            ? { totalVotes: results.totalVotes }
            : {}),
          userVotedOptionIds: userVotesByPoll.get(poll.id) ?? [],
        };
      }),
    );

    return { polls: pollsWithDetails, isSessionManager };
  });
