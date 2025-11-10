CREATE TYPE "public"."business_tax_status" AS ENUM('S-Corporation', 'C-Corporation', 'Not Applicable');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation');--> statement-breakpoint
CREATE TYPE "public"."demographic_category" AS ENUM('Race', 'Gender', 'Religion');--> statement-breakpoint
CREATE TYPE "public"."location_category" AS ENUM('City', 'Region');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'internal', 'external');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"percent_ownership" numeric NOT NULL,
	"business_type" "business_type" NOT NULL,
	"business_tax_status" "business_tax_status" NOT NULL,
	"business_description" text,
	"business_industry" text NOT NULL,
	"naics_code" varchar(6),
	"logo_url" text,
	"business_profile_photo_url" text,
	"business_materials_url" text,
	"street_address" text,
	"city" text,
	"state" varchar(2),
	"zip_code" varchar(10),
	"phone" varchar(20),
	"website" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"location_id" integer,
	"demographic_ids" integer[],
	"material1_url" text,
	"material1_title" text,
	"material2_url" text,
	"material2_title" text,
	"material3_url" text,
	"material3_title" text,
	"material4_url" text,
	"material4_title" text,
	"material5_url" text,
	"material5_title" text
);
--> statement-breakpoint
CREATE TABLE "demographics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "demographic_category" NOT NULL,
	CONSTRAINT "demographics_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "individual_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"reply_to_message_id" integer
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "location_category" DEFAULT 'City' NOT NULL,
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mass_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"content" text NOT NULL,
	"target_location_ids" integer[],
	"target_demographic_ids" integer[],
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pitch_competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"project_name" text NOT NULL,
	"project_location" text NOT NULL,
	"pitch_video_url" text,
	"pitch_deck_url" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text NOT NULL,
	"password" varchar(256) NOT NULL,
	"role" "user_role" DEFAULT 'internal' NOT NULL,
	"has_business_profile" boolean DEFAULT false NOT NULL,
	"personal_address" text,
	"personal_city" text,
	"personal_state" varchar(2),
	"personal_zip_code" varchar(10),
	"profile_photo_url" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_reply_to_message_id_individual_messages_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."individual_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mass_messages" ADD CONSTRAINT "mass_messages_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_competitions" ADD CONSTRAINT "pitch_competitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_competitions" ADD CONSTRAINT "pitch_competitions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;