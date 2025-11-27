CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'pending', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."review_recommendation" AS ENUM('accept', 'minor_revision', 'major_revision', 'reject');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('oral', 'poster', 'workshop', 'demo');--> statement-breakpoint
CREATE TABLE "event_committee" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(100),
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registration" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_at_event" varchar(100) DEFAULT 'participant' NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"payment_reference" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"affiliation" varchar(255),
	"is_invited" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar(100),
	"provider_data" jsonb,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_session" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"room_id" integer,
	"chair_id" text
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"score" integer,
	"comments" text,
	"recommendation" "review_recommendation",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"due_at" timestamp,
	"status" varchar(50) DEFAULT 'assigned' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"capacity" integer,
	"location" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "session_assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"submission_id" text NOT NULL,
	"display_order" integer
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"abstract" text,
	"keywords" varchar(500),
	"type" "submission_type" DEFAULT 'oral' NOT NULL,
	"status" "submission_status" DEFAULT 'draft' NOT NULL,
	"submitter_id" text NOT NULL,
	"submitted_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_author" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" text,
	"affiliation" varchar(255),
	"is_corresponding" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_file" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"file_id" text NOT NULL,
	"purpose" varchar(100),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"capacity" integer,
	"facilitator_id" text,
	"start_at" timestamp,
	"end_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workshop_registration" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" text NOT NULL,
	"user_id" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'registered' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "s3_key" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "institution" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "research_domain" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "theme" varchar(255);--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "assigned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_committee" ADD CONSTRAINT "event_committee_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_committee" ADD CONSTRAINT "event_committee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_registration_id_event_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_session" ADD CONSTRAINT "program_session_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_session" ADD CONSTRAINT "program_session_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_session" ADD CONSTRAINT "program_session_chair_id_user_id_fk" FOREIGN KEY ("chair_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_session_id_program_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."program_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_assignment" ADD CONSTRAINT "session_assignment_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_submitter_id_user_id_fk" FOREIGN KEY ("submitter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_author" ADD CONSTRAINT "submission_author_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_file" ADD CONSTRAINT "submission_file_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_file" ADD CONSTRAINT "submission_file_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop" ADD CONSTRAINT "workshop_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop" ADD CONSTRAINT "workshop_facilitator_id_user_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "role_id";