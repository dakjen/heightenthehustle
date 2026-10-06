// Prints a unit's stored content so we can see exactly what's in the database.
// Usage: node scripts/show-lesson.mjs 1
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const order = Number(process.argv[2] ?? 1);
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  select l.title, l.content from lessons l join classes c on c.id = l.class_id
  where c.title = 'Heighten The Hustle™ Core Curriculum' and l."order" = ${order}`;
if (!rows.length) { console.log("No such unit."); process.exit(0); }
console.log("== " + rows[0].title + " ==\n");
console.log(rows[0].content);
console.log("\n== video links found ==");
for (const m of rows[0].content.matchAll(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^)\s]*/g)) console.log("-", m[0]);
