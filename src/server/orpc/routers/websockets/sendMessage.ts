import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { messages, conversations } from "@/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import { publishMessage } from "@/server/realtime/pubsub";

const inputSendMessageSchema = z.object({
	conversationId: z.string().min(1),
	content: z.string().min(1).max(5000),
});

const outputSendMessageSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	senderId: z.string(),
	content: z.string(),
	createdAt: z.date(),
});

export const sendMessageRouter = protectedProcedure
	.route({ method: "POST", path: "/messages/send" })
	.input(inputSendMessageSchema)
	.output(outputSendMessageSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;
		const userId = session.user.id;
		const { conversationId, content } = input;

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

		if (conversation.length === 0 || !conversation[0]) {
			throw new ORPCError("NOT_FOUND", {
				message: "Conversation not found or you are not a participant",
			});
		}

		const conv = conversation[0];
		const messageId = uuidv4();
		const now = new Date();

		// Insert message into database
		await db.insert(messages).values({
			id: messageId,
			conversationId,
			senderId: userId,
			content,
			createdAt: now,
			updatedAt: now,
		});

		// Update conversation's updatedAt
		await db
			.update(conversations)
			.set({ updatedAt: now })
			.where(eq(conversations.id, conversationId));

		const message = {
			id: messageId,
			conversationId,
			senderId: userId,
			content,
			createdAt: now,
		};

		// Determine recipient and publish to Redis
		const recipientId =
			conv.userId1 === userId ? conv.userId2 : conv.userId1;

		await publishMessage(message, recipientId);

		return message;
	});
