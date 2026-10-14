-- Login + signup timestamps for the admin stats dashboard. Applied by: npm run db:apply
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
