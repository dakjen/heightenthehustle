-- Resource usage tracking. Applied by: npm run db:apply
CREATE TABLE IF NOT EXISTS "resource_clicks" (
  "id" serial PRIMARY KEY NOT NULL,
  "resource_id" integer NOT NULL REFERENCES "resources"("id") ON DELETE cascade,
  "user_id" integer REFERENCES "users"("id"),
  "action" text DEFAULT 'open' NOT NULL,
  "clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "resource_clicks_resource_idx" ON "resource_clicks" ("resource_id");
