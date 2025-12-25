import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { ORPCError } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { db } from "@/server/db";
import { conversations } from "@/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import {
  setTyping,
  clearTyping,
  subscribeToTyping,
  type TypingEvent,
} from "@/server/realtime/typing";

// Input schemas
const conversationIdSchema = z.object({
  conversationId: z.string().min(1),
});

// Output schemas
const typingEventSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
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

// Set typing status (called when user types)
export const setTypingRouter = protectedProcedure
  .route({ method: "POST", path: "/messages/typing" })
  .input(conversationIdSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Set typing status in Redis
    await setTyping(conversationId, userId);

    return { success: true };
  });

// Clear typing status (called when user sends message or clears input)
export const clearTypingRouter = protectedProcedure
  .route({ method: "POST", path: "/messages/typing/clear" })
  .input(conversationIdSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Clear typing status in Redis
    await clearTyping(conversationId, userId);

    return { success: true };
  });

// Subscribe to typing events for a conversation
export const subscribeTypingRouter = protectedProcedure
  .route({ method: "GET", path: "/messages/typing/subscribe" })
  .input(conversationIdSchema)
  .output(eventIterator(typingEventSchema))
  .handler(async function* ({ context, input, signal }) {
    const { session } = context;
    const userId = session.user.id;
    const { conversationId } = input;

    // Verify user is part of the conversation
    await verifyConversationAccess(conversationId, userId);

    // Subscribe to typing events
    for await (const event of subscribeToTyping(conversationId, signal)) {
      // Don't send typing events for the current user
      if (event.userId !== userId) {
        yield event;
      }
    }
  });
