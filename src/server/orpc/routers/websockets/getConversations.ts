import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { conversations, user, messages } from "@/server/db/schema";
import { eq, or, desc, and, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const inputGetConversationsSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(50).default(20),
});

const conversationSchema = z.object({
	id: z.string(),
	otherUser: z.object({
		id: z.string(),
		name: z.string(),
		image: z.string().nullable(),
	}),
	lastMessage: z
		.object({
			id: z.string(),
			content: z.string(),
			senderId: z.string(),
			createdAt: z.date(),
		})
		.nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const outputGetConversationsSchema = z.object({
	conversations: z.array(conversationSchema),
	nextCursor: z.string().nullable(),
});

export const getConversationsRouter = protectedProcedure
	.route({ method: "GET", path: "/messages/conversations" })
	.input(inputGetConversationsSchema)
	.output(outputGetConversationsSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;
		const userId = session.user.id;
		const { cursor, limit } = input;

		// Create aliases for user table to join for both participants
		const user1 = alias(user, "user1");
		const user2 = alias(user, "user2");

		// Build the query
		const query = db
			.select({
				id: conversations.id,
				userId1: conversations.userId1,
				userId2: conversations.userId2,
				createdAt: conversations.createdAt,
				updatedAt: conversations.updatedAt,
				user1Name: user1.name,
				user1Image: user1.image,
				user2Name: user2.name,
				user2Image: user2.image,
			})
			.from(conversations)
			.leftJoin(user1, eq(conversations.userId1, user1.id))
			.leftJoin(user2, eq(conversations.userId2, user2.id))
			.where(
				cursor
					? and(
							or(
								eq(conversations.userId1, userId),
								eq(conversations.userId2, userId),
							),
							lt(conversations.updatedAt, new Date(cursor)),
						)
					: or(
							eq(conversations.userId1, userId),
							eq(conversations.userId2, userId),
						),
			)
			.orderBy(desc(conversations.updatedAt))
			.limit(limit + 1);

		const results = await query;

		// Get last message for each conversation
		const conversationIds = results.map((c) => c.id);
		const lastMessages =
			conversationIds.length > 0
				? await db
						.selectDistinctOn([messages.conversationId], {
							id: messages.id,
							conversationId: messages.conversationId,
							content: messages.content,
							senderId: messages.senderId,
							createdAt: messages.createdAt,
						})
						.from(messages)
						.where(
							or(
								...conversationIds.map((id) => eq(messages.conversationId, id)),
							),
						)
						.orderBy(messages.conversationId, desc(messages.createdAt))
				: [];

		const lastMessageMap = new Map(
			lastMessages.map((m) => [m.conversationId, m]),
		);

		// Format response
		const hasMore = results.length > limit;
		const conversationResults = results.slice(0, limit).map((conv) => {
			const isUser1 = conv.userId1 === userId;
			const otherUser = isUser1
				? { id: conv.userId2, name: conv.user2Name!, image: conv.user2Image }
				: { id: conv.userId1, name: conv.user1Name!, image: conv.user1Image };

			const lastMessage = lastMessageMap.get(conv.id) || null;

			return {
				id: conv.id,
				otherUser,
				lastMessage,
				createdAt: conv.createdAt,
				updatedAt: conv.updatedAt,
			};
		});

		return {
			conversations: conversationResults,
			nextCursor: hasMore
				? conversationResults[conversationResults.length - 1]?.updatedAt.toISOString() || null
				: null,
		};
	});
