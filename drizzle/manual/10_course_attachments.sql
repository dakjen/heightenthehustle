-- Templates / documents attached to courses and lessons. Applied by: npm run db:apply
CREATE TABLE IF NOT EXISTS "course_attachments" (
  "id" serial PRIMARY KEY NOT NULL,
  "class_id" integer NOT NULL REFERENCES "classes"("id") ON DELETE cascade,
  "lesson_id" integer REFERENCES "lessons"("id") ON DELETE cascade,
  "title" text NOT NULL,
  "file_name" text NOT NULL,
  "url" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "uploaded_by_id" integer NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "course_attachments_class_idx" ON "course_attachments" ("class_id");
CREATE INDEX IF NOT EXISTS "course_attachments_lesson_idx" ON "course_attachments" ("lesson_id");
