-- Course templates (uploaded to blob storage) attached to the units that use them. Safe to re-run. Applied by: npm run db:apply

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Customer Journey Template', 'HTH - Customer Journey Template.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_-_Customer_Journey_Template.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2500672, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=1 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Customer Journey Template')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Customer Journey Template', 'HTH - Customer Journey Template.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_-_Customer_Journey_Template.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2500672, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=3 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Customer Journey Template')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Competitive Landscape Analysis Template', 'HTH Competitive Landscape Analysis Template.xlsx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Competitive_Landscape_Analysis_Template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 58682, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=2 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Competitive Landscape Analysis Template')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Business Budget Template (fees, expenses, revenue)', 'HTH Business Budget Template.xlsx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Budget_Template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 54896, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=4 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Business Budget Template (fees, expenses, revenue)')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Business Budget Template (fees, expenses, revenue)', 'HTH Business Budget Template.xlsx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Budget_Template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 54896, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=5 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Business Budget Template (fees, expenses, revenue)')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Business Budget Template (fees, expenses, revenue)', 'HTH Business Budget Template.xlsx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Budget_Template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 54896, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=6 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Business Budget Template (fees, expenses, revenue)')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", NULL, 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."class_id"=c."id" AND a."lesson_id" IS NULL AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=8 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=9 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=10 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=11 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=12 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'Lean Canvas Business Model', 'HTH Lean Canvas- Business Model.pptx', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Lean_Canvas-_Business_Model.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 111982, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=13 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='Lean Canvas Business Model')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", NULL, 'HTH Business Plan Summary', 'HTH Business Plan Summary.pdf', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Plan_Summary.pdf', 'application/pdf', 319325, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."class_id"=c."id" AND a."lesson_id" IS NULL AND a."title"='HTH Business Plan Summary')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'HTH Business Plan Summary', 'HTH Business Plan Summary.pdf', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Plan_Summary.pdf', 'application/pdf', 319325, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=8 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='HTH Business Plan Summary')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'HTH Business Plan Summary', 'HTH Business Plan Summary.pdf', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Plan_Summary.pdf', 'application/pdf', 319325, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=13 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='HTH Business Plan Summary')
;

INSERT INTO "course_attachments" ("class_id","lesson_id","title","file_name","url","content_type","size_bytes","uploaded_by_id")
SELECT c."id", l."id", 'HTH Business Plan Summary', 'HTH Business Plan Summary.pdf', 'https://5qopip590estg1mx.public.blob.vercel-storage.com/course-materials/hth-core/HTH_Business_Plan_Summary.pdf', 'application/pdf', 319325, (SELECT "id" FROM "users" WHERE "role"='admin' ORDER BY "id" LIMIT 1)
FROM "classes" c JOIN "lessons" l ON l."class_id"=c."id" AND l."order"=14 WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "course_attachments" a WHERE a."lesson_id"=l."id" AND a."title"='HTH Business Plan Summary')
;
