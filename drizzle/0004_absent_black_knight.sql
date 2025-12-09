CREATE TYPE "public"."billing_period" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "subscription_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"features" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"chargily_product_id" varchar(100),
	"chargily_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plan_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subscription_price" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"billing_period" "billing_period" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'DZD' NOT NULL,
	"chargily_price_id" varchar(100),
	"chargily_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"price_id" text NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "registration_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "provider" SET DEFAULT 'chargily';--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "chargily_checkout_id" varchar(100);--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "payment_method" varchar(50);--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "subscription_price" ADD CONSTRAINT "subscription_price_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_plan_id_subscription_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_price_id_subscription_price_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_price"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_subscription_id_user_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;