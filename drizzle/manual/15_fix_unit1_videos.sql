-- Unit 1 videos: the platform embeds the Napkin Finance and Pharrell videos; the Word doc only had the articles.
-- Safe to re-run. Applied by: npm run db:apply
UPDATE "lessons" SET "content" = replace("content",
  '- [Entrepreneurship](https://napkinfinance.com/napkin/entrepreneur-definition/) — Napkin Finance (watch the video and read the article)',
  '- [Entrepreneurship](https://youtu.be/15H5pFuwL-I) — Napkin Finance (then read the [article](https://napkinfinance.com/napkin/entrepreneur-definition/))'),
  "updated_at" = now()
WHERE "content" LIKE '%napkinfinance.com/napkin/entrepreneur-definition/) — Napkin Finance (watch the video%';

UPDATE "lessons" SET "content" = replace("content",
  '- [12 Inspiring African Entrepreneurs](https://sosmusicmedia.com/music-that-matters/pharrell-williams-entrepreneur) — profiled in Entrepreneur by Pharrell',
  '- [Entrepreneur (Official Video)](https://youtu.be/bTOoY5MIkvM) — Pharrell Williams ft. JAY-Z; [12 inspiring African entrepreneurs profiled in the video](https://sosmusicmedia.com/music-that-matters/pharrell-williams-entrepreneur)'),
  "updated_at" = now()
WHERE "content" LIKE '%sosmusicmedia.com/music-that-matters/pharrell-williams-entrepreneur) — profiled%';
