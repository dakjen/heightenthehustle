CREATE TYPE "public"."class_type" AS ENUM('pre-course', 'hth-course');--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "type" "class_type" DEFAULT 'hth-course' NOT NULL;