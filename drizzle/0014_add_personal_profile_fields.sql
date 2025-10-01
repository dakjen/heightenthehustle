-- Migration for adding personal profile fields to users table

ALTER TABLE "users" ADD COLUMN "personal_address" text;
ALTER TABLE "users" ADD COLUMN "personal_city" text;
ALTER TABLE "users" ADD COLUMN "personal_state" varchar(2);
ALTER TABLE "users" ADD COLUMN "personal_zip_code" varchar(10);
ALTER TABLE "users" ADD COLUMN "profile_photo_url" text;