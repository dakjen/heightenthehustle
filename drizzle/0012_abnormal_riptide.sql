CREATE TABLE "demographics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
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
ALTER TABLE "businesses" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "demographic_id" integer;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_messages" ADD CONSTRAINT "individual_messages_reply_to_message_id_individual_messages_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."individual_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mass_messages" ADD CONSTRAINT "mass_messages_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_demographic_id_demographics_id_fk" FOREIGN KEY ("demographic_id") REFERENCES "public"."demographics"("id") ON DELETE no action ON UPDATE no action;