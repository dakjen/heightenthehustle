-- Track when members were emailed about a resource. Applied by: npm run db:apply
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "notified_at" timestamp with time zone;
