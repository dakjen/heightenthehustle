// Read-only: lists people who appear to have more than one portal account
// (same name, or same phone number). Usage: node scripts/find-duplicate-accounts.mjs
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", quiet: true });
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  select u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at, u.last_login_at,
         (select count(*)::int from businesses b where b.user_id = u.id) as businesses,
         (select count(*)::int from client_intake_forms f where f.user_id = u.id) as intakes
  from users u order by u.id`;
const norm = (s) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const digits = (s) => (s ?? "").replace(/\D/g, "").slice(-10);
const groups = new Map();
const add = (key, r) => { if (!key) return; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(r); };
for (const r of rows) { add("name:" + norm(r.name), r); if (digits(r.phone).length === 10) add("phone:" + digits(r.phone), r); }
const seen = new Set(); const out = [];
for (const [key, list] of groups) {
  if (list.length < 2) continue;
  const ids = list.map((r) => r.id).sort((a, b) => a - b).join(",");
  if (seen.has(ids)) continue; seen.add(ids);
  out.push({ matchedBy: key.split(":")[0], accounts: list });
}
console.log(`${rows.length} accounts total; ${out.length} possible duplicate group(s)\n`);
const d = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "never");
for (const g of out) {
  console.log(`Same ${g.matchedBy}:`);
  for (const r of g.accounts) console.log(`  #${r.id}  ${r.name}  <${r.email}>  ${r.phone}  ${r.role}/${r.status}  created ${d(r.created_at)}  last login ${d(r.last_login_at)}  businesses ${r.businesses}  intakes ${r.intakes}`);
  console.log("");
}
