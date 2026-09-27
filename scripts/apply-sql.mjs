// Applies a .sql file to DATABASE_URL statement by statement.
// Usage: node scripts/apply-sql.mjs drizzle/manual/2026-09-27_cohorts_waitlist.sql
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <path-to-sql-file>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check .env.local)");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const files = statSync(file).isDirectory()
  ? readdirSync(file).filter((f) => f.endsWith(".sql")).sort().map((f) => join(file, f))
  : [file];
const statements = files.flatMap((f) => {
  console.log(`\n== ${f}`);
  return readFileSync(f, "utf8")
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
});

let ok = 0;
for (const statement of statements) {
  try {
    await sql.query(statement);
    ok++;
    console.log("✓", statement.split("\n")[0].slice(0, 80));
  } catch (err) {
    // Already-applied statements are fine to skip.
    if (/already exists/i.test(err.message)) {
      console.log("· skipped (already exists):", statement.split("\n")[0].slice(0, 80));
    } else {
      console.error("✗", statement.split("\n")[0].slice(0, 80));
      console.error("  ", err.message);
      process.exit(1);
    }
  }
}
console.log(`Done. ${ok} statement(s) applied.`);
