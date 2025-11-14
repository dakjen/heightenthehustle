ALTER TABLE "users" ADD COLUMN "can_manage_classes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_manage_businesses" boolean DEFAULT false NOT NULL;