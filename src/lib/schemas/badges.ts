import { z } from "zod";
import { badgeRoleValues, eventTypeValues } from "@/server/db/schema";

// ---------------------------
// INPUT SCHEMAS
// ---------------------------

export const downloadBadgeInputSchema = z.object({
  badgeId: z.string().uuid(),
});

export const verifyBadgeInputSchema = z.object({
  code: z.string().min(1).max(20),
});

export const revokeBadgeInputSchema = z.object({
  badgeId: z.string().uuid(),
  reason: z.string().min(1).max(255),
});

export const listBadgesByEventInputSchema = z.object({
  eventId: z.string().uuid(),
});

// ---------------------------
// OUTPUT SCHEMAS
// ---------------------------

// Base badge schema (database record)
export const badgeSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.enum(badgeRoleValues),
  verificationCode: z.string(),
  affiliation: z.string().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  revokeReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Badge with user and event data (for display)
export const badgeWithDetailsSchema = z.object({
  id: z.string(),
  role: z.enum(badgeRoleValues),
  verificationCode: z.string(),
  affiliation: z.string().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
  // User data (from join)
  userName: z.string(),
  userEmail: z.string(),
  userImage: z.string().nullable(),
  // Event data (from join)
  eventId: z.string(),
  eventTitle: z.string(),
  eventType: z.enum(eventTypeValues),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
});

export const badgeListWithDetailsSchema = z.array(badgeWithDetailsSchema);

// For public verification endpoint
export const badgeVerificationResultSchema = z.object({
  valid: z.boolean(),
  badge: z
    .object({
      recipientName: z.string(),
      eventTitle: z.string(),
      eventType: z.enum(eventTypeValues),
      eventStartDate: z.date(),
      eventEndDate: z.date(),
      eventLocation: z.string().nullable(),
      role: z.enum(badgeRoleValues),
      affiliation: z.string().nullable(),
      issuedAt: z.date(),
      revoked: z.boolean(),
      revokeReason: z.string().nullable(),
    })
    .nullable(),
});

// For download endpoint (PDF generation data)
export const badgeDownloadDataSchema = z.object({
  id: z.string(),
  role: z.enum(badgeRoleValues),
  verificationCode: z.string(),
  affiliation: z.string().nullable(),
  issuedAt: z.date(),
  // User data
  recipientName: z.string(),
  recipientEmail: z.string(),
  // Event data
  eventTitle: z.string(),
  eventType: z.enum(eventTypeValues),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
});

// For my badges listing (user view)
export const myBadgeSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  role: z.enum(badgeRoleValues),
  verificationCode: z.string(),
  affiliation: z.string().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
  // Event data (from join)
  eventTitle: z.string(),
  eventType: z.enum(eventTypeValues),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
});

export const myBadgesListSchema = z.array(myBadgeSchema);

// For event badges listing (organizer view)
export const eventBadgeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.enum(badgeRoleValues),
  verificationCode: z.string(),
  affiliation: z.string().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  revokeReason: z.string().nullable(),
  // User data (from join)
  userName: z.string(),
  userEmail: z.string(),
  userImage: z.string().nullable(),
});

export const eventBadgesListSchema = z.array(eventBadgeSchema);

// ---------------------------
// TYPES
// ---------------------------

export type DownloadBadgeInput = z.infer<typeof downloadBadgeInputSchema>;
export type VerifyBadgeInput = z.infer<typeof verifyBadgeInputSchema>;
export type RevokeBadgeInput = z.infer<typeof revokeBadgeInputSchema>;
export type ListBadgesByEventInput = z.infer<
  typeof listBadgesByEventInputSchema
>;

export type Badge = z.infer<typeof badgeSchema>;
export type BadgeWithDetails = z.infer<typeof badgeWithDetailsSchema>;
export type BadgeVerificationResult = z.infer<
  typeof badgeVerificationResultSchema
>;
export type BadgeDownloadData = z.infer<typeof badgeDownloadDataSchema>;
export type MyBadge = z.infer<typeof myBadgeSchema>;
export type EventBadge = z.infer<typeof eventBadgeSchema>;
