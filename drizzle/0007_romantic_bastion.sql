CREATE TABLE "business_to_competition" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"competition_event_id" integer NOT NULL,
	"status" text DEFAULT 'assigned'
);
--> statement-breakpoint
ALTER TABLE "business_to_competition" ADD CONSTRAINT "business_to_competition_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_to_competition" ADD CONSTRAINT "business_to_competition_competition_event_id_pitch_competition_events_id_fk" FOREIGN KEY ("competition_event_id") REFERENCES "public"."pitch_competition_events"("id") ON DELETE no action ON UPDATE no action;