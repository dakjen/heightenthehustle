-- Curriculum assignments, attached to their units. Safe to re-run. Applied by: npm run db:apply

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #1 — Competitive Landscape', $md$Bring two news articles to class:

1. One that relates to an entrepreneur or a business you admire.
2. One that relates to a business you believe competes with yours.

Then complete the **Competitive Landscape Template** and upload it here.$md$, true, true, true, 1
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 2
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #1 — Competitive Landscape')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #2 — List of Services', $md$Complete the **List of Services Template** for your business and upload it.$md$, true, true, true, 2
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 4
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #2 — List of Services')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #3 — List of Expenses', $md$Complete the **List of Expenses Template** and upload it.$md$, true, true, true, 3
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 5
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #3 — List of Expenses')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #4 — Revenue and Expenses', $md$Complete the **Revenue and Expenses Template**: monthly for 24 months, then annually for the following 8 years. Upload the spreadsheet.$md$, true, true, true, 4
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 6
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #4 — Revenue and Expenses')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #5 — Lean Canvas, Components 1 & 2', $md$Complete **Component #1 (Problem)** and **Component #2 (Customer)** of your Lean Canvas Business Model. Upload the canvas or paste your answers.$md$, true, true, true, 5
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 9
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #5 — Lean Canvas, Components 1 & 2')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #6 — Lean Canvas, Component 3', $md$Complete **Component #3 (Unique Value Proposition)** of your Lean Canvas.$md$, true, true, true, 6
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 10
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #6 — Lean Canvas, Component 3')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #7 — Lean Canvas, Components 4 & 5', $md$Complete **Component #4 (Solution)** and **Component #5 (Key Benefits / Unfair Advantage)** of your Lean Canvas.$md$, true, true, true, 7
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 11
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #7 — Lean Canvas, Components 4 & 5')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #8 — Lean Canvas, Components 6 & 7', $md$Complete **Component #6 (Revenue Streams)** and **Component #7 (Cost Structure)** of your Lean Canvas.$md$, true, true, true, 8
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 12
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #8 — Lean Canvas, Components 6 & 7')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #9 — Lean Canvas, Components 8 & 9', $md$Complete **Component #8 (Key Metrics)** and **Component #9 (Channels)** of your Lean Canvas.$md$, true, true, true, 9
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 13
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #9 — Lean Canvas, Components 8 & 9')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #10 — Business Plan Summary + Full Lean Canvas', $md$Upload your completed **HTH Business Plan Summary Template** and your **complete Lean Canvas Business Model**.$md$, true, true, true, 10
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 14
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #10 — Business Plan Summary + Full Lean Canvas')
;

INSERT INTO "assignments" ("class_id", "lesson_id", "title", "instructions", "allows_text", "allows_file", "is_published", "order")
SELECT c."id", l."id", 'Assignment #11 — Pitch Presentation', $md$Upload your final **pitch presentation (PowerPoint)**. This is the deck you'll present at the Business Plan Pitch.$md$, true, true, true, 11
FROM "classes" c JOIN "lessons" l ON l."class_id" = c."id"
WHERE c."title" = 'Heighten The Hustle™ Core Curriculum' AND l."order" = 16
AND NOT EXISTS (SELECT 1 FROM "assignments" a WHERE a."class_id" = c."id" AND a."title" = 'Assignment #11 — Pitch Presentation')
;
