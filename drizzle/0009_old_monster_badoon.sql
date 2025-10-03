-- CREATE TYPE "public"."business_tax_status" AS ENUM('S-Corporation', 'C-Corporation', 'Not Applicable');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation');--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "owner_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "percent_ownership" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_type" "business_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_tax_status" "business_tax_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_description" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_industry" text NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_materials_url" text;