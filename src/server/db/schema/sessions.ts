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
import { submission } from "./communicators";
import { pollTypeEnum } from "./enums";

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
// SESSION POLLS
// ---------------------------
export const sessionPoll = pgTable(
  "session_poll",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => programSession.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    pollType: pollTypeEnum("poll_type").notNull().default("single"),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("session_poll_session_id_idx").on(table.sessionId),
    index("session_poll_created_at_idx").on(table.createdAt),
    index("session_poll_is_active_idx").on(table.isActive),
  ],
);

export const sessionPollOption = pgTable(
  "session_poll_option",
  {
    id: serial("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => sessionPoll.id, { onDelete: "cascade" }),
    text: varchar("text", { length: 500 }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [index("session_poll_option_poll_id_idx").on(table.pollId)],
);

export const sessionPollVote = pgTable(
  "session_poll_vote",
  {
    id: serial("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => sessionPoll.id, { onDelete: "cascade" }),
    optionId: integer("option_id")
      .notNull()
      .references(() => sessionPollOption.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    votedAt: timestamp("voted_at").notNull().defaultNow(),
  },
  (table) => [
    unique("session_poll_vote_poll_user_option_unique").on(
      table.pollId,
      table.userId,
      table.optionId,
    ),
    index("session_poll_vote_poll_id_idx").on(table.pollId),
    index("session_poll_vote_user_id_idx").on(table.userId),
    index("session_poll_vote_option_id_idx").on(table.optionId),
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
export type NewSessionQuestionLike = InferInsertModel<
  typeof sessionQuestionLikes
>;

export type SessionQuestionAnswer = InferSelectModel<
  typeof sessionQuestionAnswers
>;
export type NewSessionQuestionAnswer = InferInsertModel<
  typeof sessionQuestionAnswers
>;

export type SessionPoll = InferSelectModel<typeof sessionPoll>;
export type NewSessionPoll = InferInsertModel<typeof sessionPoll>;

export type SessionPollOption = InferSelectModel<typeof sessionPollOption>;
export type NewSessionPollOption = InferInsertModel<typeof sessionPollOption>;

export type SessionPollVote = InferSelectModel<typeof sessionPollVote>;
export type NewSessionPollVote = InferInsertModel<typeof sessionPollVote>;
