CREATE TYPE "public"."business_tax_status" AS ENUM('S-Corporation', 'C-Corporation', 'Not Applicable');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('pre-course', 'hth-course');--> statement-breakpoint
CREATE TYPE "public"."demographic_category" AS ENUM('Race', 'Gender', 'Religion', 'Male', 'Female', 'Non-Binary', 'Intersex', 'Other', 'White', 'Black or African American', 'Asian', 'American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'Middle Eastern or North African', 'Two or More Races', 'Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Sikhism', 'Baháʼí Faith', 'Shinto', 'Taoism', 'Confucianism', 'Jainism', 'Indigenous / Traditional Beliefs', 'Pagan / Wicca', 'Atheist', 'Agnostic', 'Spiritual but Not Religious', 'Cisgender', 'Transgender');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('enrolled', 'completed', 'dropped', 'pending', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."location_category" AS ENUM('City', 'Region', 'State');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'internal', 'external');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "business_to_competition" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"competition_event_id" integer NOT NULL,
	"status" text DEFAULT 'assigned'
);
--> statement-breakpoint
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
	"state_location_id" integer,
	"region_location_id" integer,
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
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"teacher_id" integer NOT NULL,
	"type" "class_type" DEFAULT 'hth-course' NOT NULL,
	"syllabus_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demographics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "demographic_category" NOT NULL,
	CONSTRAINT "demographics_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"status" "enrollment_status" DEFAULT 'pending' NOT NULL,
	"enrollment_date" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "pitch_competition_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pitch_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"competition_event_id" integer NOT NULL,
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
	"role" "user_role" DEFAULT 'external' NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"has_business_profile" boolean DEFAULT false NOT NULL,
	"personal_address" text,
	"personal_city" text,
	"personal_state" varchar(2),
	"personal_zip_code" varchar(10),
	"profile_photo_url" text,
	"business_name" text,
	"is_opted_out" boolean DEFAULT false NOT NULL,
	"can_approve_requests" boolean DEFAULT false NOT NULL,
	"can_message_admins" boolean DEFAULT false NOT NULL,
	"can_manage_classes" boolean DEFAULT false NOT NULL,
	"can_manage_businesses" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "business_to_competition" ADD CONSTRAINT "business_to_competition_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_to_competition" ADD CONSTRAINT "business_to_competition_competition_event_id_pitch_competition_events_id_fk" FOREIGN KEY ("competition_event_id") REFERENCES "public"."pitch_competition_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_state_location_id_locations_id_fk" FOREIGN KEY ("state_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_region_location_id_locations_id_fk" FOREIGN KEY ("region_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_reply_to_message_id_individual_messages_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."individual_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mass_messages" ADD CONSTRAINT "mass_messages_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_competition_events" ADD CONSTRAINT "pitch_competition_events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_submissions" ADD CONSTRAINT "pitch_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_submissions" ADD CONSTRAINT "pitch_submissions_competition_event_id_pitch_competition_events_id_fk" FOREIGN KEY ("competition_event_id") REFERENCES "public"."pitch_competition_events"("id") ON DELETE no action ON UPDATE no action;