import { pgEnum } from "drizzle-orm/pg-core";

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

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "archived",
]);

export const pollTypeEnum = pgEnum("poll_type", ["single", "multiple"]);

export const badgeRoleEnum = pgEnum("badge_role", [
  "participant",
  "speaker",
  "reviewer",
  "committee",
]);

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
export const eventStatusValues = eventStatusEnum.enumValues;
export const pollTypeValues = pollTypeEnum.enumValues;
export const badgeRoleValues = badgeRoleEnum.enumValues;

// ---------------------------
// ENUM TYPES (union types derived from the arrays)
// ---------------------------
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
export type EventStatus = (typeof eventStatusValues)[number];
export type PollType = (typeof pollTypeValues)[number];
export type BadgeRole = (typeof badgeRoleValues)[number];
