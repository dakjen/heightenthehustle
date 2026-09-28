-- Client intake forms. Each statement is skipped if it already exists. Applied by: npm run db:apply
CREATE TYPE "public"."business_stage" AS ENUM('Idea', 'Startup', 'Growing', 'Established');
CREATE TYPE "public"."intake_status" AS ENUM('submitted', 'reviewed', 'archived');
CREATE TABLE IF NOT EXISTS "client_intake_forms" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "business_stage" "business_stage" NOT NULL,
  "business_description" text NOT NULL,
  "services_needed" text[],
  "current_revenue" varchar(50),
  "number_of_employees" varchar(50),
  "primary_goals" text NOT NULL,
  "biggest_challenges" text NOT NULL,
  "how_did_you_hear" text,
  "pitch_event_ids" integer[],
  "additional_notes" text,
  "status" "intake_status" DEFAULT 'submitted' NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
