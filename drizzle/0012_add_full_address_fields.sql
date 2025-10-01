-- Migration for adding full address fields to businesses table

ALTER TABLE "businesses" DROP COLUMN IF EXISTS "address";

ALTER TABLE "businesses" ADD COLUMN "street_address" text;
ALTER TABLE "businesses" ADD COLUMN "city" text;
ALTER TABLE "businesses" ADD COLUMN "state" varchar(2);
ALTER TABLE "businesses" ADD COLUMN "zip_code" varchar(10);