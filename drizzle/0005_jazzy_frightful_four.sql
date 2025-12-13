ALTER TABLE "roles" ALTER COLUMN "name" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "price_amount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "price_currency" varchar(10) DEFAULT 'DZD' NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "chargily_product_id" varchar(100);--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "chargily_price_id" varchar(100);--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "chargily_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "public"."roles" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin', 'user');--> statement-breakpoint
ALTER TABLE "public"."roles" ALTER COLUMN "name" SET DATA TYPE "public"."role" USING "name"::"public"."role";