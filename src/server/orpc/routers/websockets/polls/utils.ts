import { db } from "@/server/db";
import {
  sessionPoll,
  sessionPollOption,
  sessionPollVote,
} from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import type { PollResults, PollOptionResult } from "@/server/realtime/session-polls";

// Re-export getSessionManagerInfo from question-answer utils
export { getSessionManagerInfo } from "../question-answer/utils";

/**
 * Calculate poll results with vote counts and percentages
 */
export async function calculatePollResults(pollId: string): Promise<PollResults> {
  // Get all options for the poll
  const options = await db
    .select({
      id: sessionPollOption.id,
      text: sessionPollOption.text,
      displayOrder: sessionPollOption.displayOrder,
    })
    .from(sessionPollOption)
    .where(eq(sessionPollOption.pollId, pollId))
    .orderBy(sessionPollOption.displayOrder);

  // Get vote counts per option
  const voteCounts = await db
    .select({
      optionId: sessionPollVote.optionId,
      count: sql<number>`count(*)::int`,
    })
    .from(sessionPollVote)
    .where(eq(sessionPollVote.pollId, pollId))
    .groupBy(sessionPollVote.optionId);

  const voteCountMap = new Map(voteCounts.map((v) => [v.optionId, v.count]));

  // Count unique voters (for multiple choice, a user can vote for multiple options)
  const uniqueVoters = await db
    .select({
      count: sql<number>`count(distinct ${sessionPollVote.userId})::int`,
    })
    .from(sessionPollVote)
    .where(eq(sessionPollVote.pollId, pollId));

  const totalVotes = uniqueVoters[0]?.count ?? 0;

  // Calculate total individual votes (for percentage calculation)
  const totalIndividualVotes = voteCounts.reduce((sum, v) => sum + v.count, 0);

  const optionResults: PollOptionResult[] = options.map((opt) => {
    const voteCount = voteCountMap.get(opt.id) ?? 0;
    return {
      optionId: opt.id,
      text: opt.text,
      voteCount,
      percentage:
        totalIndividualVotes > 0
          ? Math.round((voteCount / totalIndividualVotes) * 100)
          : 0,
    };
  });

  return {
    pollId,
    totalVotes,
    options: optionResults,
  };
}

/**
 * Check if a poll is still open for voting
 */
export async function isPollOpen(pollId: string): Promise<boolean> {
  const poll = await db
    .select({
      isActive: sessionPoll.isActive,
      closedAt: sessionPoll.closedAt,
    })
    .from(sessionPoll)
    .where(eq(sessionPoll.id, pollId))
    .limit(1);

  if (poll.length === 0 || !poll[0]) return false;
  return poll[0].isActive && poll[0].closedAt === null;
}

/**
 * Get poll with its options
 */
export async function getPollWithOptions(pollId: string) {
  const pollData = await db
    .select({
      id: sessionPoll.id,
      sessionId: sessionPoll.sessionId,
      question: sessionPoll.question,
      pollType: sessionPoll.pollType,
      isActive: sessionPoll.isActive,
      createdBy: sessionPoll.createdBy,
      createdAt: sessionPoll.createdAt,
      closedAt: sessionPoll.closedAt,
    })
    .from(sessionPoll)
    .where(eq(sessionPoll.id, pollId))
    .limit(1);

  if (pollData.length === 0 || !pollData[0]) {
    return null;
  }

  const poll = pollData[0];

  const options = await db
    .select({
      id: sessionPollOption.id,
      text: sessionPollOption.text,
      displayOrder: sessionPollOption.displayOrder,
    })
    .from(sessionPollOption)
    .where(eq(sessionPollOption.pollId, pollId))
    .orderBy(sessionPollOption.displayOrder);

  return {
    ...poll,
    options,
  };
}
