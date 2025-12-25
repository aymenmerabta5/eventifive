import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { conversations, messages, readReceipts } from "@/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import {
  publishReadReceipt,
  subscribeToReadReceipts,
  type ReadReceiptEvent,
} from "@/server/realtime/read-receipts";

// Input schemas
const markAsReadSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
});

const getReadReceiptsSchema = z.object({
  conversationId: z.string().min(1),
});

// Output schemas
const readReceiptSchema = z.object({
  userId: z.string(),
  lastReadMessageId: z.string().nullable(),
  readAt: z.date(),
});

const readReceiptEventSchema = z.object({
  type: z.literal("read"),
  conversationId: z.string(),
  userId: z.string(),
  lastReadMessageId: z.string(),
  readAt: z.date(),
});

// Helper to verify user is participant in conversation
async function verifyConversationAccess(
  conversationId: string,
  userId: string,
) {
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

  if (conversation.length === 0 || !conversation[0]) {
    throw new ORPCError("NOT_FOUND", {
      message: "Conversation not found or you are not a participant",
    });
  }

  return conversation[0];
}

// Mark messages as read up to a specific message
export const markAsReadRouter = protectedProcedure
  .route({ method: "POST", path: "/messages/read" })
  .input(markAsReadSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId, messageId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Verify the message exists and belongs to this conversation
    const message = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.conversationId, conversationId),
        ),
      )
      .limit(1);

    if (message.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: "Message not found",
      });
    }

    const now = new Date();

    // Upsert read receipt
    await db
      .insert(readReceipts)
      .values({
        id: uuidv4(),
        conversationId,
        userId,
        lastReadMessageId: messageId,
        readAt: now,
      })
      .onConflictDoUpdate({
        target: [readReceipts.conversationId, readReceipts.userId],
        set: {
          lastReadMessageId: messageId,
          readAt: now,
        },
      });

    // Publish read receipt event via Redis for real-time update
    await publishReadReceipt(conversationId, userId, messageId, now);

    return { success: true };
  });

// Get read receipts for a conversation
export const getReadReceiptsRouter = protectedProcedure
  .route({ method: "GET", path: "/messages/read-receipts" })
  .input(getReadReceiptsSchema)
  .output(z.array(readReceiptSchema))
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Get all read receipts for this conversation
    const receipts = await db
      .select({
        userId: readReceipts.userId,
        lastReadMessageId: readReceipts.lastReadMessageId,
        readAt: readReceipts.readAt,
      })
      .from(readReceipts)
      .where(eq(readReceipts.conversationId, conversationId));

    return receipts;
  });

// Subscribe to read receipt events for a conversation
export const subscribeReadReceiptsRouter = protectedProcedure
  .route({ method: "GET", path: "/messages/read-receipts/subscribe" })
  .input(getReadReceiptsSchema)
  .output(eventIterator(readReceiptEventSchema))
  .handler(async function* ({ context, input, signal }) {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Subscribe to read receipt events (same pattern as typing)
    for await (const event of subscribeToReadReceipts(conversationId, signal)) {
      // Don't send read receipt events for the current user's own reads
      if (event.userId !== userId) {
        yield event;
      }
    }
  });
