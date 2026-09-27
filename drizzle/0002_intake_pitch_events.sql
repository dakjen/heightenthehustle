-- Additive: optional multi-select of pitch competition events on the client intake form.
-- Existing rows are untouched (column is nullable, no default).
ALTER TABLE "client_intake_forms" ADD COLUMN IF NOT EXISTS "pitch_event_ids" integer[];
