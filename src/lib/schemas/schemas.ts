import { z } from "zod";
import { eventTypeValues } from "@/server/db/schema";

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changeEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  biography: z.any().optional(),
  institution: z
    .string()
    .max(100, "Institution must be less than 100 characters")
    .optional(),
  researchDomain: z
    .string()
    .max(100, "Research domain must be less than 100 characters")
    .optional(),
});

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    type: z.enum(eventTypeValues, {
      error: "Please select a valid event type",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z
      .string()
      .max(255, "Location must be less than 255 characters")
      .optional(),
    image: z.string().optional(),
    // Pricing fields (amount in whole currency units, e.g., 5000 DZD)
    priceAmount: z.number().int().min(0, "Price cannot be negative").default(0),
    priceCurrency: z.string().max(10).default("DZD"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

// TEACHING: Separate schema for the 3-step wizard draft creation.
// We keep it distinct from `createEventSchema` so existing "quick create" flows
// remain stable while the wizard can evolve (images, invites, approvals).
export const createDraftEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    // TEACHING: Keep only a single description field so we don't require DB migrations.
    // This maps to the existing `event.description` column.
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be less than 500 characters"),
    // TEACHING: Rich-text content stored as JSON (TipTap JSONContent).
    // Optional to keep backwards compatibility with older clients.
    bigDescription: z
      .unknown()
      .optional()
      .refine(
        (value) =>
          value === undefined || (typeof value === "object" && value !== null),
        { message: "Big description must be rich text JSON content" },
      )
      .refine(
        (value) =>
          value === undefined ||
          // Guardrail: prevent accidentally sending huge payloads (e.g., pasted base64 images).
          JSON.stringify(value).length <= 100_000,
        { message: "Big description is too large" },
      ),
    type: z.enum(eventTypeValues, {
      error: "Please select a valid event type",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z
      .string()
      .max(255, "Location must be less than 255 characters")
      .optional(),
    // Pricing fields (amount in whole currency units, e.g., 5000 DZD)
    priceAmount: z.number().int().min(0, "Price cannot be negative").default(0),
    priceCurrency: z.string().max(10).default("DZD"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const updateEventSchema = z
  .object({
    eventId: z.string().min(1, "Event ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    bigDescription: z
      .unknown()
      .optional()
      .nullable()
      .refine(
        (value) =>
          value === undefined ||
          value === null ||
          (typeof value === "object" && value !== null),
        { message: "Big description must be rich text content" },
      )
      .refine(
        (value) =>
          value === undefined ||
          value === null ||
          JSON.stringify(value).length <= 100_000,
        { message: "Big description is too large" },
      ),
    type: z.enum(eventTypeValues, {
      error: "Please select a valid event type",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z
      .string()
      .max(255, "Location must be less than 255 characters")
      .optional(),
    // Pricing fields (optional on update, amount in whole currency units)
    priceAmount: z.number().int().min(0, "Price cannot be negative").optional(),
    priceCurrency: z.string().max(10).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});
