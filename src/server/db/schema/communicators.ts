import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  serial,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import {
  submissionTypeEnum,
  submissionStatusEnum,
  reviewRecommendationEnum,
} from "./enums";
import { user } from "./users";
import { event } from "./events";
import { files } from "./files";

// ---------------------------
// EVENT COMMUNICATORS (renamed from eventCommittee)
// ---------------------------
export const eventCommunicator = pgTable(
  "event_communicator",
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
    unique("event_communicator_event_user_unique").on(table.eventId, table.userId),
    index("event_communicator_event_id_idx").on(table.eventId),
  ],
);

// ---------------------------
// SUBMISSIONS
// ---------------------------
export const submission = pgTable(
  "submission",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    abstract: text("abstract"),
    keywords: varchar("keywords", { length: 500 }),
    type: submissionTypeEnum("type").notNull().default("oral"),
    status: submissionStatusEnum("status").notNull().default("draft"),
    submitterId: text("submitter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    submittedAt: timestamp("submitted_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("submission_event_id_idx").on(table.eventId),
    index("submission_submitter_id_idx").on(table.submitterId),
    index("submission_status_idx").on(table.status),
  ],
);

export const submissionFile = pgTable(
  "submission_file",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    purpose: varchar("purpose", { length: 100 }), // e.g., "abstract_pdf", "full_paper"
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => [
    index("submission_file_submission_id_idx").on(table.submissionId),
  ],
);

// ---------------------------
// REVIEWS & REVIEW ASSIGNMENTS
// ---------------------------
export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    comment: text("comment"),
    score: integer("score"),
    recommendation: reviewRecommendationEnum("recommendation"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("review_submission_reviewer_unique").on(
      table.submissionId,
      table.reviewerId,
    ),
    index("review_submission_id_idx").on(table.submissionId),
    index("review_reviewer_id_idx").on(table.reviewerId),
  ],
);

export const reviewAssignment = pgTable(
  "review_assignment",
  {
    id: serial("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    dueAt: timestamp("due_at"),
    status: varchar("status", { length: 50 }).notNull().default("assigned"),
  },
  (table) => [
    unique("review_assignment_submission_reviewer_unique").on(
      table.submissionId,
      table.reviewerId,
    ),
    index("review_assignment_submission_id_idx").on(table.submissionId),
    index("review_assignment_reviewer_id_idx").on(table.reviewerId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type EventCommunicator = InferSelectModel<typeof eventCommunicator>;
export type NewEventCommunicator = InferInsertModel<typeof eventCommunicator>;

export type Submission = InferSelectModel<typeof submission>;
export type NewSubmission = InferInsertModel<typeof submission>;

export type SubmissionFile = InferSelectModel<typeof submissionFile>;
export type NewSubmissionFile = InferInsertModel<typeof submissionFile>;

export type Review = InferSelectModel<typeof review>;
export type NewReview = InferInsertModel<typeof review>;

export type ReviewAssignment = InferSelectModel<typeof reviewAssignment>;
export type NewReviewAssignment = InferInsertModel<typeof reviewAssignment>;
