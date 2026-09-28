-- Secure documents (private blob storage). Applied by: npm run db:apply
CREATE TYPE "public"."document_kind" AS ENUM('W-9', 'Pitch Deck', 'Business Plan', 'Financials', 'ID / Verification', 'Certification', 'Other');
CREATE TABLE "documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_id" integer NOT NULL REFERENCES "users"("id"),
  "business_id" integer REFERENCES "businesses"("id"),
  "kind" "document_kind" NOT NULL,
  "title" text NOT NULL,
  "file_name" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "blob_pathname" text NOT NULL,
  "notes" text,
  "uploaded_by_id" integer NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "documents_owner_idx" ON "documents" ("owner_id");
