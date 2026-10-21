// Cohort invitation email. Send a sample:  node scripts/cohort-invite-email.mjs you@example.com
// Edit HERO_IMAGE / PRIZE below; the rest of the copy is in `html` and `text`.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const app = (process.env.NEXT_PUBLIC_APP_URL ?? "https://portal.heightenthehustle.net").replace(/\/$/, "");
const site = "https://portal.heightenthehustle.net";
const HERO_IMAGE = `${site}/hero.jpg`; // swap for the Pexels photo once it's on the site
const PRIZE = "prize money"; // e.g. "a $10,000 prize"

const toEmail = process.argv[2];
if (!toEmail) { console.error("Usage: node scripts/cohort-invite-email.mjs recipient@example.com"); process.exit(1); }
const subject = "Our January cohort is opening — and it ends with the Grand Pitch";
const btn = (href, label) => `<p style="margin:22px 0 10px"><a href="${href}" style="display:inline-block;background:#910000;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">${label}</a></p>`;
const card = (title, body) => `<td width="50%" style="padding:8px;vertical-align:top"><div style="border:1px solid #e8e8e8;border-radius:12px;padding:14px 16px"><div style="font-weight:800">${title}</div><div style="font-size:13px;color:#606060;margin-top:4px">${body}</div></div></td>`;
const step = (n, title, body) => `<td width="33%" style="padding:8px;vertical-align:top"><div style="background:#f6f6f6;border-radius:12px;padding:16px;height:100%"><div style="font-size:26px;font-weight:900;color:#910000">${n}</div><div style="font-weight:700;margin-top:4px">${title}</div><div style="font-size:13px;color:#606060;margin-top:4px">${body}</div></div></td>`;

const html = `<div style="background:#f3f3f3;padding:24px 12px">
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:620px;margin:0 auto;color:#171717;line-height:1.55;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)">
  <div style="background:#2b2b2b"><img src="${HERO_IMAGE}" alt="" width="620" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover" /></div>
  <div style="background:#2b2b2b;color:#fff;padding:26px 28px 30px">
    <img src="${site}/hthlogo.png" alt="Heighten The Hustle" width="96" style="display:block;width:96px;height:auto;margin-bottom:14px" />
    <div style="display:inline-block;background:#910000;color:#fff;font-size:12px;letter-spacing:.2em;text-transform:uppercase;padding:6px 12px;border-radius:999px;font-weight:700">January cohort · waitlist open</div>
    <div style="font-size:34px;font-weight:900;margin-top:14px;line-height:1.05">Elevate your hustle.<br/><span style="color:#ff5c5c">Then pitch it on stage.</span></div>
    <div style="margin-top:10px;color:#d9d9d9;font-size:16px">Sixteen weeks. A finished business plan. A shot at ${PRIZE} at the Grand Pitch.</div>
  </div>

  <div style="padding:28px 28px 8px">
    <p style="margin:0 0 14px">Hi there,</p>
    <p style="margin:0 0 14px">Our next <strong>Heighten The Hustle cohort kicks off in January</strong>, and the waitlist is open now. If you've been running on hustle alone, this is where you put the structure under it.</p>
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 20px"><tr>
    ${step("01", "Know your market", "Your problem, your customer, your competition.")}
    ${step("02", "Know your numbers", "Pricing, expenses and a real revenue forecast.")}
    ${step("03", "Build the plan", "Your Lean Canvas, business plan summary and pitch deck.")}
  </tr></table>
  <div style="padding:8px 28px 0">
    <p style="margin:14px 0">Taught live with a small group of entrepreneurs and built around <em>Hustle Harder, Hustle Smarter</em>. Lessons, videos, templates, homework and instructor feedback all live in the HTH portal.</p>
  </div>

  <div style="padding:6px 28px 0">
    <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#910000;font-weight:800">More than a class</div>
    <div style="font-size:22px;font-weight:900;margin-top:4px;line-height:1.15">The HTH portal is your business HQ</div>
    <p style="margin:8px 0 0;color:#404040">Joining the cohort gets you a seat in the room. A portal account gets you everything else, starting the day you're approved:</p>
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:8px 20px 4px">
    <tr>${card("Resources Hub", "Grants and funding opportunities with deadlines, business tools and guides, and discounts from service providers. New ones land in your inbox.")}${card("Specialized support", "Hit a wall? A lease problem, a contract, a cash-flow crunch, an emergency. Send it in and an HTH advisor works it with you.")}</tr>
    <tr>${card("Direct line to the team", "Message us inside the portal and get a reply, plus a heads-up email so nothing slips.")}${card("Secure document vault", "Your W-9, pitch deck, financials and plans stored privately, ready whenever funding or a competition needs them.")}</tr>
    <tr>${card("Your business profile", "One place for your business details and materials, so we can match you to the right grants, programs and partners.")}${card("The curriculum, on demand", "Every unit, video, template and assignment lives in the portal, with your progress tracked and feedback from your instructor.")}</tr>
  </table>

  <div style="margin:18px 28px;border-left:5px solid #910000;background:#fff5f5;border-radius:0 12px 12px 0;padding:16px 18px">
    <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#910000;font-weight:800">The Grand Pitch</div>
    <p style="margin:8px 0 0">The cohort ends on stage. In fall 2027, cohort graduates pitch their business plans to a panel of judges at the <strong>Grand Pitch</strong>, same format as our Cleveland and DC competitions, <strong>with ${PRIZE} on the line</strong> for the winners.</p>
    <p style="margin:8px 0 0"><strong>Completing the cohort is the only way in.</strong> You have to finish the January cohort to be entered into the running to pitch at the Grand Pitch.</p>
    <p style="margin:8px 0 0">You don't need a polished pitch to join. Building it is what the cohort is for.</p>
  </div>

  <div style="padding:4px 28px 28px">
    <div style="font-weight:800;font-size:17px;margin-top:8px">How to get a seat</div>
    <ol style="padding-left:20px;margin:8px 0 0">
      <li>Request a portal account (two minutes).</li>
      <li>Once approved, open <strong>HTH Class</strong> and join the January waitlist.</li>
      <li>We'll email you when enrollment opens. Seats are limited, first come first served.</li>
    </ol>
    ${btn(app + "/create-account", "Request your portal account →")}
    <p style="font-size:14px;color:#606060;margin:0">Already a member? <a href="${app}/login?next=%2Fdashboard%2Fhth-class" style="color:#910000;font-weight:700">Sign in and join the waitlist</a>.</p>
    <p style="margin-top:24px">Hit reply with any questions. We'd love to see you in January.</p>
    <p style="margin:0">— The Heighten The Hustle team</p>
  </div>
  <div style="background:#2b2b2b;height:6px"></div>
</div>
<p style="font-size:11px;color:#999;text-align:center;margin-top:14px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">You're receiving this because you've connected with Heighten The Hustle or Project Community Capital.</p>
</div>`;

const text = `Heighten The Hustle — January cohort + the Grand Pitch

Our next cohort kicks off in January and the waitlist is open now.

WHAT THE COHORT IS
Sixteen units, taught live with a small group, built around "Hustle Harder, Hustle Smarter": your market, your numbers, your Lean Canvas, business plan summary and pitch deck. Lessons, videos, templates, homework and instructor feedback all live in the HTH portal.

THE HTH PORTAL IS YOUR BUSINESS HQ
- Resources Hub: grants and funding opportunities, business tools, provider discounts. New ones emailed to you.
- Specialized support: lease problems, contracts, cash-flow crunches, emergencies. An HTH advisor works it with you.
- Direct line to the team: message us in the portal, with email alerts.
- Secure document vault: W-9, pitch deck, financials and plans stored privately.
- Your business profile: so we can match you to grants, programs and partners.
- The curriculum on demand: every unit, video, template and assignment, with progress and instructor feedback.

THE GRAND PITCH
In fall 2027, cohort graduates pitch to a panel of judges, same format as our Cleveland and DC competitions, with ${PRIZE} on the line. Completing the January cohort is the only way to be entered into the running to pitch.

HOW TO GET A SEAT
1. Request a portal account: ${app}/create-account
2. Once approved, open HTH Class and join the January waitlist.
3. We'll email you when enrollment opens. Seats are limited.

Already a member? ${app}/login?next=%2Fdashboard%2Fhth-class

— The Heighten The Hustle team`;

const res = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ sender: { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME ?? "Heighten The Hustle" }, to: [{ email: toEmail }], subject: "[SAMPLE] " + subject, htmlContent: html, textContent: text }),
});
console.log(res.status, await res.text());
