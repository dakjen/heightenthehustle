// Read-only: exports the HTH Core Curriculum (course, lessons, assignments, attachments) as JSON.
// Usage: node scripts/export-curriculum.mjs out.json
import { writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);
const out = process.argv[2] ?? "curriculum.json";
const courses = await sql`select id, title, description, type, syllabus_url, is_published from classes where type = 'hth-course' order by id`;
const result = [];
for (const c of courses) {
  const lessons = await sql`select id, title, summary, content, video_url, duration_minutes, is_published, "order" from lessons where class_id = ${c.id} order by "order"`;
  const assignments = await sql`select id, lesson_id, title, instructions, due_date, points, "order" from assignments where class_id = ${c.id} order by "order", id`;
  const attachments = await sql`select lesson_id, title, file_name, url from course_attachments where class_id = ${c.id} order by title`;
  result.push({ ...c, lessons, assignments, attachments });
}
writeFileSync(out, JSON.stringify(result, null, 2));
console.log(result.map((c) => `${c.title}: ${c.lessons.length} lessons, ${c.assignments.length} assignments, ${c.attachments.length} files`).join("\n"));
