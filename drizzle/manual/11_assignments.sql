-- Homework: assignments + submissions. Applied by: npm run db:apply
CREATE TYPE "public"."submission_status" AS ENUM('submitted', 'graded', 'returned');
CREATE TABLE IF NOT EXISTS "assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "class_id" integer NOT NULL REFERENCES "classes"("id") ON DELETE cascade,
  "lesson_id" integer REFERENCES "lessons"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "instructions" text,
  "due_date" timestamp with time zone,
  "allows_text" boolean DEFAULT true NOT NULL,
  "allows_file" boolean DEFAULT true NOT NULL,
  "points" integer,
  "is_published" boolean DEFAULT true NOT NULL,
  "order" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "assignments_class_idx" ON "assignments" ("class_id");
CREATE INDEX IF NOT EXISTS "assignments_lesson_idx" ON "assignments" ("lesson_id");
CREATE TABLE IF NOT EXISTS "assignment_submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "assignment_id" integer NOT NULL REFERENCES "assignments"("id") ON DELETE cascade,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "cohort_id" integer REFERENCES "cohorts"("id"),
  "text" text,
  "file_name" text,
  "file_blob_pathname" text,
  "file_content_type" text,
  "file_size_bytes" integer,
  "status" "submission_status" DEFAULT 'submitted' NOT NULL,
  "score" integer,
  "feedback" text,
  "graded_by_id" integer REFERENCES "users"("id"),
  "graded_at" timestamp with time zone,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "assignment_submissions_assignment_user_idx" ON "assignment_submissions" ("assignment_id", "user_id");
