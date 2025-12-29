import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { eventIterator, ORPCError } from "@orpc/server";
import { subscribeToPresence } from "@/server/realtime/presence";
import { db } from "@/server/db";
import { conversations } from "@/server/db/schema";
import { or, eq } from "drizzle-orm";

const inputSubscribePresenceSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
});

const presenceEventSchema = z.object({
  userId: z.string(),
  status: z.enum(["online", "offline"]),
  lastSeenAt: z.date().optional(),
});

export const subscribePresenceRouter = protectedProcedure
  .route({ method: "GET", path: "/presence/subscribe" })
  .input(inputSubscribePresenceSchema)
  .output(eventIterator(presenceEventSchema))
  .handler(async function* ({ context, input, signal }) {
    const { session } = context;
    const currentUserId = session.user.id;
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
          eq(conversations.userId1, currentUserId),
          eq(conversations.userId2, currentUserId),
        ),
      );

    // Extract the set of user IDs the current user has conversations with
    const authorizedUserIds = new Set<string>();
    for (const conv of userConversations) {
      if (conv.userId1 !== currentUserId) {
        authorizedUserIds.add(conv.userId1);
      }
      if (conv.userId2 !== currentUserId) {
        authorizedUserIds.add(conv.userId2);
      }
    }

    // Filter requested userIds to only include authorized ones
    const filteredUserIds = userIds.filter((id) => authorizedUserIds.has(id));

    if (filteredUserIds.length === 0) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "You can only track presence of users you have conversations with",
      });
    }

    for await (const event of subscribeToPresence(filteredUserIds, signal)) {
      yield event;
    }
  });
