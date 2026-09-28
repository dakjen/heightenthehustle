import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendEmail, appUrl } from "@/lib/email";

/** Minimal branded shell for notification emails. */
export function notifyHtml(title: string, bodyHtml: string, link?: { href: string; label: string }): string {
  const button = link
    ? `<p style="margin:20px 0 8px"><a href="${link.href}" style="display:inline-block;background:#910000;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${link.label}</a></p><p style="color:#666;font-size:12px">${link.href}</p>`
    : "";
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#171717">
  <div style="background:#2b2b2b;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-weight:700;letter-spacing:.04em">Heighten The Hustle</div>
  <div style="background:#fff;border:1px solid #e8e8e8;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <h2 style="margin:0 0 12px;font-size:20px">${title}</h2>
    ${bodyHtml}
    ${button}
  </div></div>`;
}

export function esc(v: string | null | undefined): string {
  return (v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

/** Admins plus team members who can approve requests. Never throws. */
export async function notifyApprovers(subject: string, text: string, html: string): Promise<void> {
  try {
    const approvers = await db.query.users.findMany({
      where: and(
        eq(users.status, "approved"),
        or(eq(users.role, "admin"), and(eq(users.role, "internal"), eq(users.canApproveRequests, true))),
      ),
      columns: { email: true, name: true },
    });
    await Promise.all(approvers.map((a) => sendEmail({ to: { email: a.email, name: a.name }, subject, text, html })));
  } catch (error) {
    console.warn("notifyApprovers failed:", error);
  }
}

/** Every approved member who has not opted out of communications. Never throws. */
export async function notifyMembers(subject: string, text: string, html: string): Promise<number> {
  try {
    const members = await db.query.users.findMany({
      where: and(eq(users.role, "external"), eq(users.status, "approved"), eq(users.isOptedOut, false)),
      columns: { email: true, name: true },
    });
    await Promise.all(members.map((m) => sendEmail({ to: { email: m.email, name: m.name }, subject, text, html })));
    return members.length;
  } catch (error) {
    console.warn("notifyMembers failed:", error);
    return 0;
  }
}

export { appUrl };
