import { z } from "zod";

// ---------------------------
// ENUMS
// ---------------------------
export const paymentMethodSchema = z.enum(["edahabia", "cib"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const billingPeriodSchema = z.enum(["monthly", "yearly"]);
export type BillingPeriod = z.infer<typeof billingPeriodSchema>;

export const paymentStatusSchema = z.enum(["unpaid", "pending", "paid", "refunded"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const subscriptionStatusSchema = z.enum(["pending", "active", "cancelled", "expired"]);
export type SubscriptionStatusType = z.infer<typeof subscriptionStatusSchema>;

// ---------------------------
// SUBSCRIPTION PLAN SCHEMAS
// ---------------------------
export const createPlanInputSchema = z.object({
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(255),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  prices: z.array(
    z.object({
      billingPeriod: billingPeriodSchema,
      amountCents: z.number().int().positive(),
      currency: z.string().default("DZD"),
    })
  ).min(1),
});
export type CreatePlanInput = z.infer<typeof createPlanInputSchema>;

export const updatePlanInputSchema = z.object({
  planId: z.string(),
  displayName: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export type UpdatePlanInput = z.infer<typeof updatePlanInputSchema>;

export const planOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
  features: z.array(z.string()).nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  chargilyProductId: z.string().nullable(),
  chargilySyncedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  prices: z.array(
    z.object({
      id: z.string(),
      billingPeriod: billingPeriodSchema,
      amountCents: z.number(),
      currency: z.string(),
      chargilyPriceId: z.string().nullable(),
      chargilySyncedAt: z.date().nullable(),
    })
  ),
});
export type PlanOutput = z.infer<typeof planOutputSchema>;

export const listPlansOutputSchema = z.array(planOutputSchema);
export type ListPlansOutput = z.infer<typeof listPlansOutputSchema>;

// ---------------------------
// CHECKOUT SCHEMAS
// ---------------------------
export const createCheckoutInputSchema = z.object({
  priceId: z.string().min(1),
  paymentMethod: paymentMethodSchema.optional(),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

export const createCheckoutOutputSchema = z.object({
  paymentId: z.string(),
  checkoutUrl: z.string().url(),
  chargilyCheckoutId: z.string(),
});
export type CreateCheckoutOutput = z.infer<typeof createCheckoutOutputSchema>;

export const createEventCheckoutInputSchema = z.object({
  eventId: z.string().min(1),
  amountCents: z.number().int().positive(),
  paymentMethod: paymentMethodSchema.optional(),
});
export type CreateEventCheckoutInput = z.infer<typeof createEventCheckoutInputSchema>;

// ---------------------------
// PAYMENT STATUS SCHEMAS
// ---------------------------
export const getPaymentStatusInputSchema = z.object({
  paymentId: z.string().min(1),
});
export type GetPaymentStatusInput = z.infer<typeof getPaymentStatusInputSchema>;

export const paymentStatusOutputSchema = z.object({
  id: z.string(),
  status: paymentStatusSchema,
  amountCents: z.number(),
  currency: z.string(),
  paymentMethod: z.string().nullable(),
  chargilyCheckoutId: z.string().nullable(),
  failureReason: z.string().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
  // Related data
  subscription: z.object({
    id: z.string(),
    planName: z.string(),
    status: subscriptionStatusSchema,
  }).nullable(),
  eventRegistration: z.object({
    id: z.number(),
    eventId: z.string(),
    eventTitle: z.string(),
  }).nullable(),
});
export type PaymentStatusOutput = z.infer<typeof paymentStatusOutputSchema>;

export const listPaymentsOutputSchema = z.array(
  z.object({
    id: z.string(),
    status: paymentStatusSchema,
    amountCents: z.number(),
    currency: z.string(),
    paymentMethod: z.string().nullable(),
    paidAt: z.date().nullable(),
    createdAt: z.date(),
    type: z.enum(["subscription", "event_registration"]),
    description: z.string(),
  })
);
export type ListPaymentsOutput = z.infer<typeof listPaymentsOutputSchema>;

// ---------------------------
// SYNC SCHEMAS
// ---------------------------
export const syncResultSchema = z.object({
  plansCreated: z.number(),
  pricesCreated: z.number(),
  errors: z.array(z.string()),
});
export type SyncResult = z.infer<typeof syncResultSchema>;

// ---------------------------
// WEBHOOK SCHEMAS
// ---------------------------
export const chargilyCheckoutDataSchema = z.object({
  id: z.string(),
  entity: z.literal("checkout"),
  status: z.enum(["pending", "paid", "failed", "expired"]),
  amount: z.number(),
  currency: z.string(),
  payment_method: z.string().nullable(),
  metadata: z.record(z.string()).nullable(),
  success_url: z.string(),
  failure_url: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});
export type ChargilyCheckoutData = z.infer<typeof chargilyCheckoutDataSchema>;

export const chargilyWebhookEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("checkout.paid"),
    data: chargilyCheckoutDataSchema,
  }),
  z.object({
    type: z.literal("checkout.failed"),
    data: chargilyCheckoutDataSchema,
  }),
  z.object({
    type: z.literal("checkout.expired"),
    data: chargilyCheckoutDataSchema,
  }),
]);
export type ChargilyWebhookEvent = z.infer<typeof chargilyWebhookEventSchema>;

// ---------------------------
// USER SUBSCRIPTION SCHEMAS
// ---------------------------
export const userSubscriptionOutputSchema = z.object({
  id: z.string(),
  status: subscriptionStatusSchema,
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelledAt: z.date().nullable(),
  createdAt: z.date(),
  plan: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    features: z.array(z.string()).nullable(),
  }),
  price: z.object({
    id: z.string(),
    billingPeriod: billingPeriodSchema,
    amountCents: z.number(),
    currency: z.string(),
  }),
});
export type UserSubscriptionOutput = z.infer<typeof userSubscriptionOutputSchema>;
