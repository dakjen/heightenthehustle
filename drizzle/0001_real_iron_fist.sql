CREATE TYPE "public"."user_role" AS ENUM('admin', 'internal', 'external');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" NOT NULL;