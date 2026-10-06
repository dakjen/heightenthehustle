-- Replace the dead "Hustle Harder, Hustle Smarter" YouTube link in Unit 1. Safe to re-run. Applied by: npm run db:apply
UPDATE "lessons" SET "content" = replace("content", 'https://www.youtube.com/watch?v=D_anQf6O0FM', 'https://youtu.be/bTOoY5MIkvM'), "updated_at" = now()
WHERE "content" LIKE '%D_anQf6O0FM%';
