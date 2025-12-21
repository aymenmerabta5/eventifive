import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { db } from "@/server/db";
import { conversations } from "@/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import {
  subscribeToConversation,
  subscribeToUserMessages,
} from "@/server/realtime/pubsub";

const inputSubscribeMessagesSchema = z.object({
  conversationId: z.string().optional(),
});

const messageEventSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.date(),
});

export const subscribeMessagesRouter = protectedProcedure
  .route({ method: "GET", path: "/messages/subscribe" })
  .input(inputSubscribeMessagesSchema)
  .output(eventIterator(messageEventSchema))
  .handler(async function* ({ context, input, signal }) {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // If subscribing to a specific conversation, verify access
    if (conversationId) {
      const conversation = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, conversationId),
            or(
              eq(conversations.userId1, userId),
              eq(conversations.userId2, userId),
            ),
          ),
        )
        .limit(1);

      if (conversation.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Conversation not found or you are not a participant",
        });
      }

      // Subscribe to specific conversation
      for await (const message of subscribeToConversation(
        conversationId,
        signal,
      )) {
        yield message;
      }
    } else {
      // Subscribe to all messages for this user
      for await (const message of subscribeToUserMessages(userId, signal)) {
        yield message;
      }
    }
  });
