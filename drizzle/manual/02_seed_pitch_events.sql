-- HTH pitch competition history. Safe to re-run: skips names that already exist.
-- created_by_id is the first admin account. Apply with: npm run db:apply

-- Remove placeholder rows (only if nothing references them).
DELETE FROM "pitch_competition_events" p
WHERE p."name" IN (
  'Pitch #1',
  'HTH Washington, DC Pitch Competition 2023',
  'HTH Cleveland (CLE) Pitch Competition 2024',
  'HTH Cleveland (CLE) Pitch Competition 2025',
  'HTH Washington, DC Pitch Competition 2025',
  'HTH Cleveland (CLE) Pitch Competition 2026',
  'HTH Washington, DC Pitch Competition 2026'
)
AND NOT EXISTS (SELECT 1 FROM "pitch_submissions" s WHERE s."competition_event_id" = p."id")
AND NOT EXISTS (SELECT 1 FROM "business_to_competition" b WHERE b."competition_event_id" = p."id");

INSERT INTO "pitch_competition_events" ("name", "description", "start_date", "end_date", "created_by_id")
SELECT v.name, v.description, v.start_date::timestamptz, v.start_date::timestamptz,
       (SELECT "id" FROM "users" WHERE "role" = 'admin' ORDER BY "id" LIMIT 1)
FROM (VALUES
  ('2023 MLK Plaza Pitch Competition — Hough, Cleveland (CLE)',
   'Sat., July 15, 2023 · Famicos Multi-Purpose Center, 8555 Hough Ave., Cleveland, OH 44106',
   '2023-07-15 12:00:00-04'),
  ('2024 MLK Plaza Pitch Competition — Hough, Cleveland (CLE)',
   'Sat., Oct. 19, 2024 · DigitalC, 6815 Euclid Ave., Cleveland, OH 44103',
   '2024-10-19 12:00:00-04'),
  ('2025 Deanwood Pitch Competition — Washington, DC',
   'Sat., Sept. 27, 2025 · Dorothy I. Height/Benning Neighborhood Library, 3935 Benning Rd NE, Washington, DC 20019',
   '2025-09-27 12:00:00-04'),
  ('2025 Hough MLK Plaza Pitch Competition — Cleveland (CLE)',
   'Sat., Oct. 25, 2025 · DigitalC / Midtown Tech Hive, 6815 Euclid Ave., Cleveland, OH',
   '2025-10-25 12:00:00-04'),
  ('2026 Deanwood Pitch Competition — Washington, DC',
   'Sat., Sept. 26, 2026 · Marshall Heights Community Development, 3939 Benning Rd NE, Washington, DC 20019',
   '2026-09-26 12:00:00-04'),
  ('2026 Cleveland Pitch Competition — Hough, Cleveland (CLE) (upcoming)',
   'Sat., Oct. 24, 2026 · 9310 Hough Ave., Cleveland, OH',
   '2026-10-24 12:00:00-04')
) AS v(name, description, start_date)
WHERE NOT EXISTS (SELECT 1 FROM "pitch_competition_events" p WHERE p."name" = v.name);
