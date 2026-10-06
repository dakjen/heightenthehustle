-- Assignments are now real homework cards; remove the duplicated "Due this unit" text from lesson content.
-- Safe to re-run (no-op once removed). Applied by: npm run db:apply
UPDATE "lessons" l
SET "content" = regexp_replace(l."content", E'\\n*## Due this unit\\n[^\\n]*\\n?', '', 'g'),
    "updated_at" = now()
FROM "classes" c
WHERE l."class_id" = c."id"
  AND c."title" = 'Heighten The Hustle™ Core Curriculum'
  AND l."content" LIKE '%## Due this unit%';
