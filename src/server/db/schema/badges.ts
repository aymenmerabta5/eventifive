import {
  pgTable,
  text,
  timestamp,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { relations } from "drizzle-orm";

import { badgeRoleEnum } from "./enums";
import { user } from "./users";
import { event } from "./events";

// ---------------------------
// BADGES
// ---------------------------
export const badge = pgTable(
  "badge",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Badge details
    role: badgeRoleEnum("role").notNull(),
    verificationCode: varchar("verification_code", { length: 20 })
      .unique()
      .notNull(),

    // Optional context (for speakers)
    affiliation: varchar("affiliation", { length: 255 }),

    // Timestamps
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    downloadedAt: timestamp("downloaded_at"),
    revokedAt: timestamp("revoked_at"),
    revokeReason: varchar("revoke_reason", { length: 255 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("badge_event_user_role_unique").on(
      table.eventId,
      table.userId,
      table.role,
    ),
    index("badge_event_id_idx").on(table.eventId),
    index("badge_user_id_idx").on(table.userId),
    index("badge_verification_code_idx").on(table.verificationCode),
  ],
);

// ---------------------------
// RELATIONS
// ---------------------------
export const badgeRelations = relations(badge, ({ one }) => ({
  event: one(event, {
    fields: [badge.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [badge.userId],
    references: [user.id],
  }),
}));

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Badge = InferSelectModel<typeof badge>;
export type NewBadge = InferInsertModel<typeof badge>;
