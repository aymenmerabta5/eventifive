import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  serial,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import {
  eventTypeEnum,
  eventStatusEnum,
  eventSpeakerStatusEnum,
  paymentStatusEnum,
} from "./enums";
import { user } from "./users";
import { files } from "./files";

// ---------------------------
// EVENTS
// ---------------------------
export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    smallDescription: varchar("small_description", { length: 255 }),
    bigDescription: jsonb("description"),
    type: eventTypeEnum("type").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    location: varchar("location", { length: 255 }),
    theme: varchar("theme", { length: 255 }),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    priceAmount: integer("price_amount").notNull().default(0),
    priceCurrency: varchar("price_currency", { length: 10 })
      .notNull()
      .default("DZD"),
    chargilyProductId: varchar("chargily_product_id", { length: 100 }),
    chargilyPriceId: varchar("chargily_price_id", { length: 100 }),
    chargilySyncedAt: timestamp("chargily_synced_at"),
    // Event lifecycle status
    status: eventStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    cancelledAt: timestamp("cancelled_at"),
    archivedAt: timestamp("archived_at"),
    cancellationReason: varchar("cancellation_reason", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("event_organizer_id_idx").on(table.organizerId),
    index("event_start_date_idx").on(table.startDate),
    index("event_type_idx").on(table.type),
    index("event_status_idx").on(table.status),
  ],
);

export const eventImages = pgTable(
  "event_images",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("event_images_event_id_idx").on(table.eventId)],
);

export const eventCommittee = pgTable(
  "event_committee",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    unique("event_committee_event_user_unique").on(table.eventId, table.userId),
    index("event_committee_event_id_idx").on(table.eventId),
  ],
);

export const eventSpeakers = pgTable(
  "event_speakers",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    affiliation: varchar("affiliation", { length: 255 }),
    status: eventSpeakerStatusEnum("status").notNull().default("pending"),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => [
    unique("event_speakers_event_user_unique").on(table.eventId, table.userId),
    index("event_speakers_event_id_idx").on(table.eventId),
  ],
);

export const eventReviewers = pgTable(
  "event_reviewers",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: eventSpeakerStatusEnum("status").notNull().default("pending"),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => [
    unique("event_reviewers_event_user_unique").on(table.eventId, table.userId),
    index("event_reviewers_event_id_idx").on(table.eventId),
  ],
);

// ---------------------------
// EVENT REGISTRATION
// ---------------------------
export const eventRegistration = pgTable(
  "event_registration",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleAtEvent: varchar("role_at_event", { length: 100 })
      .notNull()
      .default("participant"),
    registeredAt: timestamp("registered_at").notNull().defaultNow(),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),
  },
  (table) => [
    unique("event_registration_event_user_unique").on(
      table.eventId,
      table.userId,
    ),
    index("event_registration_event_id_idx").on(table.eventId),
    index("event_registration_user_id_idx").on(table.userId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Event = InferSelectModel<typeof event>;
export type NewEvent = InferInsertModel<typeof event>;

export type EventSpeaker = InferSelectModel<typeof eventSpeakers>;
export type NewEventSpeaker = InferInsertModel<typeof eventSpeakers>;

export type EventReviewer = InferSelectModel<typeof eventReviewers>;
export type NewEventReviewer = InferInsertModel<typeof eventReviewers>;

export type EventCommittee = InferSelectModel<typeof eventCommittee>;
export type NewEventCommittee = InferInsertModel<typeof eventCommittee>;

export type EventRegistration = InferSelectModel<typeof eventRegistration>;
export type NewEventRegistration = InferInsertModel<typeof eventRegistration>;
