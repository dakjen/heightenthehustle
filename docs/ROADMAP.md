# HTH Portal — Phase 3 roadmap

Working order agreed with Dakotah on 2026-09-27. Each sub-phase is meant to ship on its own.

## Now (in progress)
- **3.0 Onboarding + curriculum awareness**
  - Request account → Brevo "we'll reply within 48h" email
  - Admin approves → Brevo welcome email with sign-in link that lands on the intake form
  - Simple, consistent forms (shared components in `src/app/components/form.tsx`)
  - Business setup opens straight into the create form; optional logo upload
  - HTH Class tab for every member: "curriculum cohort opens in January" + join waitlist
  - Admin: create cohorts with a start date, see each cohort's waitlist
  - Home screen checklist: profile, business, intake, waitlist

## Next
- **3.1 Pitch competition — entrepreneur side**
  - Application intake per competition event
  - Pitch-deck upload, required documents, deadlines with countdown, run of show
- **3.2 Pitch competition — admin side**
  - Competition setup, budget and sponsorship tracking
  - Participant communication and document sharing
- **3.3 Judge portal**
  - Judge role, contestant profiles, rubric, decks and supplemental materials
  - In-platform scoring, entrepreneur feedback released after the competition
- **3.4 Messaging upgrades**
  - Mass + individual messages (exists), ongoing support conversations, notifications by email
- **3.5 Scheduling**
  - Book consultations/calls, Zoom links, Google Calendar invites for both parties, time-zone handling
- **3.6 Secure documents**
  - Private (non-public) uploads incl. W-9s, per-user access, admin review
- **3.7 Resources hub**
  - Grants & opportunities, business resources, service-provider deals/discounts
- **3.8 Course delivery**
  - Curriculum content in-platform: cohorts → classes → lessons, progress tracking

## Notes
- Database: single Neon instance (`DATABASE_URL`). Schema changes go through `npm run db:generate` then `npm run db:push`.
- Email: Brevo transactional API via `src/lib/email.ts`. Needs `BREVO_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`.
