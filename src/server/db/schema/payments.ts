import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import {
  billingPeriodEnum,
  subscriptionStatusEnum,
  paymentStatusEnum,
} from "./enums";
import { user } from "./users";
import { eventRegistration } from "./events";

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
// PAYMENT
// ---------------------------
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

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlan>;
export type NewSubscriptionPlan = InferInsertModel<typeof subscriptionPlan>;

export type SubscriptionPrice = InferSelectModel<typeof subscriptionPrice>;
export type NewSubscriptionPrice = InferInsertModel<typeof subscriptionPrice>;

export type UserSubscription = InferSelectModel<typeof userSubscription>;
export type NewUserSubscription = InferInsertModel<typeof userSubscription>;

export type Payment = InferSelectModel<typeof payment>;
export type NewPayment = InferInsertModel<typeof payment>;
