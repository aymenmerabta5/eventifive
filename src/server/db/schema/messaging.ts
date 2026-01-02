import {
  pgTable,
  text,
  timestamp,
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { user } from "./users";

// ---------------------------
// CONVERSATIONS
// ---------------------------
export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    userId1: text("user_id_1")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userId2: text("user_id_2")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("conversations_users_unique").on(table.userId1, table.userId2),
    index("conversations_user_id_1_idx").on(table.userId1),
    index("conversations_user_id_2_idx").on(table.userId2),
  ],
);

// ---------------------------
// MESSAGES
// ---------------------------
export const messages = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);

// ---------------------------
// READ RECEIPTS
// ---------------------------
export const readReceipts = pgTable(
  "read_receipts",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastReadMessageId: text("last_read_message_id").references(
      () => messages.id,
      {
        onDelete: "set null",
      },
    ),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("read_receipts_conversation_user_idx").on(
      table.conversationId,
      table.userId,
    ),
    index("read_receipts_conversation_id_idx").on(table.conversationId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export type ReadReceipt = InferSelectModel<typeof readReceipts>;
export type NewReadReceipt = InferInsertModel<typeof readReceipts>;
