# HTH Portal — Phase 3 roadmap

Working order agreed with Dakotah on 2026-09-27. Each sub-phase is meant to ship on its own.

## Now (in progress)
- **3.0 Onboarding + curriculum awareness** (shipped 2026-09-27)
  - Request account → Brevo "we'll reply within 48h" email
  - Admin approves → Brevo welcome email with sign-in link that lands on the intake form
  - Simple, consistent forms (shared components in `src/app/components/form.tsx`)
  - Business setup opens straight into the create form; optional logo upload
  - HTH Class tab for every member: "curriculum cohort opens in January" + join waitlist
  - Admin: create cohorts with a start date, see each cohort's waitlist
  - Home screen checklist: profile, business, intake, waitlist

## In progress (2026-09-28): 3.1 secure documents, 3.4 messaging upgrades, 3.6 resources hub

## Next (in this order)
- **3.1 Secure documents**
  - Private (non-public) uploads incl. W-9s, pitch decks; per-user access; admin review
  - Replaces public blob uploads for anything sensitive
- **3.2 Pitch competition — entrepreneur side**
  - Application intake per competition event, tied to the member's business
  - Required documents checklist, deadlines with countdown, run of show
- **3.3 Pitch competition — admin side**
  - Competition setup (dates, required docs, run of show), budget and sponsorship tracking
  - Participant communication and document sharing; applicant overview
- **3.4 Messaging upgrades**
  - Ongoing support conversations, email notifications for new messages
- **3.5 Scheduling**
  - Book consultations/calls, Zoom links, Google Calendar invites for both parties, time-zone handling
- **3.6 Resources hub**
  - Grants & opportunities, business resources, service-provider deals/discounts
- **3.7 Course delivery**
  - Curriculum content in-platform: cohorts → classes → lessons, progress tracking

## Not in scope
- Judge portal: judging happens in the separate pitch app (`~/Projects/heighten-the-hustle`, hth-pitch). The portal only needs to hand contestant info and decks across; how that hand-off works is decided in 3.3.

## Notes
- Database: single Neon instance (`DATABASE_URL`). Schema changes go through `npm run db:generate` then `npm run db:push`.
- Email: Brevo transactional API via `src/lib/email.ts`. Needs `BREVO_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`.
