-- Resources hub. Applied by: npm run db:apply
CREATE TYPE "public"."resource_category" AS ENUM('Grants & Opportunities', 'Business Resources', 'Deals & Discounts');
CREATE TABLE "resources" (
  "id" serial PRIMARY KEY NOT NULL,
  "category" "resource_category" NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "url" text,
  "provider" text,
  "deadline" timestamp with time zone,
  "discount_code" text,
  "amount" text,
  "tags" text[],
  "is_published" boolean DEFAULT true NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "created_by_id" integer NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "resources_category_idx" ON "resources" ("category");
