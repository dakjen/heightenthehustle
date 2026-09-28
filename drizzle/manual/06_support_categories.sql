-- Reframe support categories around issues and emergencies. Applied by: npm run db:apply
ALTER TYPE "public"."support_category" ADD VALUE IF NOT EXISTS 'Emergency / Urgent Issue';
ALTER TYPE "public"."support_category" ADD VALUE IF NOT EXISTS 'Cash Flow, Payroll or Debt';
ALTER TYPE "public"."support_category" ADD VALUE IF NOT EXISTS 'Landlord, Lease or Property';
ALTER TYPE "public"."support_category" ADD VALUE IF NOT EXISTS 'Customer or Vendor Dispute';
ALTER TYPE "public"."support_category" ADD VALUE IF NOT EXISTS 'Operations & Staffing';
