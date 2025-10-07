CREATE TYPE "public"."demographic_category" AS ENUM('Race', 'Gender', 'Religion');--> statement-breakpoint
ALTER TABLE "demographics" ADD COLUMN "category" "demographic_category" NOT NULL;