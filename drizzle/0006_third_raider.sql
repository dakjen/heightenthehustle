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
ALTER TABLE "pitch_competitions" RENAME TO "pitch_submissions";--> statement-breakpoint
ALTER TABLE "pitch_submissions" DROP CONSTRAINT "pitch_competitions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_submissions" DROP CONSTRAINT "pitch_competitions_business_id_businesses_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_submissions" ADD COLUMN "competition_event_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pitch_competition_events" ADD CONSTRAINT "pitch_competition_events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_submissions" ADD CONSTRAINT "pitch_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_submissions" ADD CONSTRAINT "pitch_submissions_competition_event_id_pitch_competition_events_id_fk" FOREIGN KEY ("competition_event_id") REFERENCES "public"."pitch_competition_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_submissions" DROP COLUMN "business_id";