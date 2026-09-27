-- Applied by: npm run db:apply (runs every file in drizzle/manual, in order; all are safe to re-run)
-- (drizzle-kit push chokes on enum changes against this database, so we apply SQL directly.)

-- The live database's location_category enum is missing 'State', which the schema expects.
ALTER TYPE "public"."location_category" ADD VALUE IF NOT EXISTS 'State';
CREATE TYPE "public"."cohort_status" AS ENUM('upcoming', 'open', 'in_progress', 'completed');
CREATE TABLE "cohorts" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "status" "cohort_status" DEFAULT 'upcoming' NOT NULL,
  "is_waitlist_open" boolean DEFAULT true NOT NULL,
  "created_by_id" integer NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "cohort_waitlist" (
  "id" serial PRIMARY KEY NOT NULL,
  "cohort_id" integer NOT NULL REFERENCES "cohorts"("id") ON DELETE cascade,
  "user_id" integer REFERENCES "users"("id"),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" varchar(20),
  "business_name" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "cohort_waitlist_cohort_email_idx" ON "cohort_waitlist" ("cohort_id", "email");

-- Account request: which pitch competition(s) the applicant took part in.
ALTER TABLE "users" ADD COLUMN "pitch_event_ids" integer[];
ALTER TABLE "users" ADD COLUMN "pitch_event_other" text;
