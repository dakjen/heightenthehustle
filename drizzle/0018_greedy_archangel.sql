CREATE TYPE "public"."location_category" AS ENUM('City', 'Region');--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "category" "location_category" DEFAULT 'City' NOT NULL;