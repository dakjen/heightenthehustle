-- Specialized support requests (tickets). Applied by: npm run db:apply
CREATE TYPE "public"."support_category" AS ENUM('Line of Credit / Loans', 'Grants & Funding', 'Legal', 'Accounting & Taxes', 'Licensing & Permits', 'Marketing & Branding', 'Contracts & Procurement', 'Other');
CREATE TYPE "public"."support_urgency" AS ENUM('low', 'normal', 'high');
CREATE TYPE "public"."support_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
CREATE TABLE "support_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "business_id" integer REFERENCES "businesses"("id"),
  "category" "support_category" NOT NULL,
  "subject" text NOT NULL,
  "details" text NOT NULL,
  "amount_needed" text,
  "needed_by" timestamp with time zone,
  "urgency" "support_urgency" DEFAULT 'normal' NOT NULL,
  "status" "support_status" DEFAULT 'open' NOT NULL,
  "admin_notes" text,
  "assigned_to_id" integer REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "support_requests_user_idx" ON "support_requests" ("user_id");
CREATE INDEX "support_requests_status_idx" ON "support_requests" ("status");
