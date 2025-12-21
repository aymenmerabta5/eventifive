import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { conversations, user } from "@/server/db/schema";
import { eq, or, and } from "drizzle-orm";

const inputCreateConversationSchema = z.object({
  userId: z.string().min(1),
});

const outputCreateConversationSchema = z.object({
  id: z.string(),
  otherUser: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  isNew: z.boolean(),
});

export const createConversationRouter = protectedProcedure
  .route({ method: "POST", path: "/messages/conversation/create" })
  .input(inputCreateConversationSchema)
  .output(outputCreateConversationSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const currentUserId = session.user.id;
    const { userId: otherUserId } = input;

    // Cannot create conversation with yourself
    if (currentUserId === otherUserId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Cannot create a conversation with yourself",
      });
    }

    // Verify the other user exists
    const otherUser = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, otherUserId))
      .limit(1);

    if (otherUser.length === 0 || !otherUser[0]) {
      throw new ORPCError("NOT_FOUND", {
        message: "User not found",
      });
    }

    const otherUserData = otherUser[0];

    // Check if conversation already exists
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.userId1, currentUserId),
            eq(conversations.userId2, otherUserId),
          ),
          and(
            eq(conversations.userId1, otherUserId),
            eq(conversations.userId2, currentUserId),
          ),
        ),
      )
      .limit(1);

    if (existingConversation.length > 0 && existingConversation[0]) {
      return {
        id: existingConversation[0].id,
        otherUser: otherUserData,
        createdAt: existingConversation[0].createdAt,
        updatedAt: existingConversation[0].updatedAt,
        isNew: false as const,
      };
    }

    // Create new conversation
    const conversationId = uuidv4();
    const now = new Date();

    await db.insert(conversations).values({
      id: conversationId,
      userId1: currentUserId,
      userId2: otherUserId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: conversationId,
      otherUser: otherUserData,
      createdAt: now,
      updatedAt: now,
      isNew: true as const,
    };
  });
