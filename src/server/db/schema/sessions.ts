import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  serial,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { user } from "./users";
import { event } from "./events";
import { submission } from "./submissions";

// ---------------------------
// ROOMS
// ---------------------------
export const room = pgTable(
  "room",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    capacity: integer("capacity"),
    location: varchar("location", { length: 255 }),
  },
  (table) => [index("room_event_id_idx").on(table.eventId)],
);

// ---------------------------
// PROGRAM SESSIONS
// ---------------------------
export const programSession = pgTable(
  "program_session",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at").notNull(),
    roomId: integer("room_id").references(() => room.id, {
      onDelete: "set null",
    }),
    chairId: text("chair_id").references(() => user.id, {
      onDelete: "set null",
    }),
    meetingLink: varchar("meeting_link", { length: 500 }),
    qaEnabled: boolean("qa_enabled").notNull().default(true),
    qaModerated: boolean("qa_moderated").notNull().default(false),
  },
  (table) => [
    index("program_session_event_id_idx").on(table.eventId),
    index("program_session_start_at_idx").on(table.startAt),
  ],
);

export const sessionAssignment = pgTable(
  "session_assignment",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => programSession.id, { onDelete: "cascade" }),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order"),
  },
  (table) => [
    unique("session_assignment_session_submission_unique").on(
      table.sessionId,
      table.submissionId,
    ),
    index("session_assignment_session_id_idx").on(table.sessionId),
  ],
);

// ---------------------------
// WORKSHOPS
// ---------------------------
export const workshop = pgTable(
  "workshop",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    capacity: integer("capacity"),
    facilitatorId: text("facilitator_id").references(() => user.id, {
      onDelete: "set null",
    }),
    startAt: timestamp("start_at"),
    endAt: timestamp("end_at"),
  },
  (table) => [index("workshop_event_id_idx").on(table.eventId)],
);

export const workshopRegistration = pgTable(
  "workshop_registration",
  {
    id: serial("id").primaryKey(),
    workshopId: text("workshop_id")
      .notNull()
      .references(() => workshop.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    registeredAt: timestamp("registered_at").notNull().defaultNow(),
    status: varchar("status", { length: 50 }).notNull().default("registered"),
  },
  (table) => [
    unique("workshop_registration_workshop_user_unique").on(
      table.workshopId,
      table.userId,
    ),
    index("workshop_registration_workshop_id_idx").on(table.workshopId),
    index("workshop_registration_user_id_idx").on(table.userId),
  ],
);

// ---------------------------
// SESSION Q&A (Questions & Answers)
// ---------------------------
export const sessionQuestions = pgTable(
  "session_questions",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => programSession.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    isApproved: boolean("is_approved").notNull().default(true),
    isAnswered: boolean("is_answered").notNull().default(false),
    likeCount: integer("like_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("session_questions_session_id_idx").on(table.sessionId),
    index("session_questions_user_id_idx").on(table.userId),
    index("session_questions_created_at_idx").on(table.createdAt),
  ],
);

export const sessionQuestionLikes = pgTable(
  "session_question_likes",
  {
    id: serial("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => sessionQuestions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("session_question_likes_question_user_unique").on(
      table.questionId,
      table.userId,
    ),
    index("session_question_likes_question_id_idx").on(table.questionId),
  ],
);

export const sessionQuestionAnswers = pgTable(
  "session_question_answers",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => sessionQuestions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("session_question_answers_question_id_idx").on(table.questionId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Room = InferSelectModel<typeof room>;
export type NewRoom = InferInsertModel<typeof room>;

export type ProgramSession = InferSelectModel<typeof programSession>;
export type NewProgramSession = InferInsertModel<typeof programSession>;

export type SessionAssignment = InferSelectModel<typeof sessionAssignment>;
export type NewSessionAssignment = InferInsertModel<typeof sessionAssignment>;

export type SessionQuestion = InferSelectModel<typeof sessionQuestions>;
export type NewSessionQuestion = InferInsertModel<typeof sessionQuestions>;

export type SessionQuestionLike = InferSelectModel<typeof sessionQuestionLikes>;
export type NewSessionQuestionLike = InferInsertModel<typeof sessionQuestionLikes>;

export type SessionQuestionAnswer = InferSelectModel<typeof sessionQuestionAnswers>;
export type NewSessionQuestionAnswer = InferInsertModel<typeof sessionQuestionAnswers>;
