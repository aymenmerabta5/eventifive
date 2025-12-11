import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  pgEnum,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

// ---------------------------
// ENUMS
// ---------------------------
export const rolesEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "communicator",
  "scientific_committee_member",
  "participant",
  "speaker",
  "workshop_facilitator",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "congress",
  "seminar",
  "workshop",
  "scientific_meeting",
  "conference",
  "symposium",
]);

export const submissionTypeEnum = pgEnum("submission_type", [
  "oral",
  "poster",
  "workshop",
  "demo",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "revision_requested",
]);

export const reviewRecommendationEnum = pgEnum("review_recommendation", [
  "accept",
  "minor_revision",
  "major_revision",
  "reject",
]);

// ---------------------------
// USERS & AUTH
// ---------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  institution: varchar("institution", { length: 100 }),
  researchDomain: varchar("research_domain", { length: 100 }),
  biography: jsonb("biography"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: rolesEnum("name").notNull().default("participant"),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// ---------------------------
// EVENTS
// ---------------------------
export const event = pgTable("event", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: eventTypeEnum("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 255 }),
  theme: varchar("theme", { length: 255 }),
  contactEmail: text("contact_email"),
  organizerId: text("organizer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventCommittee = pgTable("event_committee", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 100 }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// ---------------------------
// SUBMISSIONS
// ---------------------------
export const submission = pgTable("submission", {
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
});

export const submissionAuthor = pgTable("submission_author", {
  id: serial("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: text("email"),
  affiliation: varchar("affiliation", { length: 255 }),
  isCorresponding: boolean("is_corresponding").notNull().default(false),
});

// ---------------------------
// REVIEWS
// ---------------------------
export const review = pgTable("review", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  score: integer("score"),
  comments: text("comments"),
  recommendation: reviewRecommendationEnum("recommendation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviewAssignment = pgTable("review_assignment", {
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
});

// ---------------------------
// EVENT REGISTRATION
// ---------------------------
export const eventRegistration = pgTable("event_registration", {
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
});

// ---------------------------
// ENUM VALUE ARRAYS
// ---------------------------
export const eventTypeValues = eventTypeEnum.enumValues;
export const submissionTypeValues = submissionTypeEnum.enumValues;
export const submissionStatusValues = submissionStatusEnum.enumValues;
export const reviewRecommendationValues = reviewRecommendationEnum.enumValues;
export const roleValues = rolesEnum.enumValues;

// Types
export type EventType = (typeof eventTypeValues)[number];
export type SubmissionType = (typeof submissionTypeValues)[number];
export type SubmissionStatus = (typeof submissionStatusValues)[number];
export type ReviewRecommendation = (typeof reviewRecommendationValues)[number];
export type Role = (typeof roleValues)[number];
