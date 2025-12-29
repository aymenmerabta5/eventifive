import {
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { certificateRoleEnum, eventTypeEnum } from "./enums";
import { user } from "./users";
import { event } from "./events";

// ---------------------------
// CERTIFICATES
// ---------------------------
export const certificate = pgTable(
  "certificate",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Certificate details
    role: certificateRoleEnum("role").notNull(),
    verificationCode: varchar("verification_code", { length: 20 })
      .unique()
      .notNull(),

    // Snapshots at issue time (preserved even if user/event changes)
    recipientName: varchar("recipient_name", { length: 255 }).notNull(),
    recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
    eventTitle: varchar("event_title", { length: 255 }).notNull(),
    eventType: eventTypeEnum("event_type").notNull(),
    eventStartDate: timestamp("event_start_date").notNull(),
    eventEndDate: timestamp("event_end_date").notNull(),
    eventLocation: varchar("event_location", { length: 255 }),

    // Optional context for speakers/facilitators
    sessionTitle: varchar("session_title", { length: 255 }),
    contributionDetails: jsonb("contribution_details"),

    // Timestamps
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    downloadedAt: timestamp("downloaded_at"),
    revokedAt: timestamp("revoked_at"),
    revokeReason: varchar("revoke_reason", { length: 255 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("certificate_event_user_role_unique").on(
      table.eventId,
      table.userId,
      table.role,
    ),
    index("certificate_event_id_idx").on(table.eventId),
    index("certificate_user_id_idx").on(table.userId),
    index("certificate_verification_code_idx").on(table.verificationCode),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Certificate = InferSelectModel<typeof certificate>;
export type NewCertificate = InferInsertModel<typeof certificate>;
