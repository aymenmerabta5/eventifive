import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { messages, conversations, user } from "@/server/db/schema";
import { eq, or, and, lt, desc } from "drizzle-orm";

const inputGetMessagesSchema = z.object({
  conversationId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderImage: z.string().nullable(),
  content: z.string(),
  createdAt: z.date(),
});

const outputGetMessagesSchema = z.object({
  messages: z.array(messageSchema),
  nextCursor: z.string().nullable(),
});

export const getMessagesRouter = protectedProcedure
  .route({ method: "GET", path: "/messages/list" })
  .input(inputGetMessagesSchema)
  .output(outputGetMessagesSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId, cursor, limit } = input;

    // Verify user is part of the conversation
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

    // Query messages with sender info
    const query = db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        senderName: user.name,
        senderImage: user.image,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(user, eq(messages.senderId, user.id))
      .where(
        cursor
          ? and(
              eq(messages.conversationId, conversationId),
              lt(messages.createdAt, new Date(cursor)),
            )
          : eq(messages.conversationId, conversationId),
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);

    const results = await query;

    const hasMore = results.length > limit;
    const messageResults = results.slice(0, limit).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.senderName!,
      senderImage: msg.senderImage,
      content: msg.content,
      createdAt: msg.createdAt,
    }));

    return {
      messages: messageResults,
      nextCursor: hasMore
        ? messageResults[messageResults.length - 1]?.createdAt.toISOString() ||
          null
        : null,
    };
  });
