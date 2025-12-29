import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { fileTypeEnum, fileStatusEnum } from "./enums";
import { user } from "./users";

// Note: event reference is imported from events.ts
// This creates a controlled dependency - files.ts must be imported before events.ts in the barrel
// The event reference uses a lazy callback which Drizzle resolves at runtime

// ---------------------------
// FILES
// ---------------------------
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // eventId is optional - references event table (defined in events.ts)
    // We use text type and handle the reference in events.ts to avoid circular imports
    eventId: text("event_id"),
    s3Key: varchar("s3_key", { length: 1000 }).notNull().unique(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: fileTypeEnum("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    contentType: varchar("content_type", { length: 100 }).notNull(),
    status: fileStatusEnum("status").notNull().default("pending"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("files_user_id_idx").on(table.userId),
    index("files_event_id_idx").on(table.eventId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;
