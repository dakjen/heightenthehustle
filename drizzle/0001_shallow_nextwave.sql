CREATE TYPE "public"."business_stage" AS ENUM('Idea', 'Startup', 'Growing', 'Established');--> statement-breakpoint
CREATE TYPE "public"."intake_status" AS ENUM('submitted', 'reviewed', 'archived');--> statement-breakpoint
CREATE TABLE "client_intake_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_stage" "business_stage" NOT NULL,
	"business_description" text NOT NULL,
	"services_needed" text[],
	"current_revenue" varchar(50),
	"number_of_employees" varchar(50),
	"primary_goals" text NOT NULL,
	"biggest_challenges" text NOT NULL,
	"how_did_you_hear" text,
	"additional_notes" text,
	"status" "intake_status" DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demographics" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."demographic_category";--> statement-breakpoint
CREATE TYPE "public"."demographic_category" AS ENUM('Race', 'Gender', 'Religion');--> statement-breakpoint
ALTER TABLE "demographics" ALTER COLUMN "category" SET DATA TYPE "public"."demographic_category" USING "category"::"public"."demographic_category";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_cisgender" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_transgender" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_approve_requests" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_message_admins" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_manage_classes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_manage_businesses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "client_intake_forms" ADD CONSTRAINT "client_intake_forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;