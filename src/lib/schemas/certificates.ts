import { z } from "zod";
import { certificateRoleValues, eventTypeValues } from "@/server/db/schema";

// ---------------------------
// INPUT SCHEMAS
// ---------------------------

export const generateCertificatesInputSchema = z.object({
  eventId: z.string().uuid(),
});

export const downloadCertificateInputSchema = z.object({
  certificateId: z.string().uuid(),
});

export const verifyCertificateInputSchema = z.object({
  code: z.string().min(1).max(20),
});

export const revokeCertificateInputSchema = z.object({
  certificateId: z.string().uuid(),
  reason: z.string().min(1).max(255),
});

export const listCertificatesByEventInputSchema = z.object({
  eventId: z.string().uuid(),
});

// ---------------------------
// OUTPUT SCHEMAS
// ---------------------------

export const certificateSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  role: z.enum(certificateRoleValues),
  verificationCode: z.string(),
  recipientName: z.string(),
  recipientEmail: z.string(),
  eventTitle: z.string(),
  eventType: z.enum(eventTypeValues),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
  sessionTitle: z.string().nullable(),
  contributionDetails: z.unknown().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  revokeReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const certificateListSchema = z.array(certificateSchema);

export const certificateWithUserSchema = certificateSchema.extend({
  userImage: z.string().nullable(),
});

export const certificateListWithUserSchema = z.array(certificateWithUserSchema);

// For public verification endpoint
export const verificationResultSchema = z.object({
  valid: z.boolean(),
  certificate: z
    .object({
      recipientName: z.string(),
      eventTitle: z.string(),
      eventType: z.enum(eventTypeValues),
      eventStartDate: z.date(),
      eventEndDate: z.date(),
      eventLocation: z.string().nullable(),
      role: z.enum(certificateRoleValues),
      sessionTitle: z.string().nullable(),
      issuedAt: z.date(),
      revoked: z.boolean(),
      revokeReason: z.string().nullable(),
    })
    .nullable(),
});

// For preview before generation
export const eligibleRecipientSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  role: z.enum(certificateRoleValues),
  sessionTitle: z.string().nullable(),
  alreadyIssued: z.boolean(),
});

export const eligibleRecipientsSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string(),
  eventEnded: z.boolean(),
  recipients: z.array(eligibleRecipientSchema),
  alreadyIssuedCount: z.number(),
  newRecipientsCount: z.number(),
});

// For generate endpoint response
export const generateCertificatesResultSchema = z.object({
  success: z.boolean(),
  generated: z.number(),
  skipped: z.number(),
  message: z.string(),
});

// For my certificates listing (user view)
export const myCertificateSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  role: z.enum(certificateRoleValues),
  verificationCode: z.string(),
  eventTitle: z.string(),
  eventType: z.enum(eventTypeValues),
  eventStartDate: z.date(),
  eventEndDate: z.date(),
  eventLocation: z.string().nullable(),
  sessionTitle: z.string().nullable(),
  issuedAt: z.date(),
  downloadedAt: z.date().nullable(),
});

export const myCertificatesListSchema = z.array(myCertificateSchema);

// ---------------------------
// TYPES
// ---------------------------

export type GenerateCertificatesInput = z.infer<
  typeof generateCertificatesInputSchema
>;
export type DownloadCertificateInput = z.infer<
  typeof downloadCertificateInputSchema
>;
export type VerifyCertificateInput = z.infer<
  typeof verifyCertificateInputSchema
>;
export type RevokeCertificateInput = z.infer<
  typeof revokeCertificateInputSchema
>;
export type ListCertificatesByEventInput = z.infer<
  typeof listCertificatesByEventInputSchema
>;

export type Certificate = z.infer<typeof certificateSchema>;
export type CertificateWithUser = z.infer<typeof certificateWithUserSchema>;
export type VerificationResult = z.infer<typeof verificationResultSchema>;
export type EligibleRecipient = z.infer<typeof eligibleRecipientSchema>;
export type EligibleRecipients = z.infer<typeof eligibleRecipientsSchema>;
export type GenerateCertificatesResult = z.infer<
  typeof generateCertificatesResultSchema
>;
export type MyCertificate = z.infer<typeof myCertificateSchema>;
