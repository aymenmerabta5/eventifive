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
  index,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------
// ENUMS
// ---------------------------
export const rolesEnum = pgEnum("role", ["super_admin", "organizer", "user"]);

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
  "displayed_paper",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "accepted",
  "rejected",
]);

export const reviewRecommendationEnum = pgEnum("review_recommendation", [
  "accept",
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

export const billingPeriodEnum = pgEnum("billing_period", [
  "monthly",
  "yearly",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "cancelled",
  "expired",
]);

export const eventSpeakerStatusEnum = pgEnum("event_speaker_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const certificateRoleEnum = pgEnum("certificate_role", [
  "speaker",
  "committee",
  "reviewer",
  "facilitator",
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
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: rolesEnum("name").notNull().default("user"),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    unique("user_roles_user_role_unique").on(table.userId, table.roleId),
    index("user_roles_user_id_idx").on(table.userId),
  ],
);

export const session = pgTable(
  "session",
  {
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
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
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
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("event_organizer_id_idx").on(table.organizerId),
    index("event_start_date_idx").on(table.startDate),
    index("event_type_idx").on(table.type),
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
// FILES (must be defined before submissionFile)
// ---------------------------
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => event.id, {
      onDelete: "cascade",
    }),
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
// SESSIONS (PROGRAM), ROOMS
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
// SUBSCRIPTION PLANS & PRICING
// ---------------------------
export const subscriptionPlan = pgTable("subscription_plan", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  features: jsonb("features").$type<string[]>(),
  eventQuota: integer("event_quota").notNull().default(3), // -1 = unlimited
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  chargilyProductId: varchar("chargily_product_id", { length: 100 }),
  chargilySyncedAt: timestamp("chargily_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptionPrice = pgTable(
  "subscription_price",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => subscriptionPlan.id, { onDelete: "cascade" }),
    billingPeriod: billingPeriodEnum("billing_period").notNull(),
    amount: integer("amount").notNull(), // Amount in whole currency units (e.g., 5000 DZD)
    currency: varchar("currency", { length: 10 }).notNull().default("DZD"),
    chargilyPriceId: varchar("chargily_price_id", { length: 100 }),
    chargilySyncedAt: timestamp("chargily_synced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("subscription_price_plan_period_unique").on(
      table.planId,
      table.billingPeriod,
    ),
    index("subscription_price_plan_id_idx").on(table.planId),
  ],
);

export const userSubscription = pgTable(
  "user_subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => subscriptionPlan.id),
    priceId: text("price_id")
      .notNull()
      .references(() => subscriptionPrice.id),
    status: subscriptionStatusEnum("status").notNull().default("pending"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_subscription_user_id_idx").on(table.userId),
    index("user_subscription_status_idx").on(table.status),
  ],
);

// ---------------------------
// EVENT REGISTRATION & PAYMENT
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

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    // Either for event registration or subscription (one should be set)
    registrationId: integer("registration_id").references(
      () => eventRegistration.id,
      { onDelete: "cascade" },
    ),
    subscriptionId: text("subscription_id").references(
      () => userSubscription.id,
      { onDelete: "cascade" },
    ),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // Amount in whole currency units (e.g., 5000 DZD)
    currency: varchar("currency", { length: 10 }).notNull().default("DZD"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    provider: varchar("provider", { length: 100 })
      .notNull()
      .default("chargily"),
    // Chargily-specific fields
    chargilyCheckoutId: varchar("chargily_checkout_id", { length: 100 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    failureReason: text("failure_reason"),
    providerData: jsonb("provider_data"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("payment_user_id_idx").on(table.userId),
    index("payment_status_idx").on(table.status),
    index("payment_chargily_checkout_id_idx").on(table.chargilyCheckoutId),
  ],
);

// messaging section we may support group chats in another world xD

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

// Read receipts - tracks when users have read messages in conversations
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
    lastReadMessageId: text("last_read_message_id").references(() => messages.id, {
      onDelete: "set null",
    }),
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
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// User types
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

// Event types
export type Event = InferSelectModel<typeof event>;
export type NewEvent = InferInsertModel<typeof event>;

// Submission types
export type Submission = InferSelectModel<typeof submission>;
export type NewSubmission = InferInsertModel<typeof submission>;

// Review types
export type Review = InferSelectModel<typeof review>;
export type NewReview = InferInsertModel<typeof review>;

// File types
export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;

// Conversation types
export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;

// Message types
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

// Read receipt types
export type ReadReceipt = InferSelectModel<typeof readReceipts>;
export type NewReadReceipt = InferInsertModel<typeof readReceipts>;

// Subscription plan types
export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlan>;
export type NewSubscriptionPlan = InferInsertModel<typeof subscriptionPlan>;

// Subscription price types
export type SubscriptionPrice = InferSelectModel<typeof subscriptionPrice>;
export type NewSubscriptionPrice = InferInsertModel<typeof subscriptionPrice>;

// User subscription types
export type UserSubscription = InferSelectModel<typeof userSubscription>;
export type NewUserSubscription = InferInsertModel<typeof userSubscription>;

// Payment types
export type Payment = InferSelectModel<typeof payment>;
export type NewPayment = InferInsertModel<typeof payment>;

// Event registration types
export type EventRegistration = InferSelectModel<typeof eventRegistration>;
export type NewEventRegistration = InferInsertModel<typeof eventRegistration>;

// Event speaker types
export type EventSpeaker = InferSelectModel<typeof eventSpeakers>;
export type NewEventSpeaker = InferInsertModel<typeof eventSpeakers>;

// Event reviewer types
export type EventReviewer = InferSelectModel<typeof eventReviewers>;
export type NewEventReviewer = InferInsertModel<typeof eventReviewers>;

// Event committee types
export type EventCommittee = InferSelectModel<typeof eventCommittee>;
export type NewEventCommittee = InferInsertModel<typeof eventCommittee>;

// Room types
export type Room = InferSelectModel<typeof room>;
export type NewRoom = InferInsertModel<typeof room>;

// Program session types
export type ProgramSession = InferSelectModel<typeof programSession>;
export type NewProgramSession = InferInsertModel<typeof programSession>;

// Session assignment types
export type SessionAssignment = InferSelectModel<typeof sessionAssignment>;
export type NewSessionAssignment = InferInsertModel<typeof sessionAssignment>;

// Session Q&A types
export type SessionQuestion = InferSelectModel<typeof sessionQuestions>;
export type NewSessionQuestion = InferInsertModel<typeof sessionQuestions>;

export type SessionQuestionLike = InferSelectModel<typeof sessionQuestionLikes>;
export type NewSessionQuestionLike = InferInsertModel<typeof sessionQuestionLikes>;

export type SessionQuestionAnswer = InferSelectModel<typeof sessionQuestionAnswers>;
export type NewSessionQuestionAnswer = InferInsertModel<typeof sessionQuestionAnswers>;

// Certificate types
export type Certificate = InferSelectModel<typeof certificate>;
export type NewCertificate = InferInsertModel<typeof certificate>;

// ---------------------------
// ENUM VALUE ARRAYS (for use in zod schemas and UI)
// ---------------------------
export const eventTypeValues = eventTypeEnum.enumValues;
export const submissionTypeValues = submissionTypeEnum.enumValues;
export const submissionStatusValues = submissionStatusEnum.enumValues;
export const reviewRecommendationValues = reviewRecommendationEnum.enumValues;
export const eventSpeakerStatusValues = eventSpeakerStatusEnum.enumValues;
export const fileTypeValues = fileTypeEnum.enumValues;
export const fileStatusValues = fileStatusEnum.enumValues;
export const paymentStatusValues = paymentStatusEnum.enumValues;
export const roleValues = rolesEnum.enumValues;
export const billingPeriodValues = billingPeriodEnum.enumValues;
export const subscriptionStatusValues = subscriptionStatusEnum.enumValues;
export const certificateRoleValues = certificateRoleEnum.enumValues;

// Enum types (union types derived from the arrays)
export type EventType = (typeof eventTypeValues)[number];
export type SubmissionType = (typeof submissionTypeValues)[number];
export type SubmissionStatus = (typeof submissionStatusValues)[number];
export type ReviewRecommendation = (typeof reviewRecommendationValues)[number];
export type EventSpeakerStatus = (typeof eventSpeakerStatusValues)[number];
export type FileType = (typeof fileTypeValues)[number];
export type FileStatus = (typeof fileStatusValues)[number];
export type PaymentStatus = (typeof paymentStatusValues)[number];
export type Role = (typeof roleValues)[number];
export type BillingPeriod = (typeof billingPeriodValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusValues)[number];
export type CertificateRole = (typeof certificateRoleValues)[number];
