import { z } from "zod";
import { rateLimitedPollCreationProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import {
  sessionPoll,
  sessionPollOption,
  programSession,
  user,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { publishSessionPollEvent } from "@/server/realtime/session-polls";
import { getSessionManagerInfo } from "./utils";

const inputSchema = z.object({
  sessionId: z.string().min(1),
  question: z.string().min(1).max(500),
  pollType: z.enum(["single", "multiple"]).default("single"),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
});

const outputSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  question: z.string(),
  pollType: z.enum(["single", "multiple"]),
  isActive: z.boolean(),
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.date(),
  options: z.array(
    z.object({
      id: z.number(),
      text: z.string(),
      displayOrder: z.number(),
    })
  ),
});

export const createPollRouter = rateLimitedPollCreationProcedure
  .route({ method: "POST", path: "/polls" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session: authSession } = context;
    const userId = authSession.user.id;
    const { sessionId, question, pollType, options } = input;

    // Verify session exists
    const sessionData = await db
      .select({ id: programSession.id })
      .from(programSession)
      .where(eq(programSession.id, sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    }

    // Verify user is a session manager
    const managerInfo = await getSessionManagerInfo(sessionId, userId);
    if (!managerInfo?.isSessionManager) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "Only session managers (organizer, chair, committee, speaker) can create polls",
      });
    }

    // Get user info
    const userData = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const pollId = uuidv4();
    const now = new Date();

    // Insert poll
    await db.insert(sessionPoll).values({
      id: pollId,
      sessionId,
      question,
      pollType,
      isActive: true,
      createdBy: userId,
      createdAt: now,
    });

    // Insert options
    const insertedOptions: Array<{
      id: number;
      text: string;
      displayOrder: number;
    }> = [];

    for (let i = 0; i < options.length; i++) {
      const result = await db
        .insert(sessionPollOption)
        .values({
          pollId,
          text: options[i]!,
          displayOrder: i,
        })
        .returning({ id: sessionPollOption.id });

      insertedOptions.push({
        id: result[0]!.id,
        text: options[i]!,
        displayOrder: i,
      });
    }

    const poll = {
      id: pollId,
      sessionId,
      question,
      pollType: pollType as "single" | "multiple",
      isActive: true,
      createdBy: userId,
      createdByName: userData[0]?.name ?? "Unknown",
      createdAt: now,
      options: insertedOptions,
    };

    // Publish event
    await publishSessionPollEvent(sessionId, {
      type: "poll_created",
      poll,
    });

    return poll;
  });
