import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { getPresenceState } from "@/server/realtime/presence";
import { db } from "@/server/db";
import { conversations } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";

const inputGetPresenceSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
});

const presenceStateSchema = z.record(
  z.string(),
  z.object({
    isOnline: z.boolean(),
    lastSeenAt: z.date().nullable(),
  }),
);

export const getPresenceRouter = protectedProcedure
  .route({ method: "GET", path: "/presence" })
  .input(inputGetPresenceSchema)
  .output(presenceStateSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const { userIds } = input;

    // Get all conversations where the current user is a participant
    const userConversations = await db
      .select({
        userId1: conversations.userId1,
        userId2: conversations.userId2,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.userId1, userId),
          eq(conversations.userId2, userId),
        ),
      );

    // Extract the IDs of users the current user has conversations with
    const authorizedUserIds = new Set<string>();
    for (const conv of userConversations) {
      if (conv.userId1 !== userId) authorizedUserIds.add(conv.userId1);
      if (conv.userId2 !== userId) authorizedUserIds.add(conv.userId2);
    }

    // Filter requested userIds to only include authorized ones
    const filteredUserIds = userIds.filter((id) => authorizedUserIds.has(id));

    // Return empty result if no authorized users
    if (filteredUserIds.length === 0) {
      return {};
    }

    const presenceState = await getPresenceState(filteredUserIds);

    // Convert Map to object for serialization
    const result: Record<
      string,
      { isOnline: boolean; lastSeenAt: Date | null }
    > = {};
    for (const [id, state] of presenceState) {
      result[id] = state;
    }

    return result;
  });
