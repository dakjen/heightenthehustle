-- Course delivery: publish flags, lesson media, cohort enrollments, progress. Applied by: npm run db:apply
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "cover_image_url" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "summary" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_url" text;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "duration_minutes" integer;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT true NOT NULL;
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "cohort_id" integer REFERENCES "cohorts"("id");
CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "lesson_id" integer NOT NULL REFERENCES "lessons"("id") ON DELETE cascade,
  "completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_user_lesson_idx" ON "lesson_progress" ("user_id", "lesson_id");
