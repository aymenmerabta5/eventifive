import { z } from "zod";
import { rateLimitedPollCreationProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { sessionPoll } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { publishSessionPollEvent } from "@/server/realtime/session-polls";
import { calculatePollResults, getSessionManagerInfo } from "./utils";

const inputSchema = z.object({
  pollId: z.string().min(1),
});

const pollResultsSchema = z.object({
  pollId: z.string(),
  totalVotes: z.number(),
  options: z.array(
    z.object({
      optionId: z.number(),
      text: z.string(),
      voteCount: z.number(),
      percentage: z.number(),
    }),
  ),
});

const outputSchema = z.object({
  pollId: z.string(),
  closedAt: z.date(),
  results: pollResultsSchema,
});

export const closePollRouter = rateLimitedPollCreationProcedure
  .route({ method: "POST", path: "/polls/close" })
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
        sessionId: sessionPoll.sessionId,
        isActive: sessionPoll.isActive,
        closedAt: sessionPoll.closedAt,
        createdBy: sessionPoll.createdBy,
      })
      .from(sessionPoll)
      .where(eq(sessionPoll.id, pollId))
      .limit(1);

    if (pollData.length === 0 || !pollData[0]) {
      throw new ORPCError("NOT_FOUND", { message: "Poll not found" });
    }

    const poll = pollData[0];

    if (poll.closedAt !== null) {
      throw new ORPCError("BAD_REQUEST", { message: "Poll is already closed" });
    }

    // Verify user is session manager
    const managerInfo = await getSessionManagerInfo(poll.sessionId, userId);
    if (!managerInfo?.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only session managers can close polls",
      });
    }

    const closedAt = new Date();

    // Update poll
    await db
      .update(sessionPoll)
      .set({ isActive: false, closedAt })
      .where(eq(sessionPoll.id, pollId));

    // Get final results
    const results = await calculatePollResults(pollId);

    // Publish event
    await publishSessionPollEvent(poll.sessionId, {
      type: "poll_closed",
      pollId,
      closedAt,
      results,
    });

    return { pollId, closedAt, results };
  });
