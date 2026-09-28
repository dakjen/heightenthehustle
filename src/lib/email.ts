/**
 * Transactional email via the Brevo REST API (no SDK dependency).
 *
 * Every helper here is fail-safe: `sendEmail` never throws, so callers can
 * `await` it without risking the user-facing action. If Brevo is not
 * configured (missing BREVO_API_KEY or EMAIL_FROM) it warns once and returns
 * `{ sent: false, reason: "not-configured" }`.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_FROM_NAME = "Heighten The Hustle";

/** A recipient as Brevo expects it. */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/** Arguments for {@link sendEmail}. */
export interface SendEmailArgs {
  to: EmailRecipient;
  subject: string;
  html: string;
  /** Plain-text fallback. Optional; Brevo derives one from the HTML if omitted. */
  text?: string;
}

/** Result of {@link sendEmail}. `sent` is false on any failure, never thrown. */
export interface SendEmailResult {
  sent: boolean;
  /** Why the email was not sent, when known. */
  reason?: "not-configured" | "api-error" | "network-error";
  /** Brevo message id on success. */
  messageId?: string;
}

/** A rendered email template. */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

let warnedNotConfigured = false;

/**
 * Base URL of the app with no trailing slash, from NEXT_PUBLIC_APP_URL.
 * Falls back to http://localhost:3000 in local development.
 */
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

/**
 * Send a transactional email through Brevo.
 *
 * Never throws. Returns `{ sent: false }` (with a `reason`) when Brevo is not
 * configured, when the API rejects the request, or when the network call fails.
 * Failures are logged with `console.warn` / `console.error`.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    if (!warnedNotConfigured) {
      console.warn(
        "[email] Brevo is not configured: set BREVO_API_KEY and EMAIL_FROM in your environment. Emails will be skipped."
      );
      warnedNotConfigured = true;
    }
    return { sent: false, reason: "not-configured" };
  }

  const body = {
    sender: { email: fromEmail, name: process.env.EMAIL_FROM_NAME ?? DEFAULT_FROM_NAME },
    to: [to.name ? { email: to.email, name: to.name } : { email: to.email }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Brevo API error ${res.status} sending "${subject}" to ${to.email}: ${detail}`);
      return { sent: false, reason: "api-error" };
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { sent: true, messageId: data.messageId };
  } catch (error) {
    console.error(`[email] Network error sending "${subject}" to ${to.email}:`, error);
    return { sent: false, reason: "network-error" };
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Escape user-supplied text for safe interpolation into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Wrap body HTML in the branded shell: dark header, white card, footer. */
function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2b2b2b;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="background:#2b2b2b;color:#ffffff;padding:20px 28px;font-size:18px;font-weight:700;letter-spacing:0.5px;">
          Heighten The Hustle
        </td>
      </tr>
      <tr>
        <td style="padding:28px;font-size:16px;line-height:1.55;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;font-size:12px;line-height:1.5;color:#777777;border-top:1px solid #eeeeee;">
          You are receiving this email because a portal account was requested with this address.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** A brand-red call-to-action button. */
function button(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#910000;border-radius:6px;">
        <a href="${safeHref}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:700;text-decoration:none;font-size:16px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

/**
 * Email sent immediately after someone submits a portal account request.
 * Lets them know the request was received and that a decision comes within 48 hours.
 */
export function accountRequestedEmail(name: string): EmailTemplate {
  const safeName = escapeHtml(name);
  const subject = "We received your Heighten The Hustle portal request";

  const html = layout(`
    <p style="margin:0 0 16px;">Hi ${safeName},</p>
    <p style="margin:0 0 16px;">Thanks for requesting access to the Heighten The Hustle portal. We received your request.</p>
    <p style="margin:0 0 16px;">We review every request personally and will let you know within <strong>48 hours</strong> whether your account is approved.</p>
    <p style="margin:0;">Talk soon,<br />The Heighten The Hustle team</p>
  `);

  const text = [
    `Hi ${name},`,
    "",
    "Thanks for requesting access to the Heighten The Hustle portal. We received your request.",
    "",
    "We review every request personally and will let you know within 48 hours whether your account is approved.",
    "",
    "Talk soon,",
    "The Heighten The Hustle team",
  ].join("\n");

  return { subject, html, text };
}

/**
 * Email sent when an admin approves an account. Includes a sign-in button
 * (and the raw link) that lands the user on their intake form, the first step.
 */
export function accountApprovedEmail(name: string, link: string): EmailTemplate {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);
  const subject = "Welcome to the HTH portal — your account is approved";

  const html = layout(`
    <p style="margin:0 0 16px;">Hi ${safeName},</p>
    <p style="margin:0 0 16px;">Welcome to Heighten The Hustle! Your portal account has been <strong>approved</strong>.</p>
    <p style="margin:0 0 8px;">Your first step is to sign in and complete your intake form so we can get to know you and your business.</p>
    ${button(link, "Sign in and start your intake form")}
    <p style="margin:0 0 4px;font-size:13px;color:#555555;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="margin:0 0 16px;font-size:13px;word-break:break-all;"><a href="${safeLink}" style="color:#910000;">${safeLink}</a></p>
    <p style="margin:0;">We're glad to have you,<br />The Heighten The Hustle team</p>
  `);

  const text = [
    `Hi ${name},`,
    "",
    "Welcome to Heighten The Hustle! Your portal account has been approved.",
    "",
    "Your first step is to sign in and complete your intake form so we can get to know you and your business:",
    link,
    "",
    "We're glad to have you,",
    "The Heighten The Hustle team",
  ].join("\n");

  return { subject, html, text };
}

/**
 * Email sent when someone receives a new portal message (individual reply or
 * mass message). Shows a preview of the message (first ~300 chars) and a
 * button into the Messages page.
 */
export function newMessageEmail(recipientName: string, senderName: string, content: string, link: string): EmailTemplate {
  const safeName = escapeHtml(recipientName);
  const safeSender = escapeHtml(senderName);
  const trimmed = content.trim();
  const preview = trimmed.length > 300 ? `${trimmed.slice(0, 300).trimEnd()}…` : trimmed;
  const safePreview = escapeHtml(preview).replace(/\n/g, "<br />");
  const subject = `New message from ${senderName} on the HTH portal`;

  const html = layout(`
    <p style="margin:0 0 16px;">Hi ${safeName},</p>
    <p style="margin:0 0 16px;"><strong>${safeSender}</strong> sent you a message on the Heighten The Hustle portal:</p>
    <blockquote style="margin:0 0 16px;padding:14px 18px;border-left:4px solid #910000;background:#f9f9f9;border-radius:6px;color:#2b2b2b;">${safePreview}</blockquote>
    ${button(link, "Open Messages")}
    <p style="margin:0;">The Heighten The Hustle team</p>
  `);

  const text = [
    `Hi ${recipientName},`,
    "",
    `${senderName} sent you a message on the Heighten The Hustle portal:`,
    "",
    preview,
    "",
    `Reply in the portal: ${link}`,
    "",
    "The Heighten The Hustle team",
  ].join("\n");

  return { subject, html, text };
}
