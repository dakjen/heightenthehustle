ALTER TABLE "businesses" ADD COLUMN "demographic_ids" integer[];
UPDATE "businesses" SET "demographic_ids" = ARRAY["demographic_id"] WHERE "demographic_id" IS NOT NULL;
ALTER TABLE "businesses" DROP COLUMN "demographic_id";