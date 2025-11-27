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

export const fileTypeEnum = pgEnum("file_type", ["image", "document"]);
export const fileStatusEnum = pgEnum("file_status", [
  "pending",
  "completed",
  "failed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "pending",
  "paid",
  "refunded",
]);

// ---------------------------
// USERS, ROLES, AUTH
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

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------
// EVENTS, ORGANIZERS, COMMITTEES
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
  role: varchar("role", { length: 100 }), // e.g. "chair", "member"
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const eventSpeakers = pgTable("event_speakers", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  affiliation: varchar("affiliation", { length: 255 }),
  isInvited: boolean("is_invited").notNull().default(false),
});

// ---------------------------
// FILES (must be defined before submissionFile)
// ---------------------------
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  eventId: text("event_id").references(() => event.id, { onDelete: "cascade" }),
  s3Key: varchar("s3_key", { length: 1000 }).notNull().unique(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: fileTypeEnum("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  status: fileStatusEnum("status").notNull().default("pending"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const submissionFile = pgTable("submission_file", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  fileId: text("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  purpose: varchar("purpose", { length: 100 }), // e.g., "abstract_pdf", "full_paper"
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// ---------------------------
// REVIEWS & REVIEW ASSIGNMENTS
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
// SESSIONS (PROGRAM), ROOMS
// ---------------------------
export const room = pgTable("room", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  capacity: integer("capacity"),
  location: varchar("location", { length: 255 }),
});

export const programSession = pgTable("program_session", {
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
  chairId: text("chair_id").references(() => user.id, { onDelete: "set null" }),
});

export const sessionAssignment = pgTable("session_assignment", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => programSession.id, { onDelete: "cascade" }),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order"),
});

// ---------------------------
// WORKSHOPS
// ---------------------------
export const workshop = pgTable("workshop", {
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
});

export const workshopRegistration = pgTable("workshop_registration", {
  id: serial("id").primaryKey(),
  workshopId: text("workshop_id")
    .notNull()
    .references(() => workshop.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("registered"),
});

// ---------------------------
// EVENT REGISTRATION & PAYMENT
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
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("unpaid"),
  paymentReference: varchar("payment_reference", { length: 255 }),
});

export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  registrationId: integer("registration_id")
    .notNull()
    .references(() => eventRegistration.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("DZD"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  provider: varchar("provider", { length: 100 }),
  providerData: jsonb("provider_data"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// messaging section we may support group chats in another world xD

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  userId1: text("user_id_1")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  userId2: text("user_id_2")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("message", {
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
});