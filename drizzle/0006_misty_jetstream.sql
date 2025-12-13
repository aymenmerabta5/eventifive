ALTER TABLE "event" RENAME COLUMN "price_amount_cents" TO "price_amount";--> statement-breakpoint
ALTER TABLE "payment" RENAME COLUMN "amount_cents" TO "amount";--> statement-breakpoint
ALTER TABLE "subscription_price" RENAME COLUMN "amount_cents" TO "amount";