// HTH Business Curriculum: the mini courses and live tracks written by Brittni Hardie and
// Dakotah Jennifer (source: Box, 4.2 | HTH Admin, November 2026). One source for both the
// portal seed (scripts/build-business-curriculum.mjs) and the Word export.
//
// Lesson fields: `teach` / `do` / `leave` render as three sections; `body` renders as one;
// `doNow` adds a "Do this now" step. `teacher` must match a staff account name in the portal.

const BRITTNI = { instructor: "Brittni Hardie", teacher: "Brittni Hardie" };
const DAKOTAH = { instructor: "Dakotah Jennifer", teacher: "PCC Admin" };

const minis = [
  // ───────────────────────────── The Basics ─────────────────────────────
  {
    title: "Getting Comfortable with Your Device",
    group: "The Basics — Start Here",
    kind: "Mini course",
    type: "pre-course",
    ...BRITTNI,
    minutes: 60,
    description:
      "Part of **The Basics — Start Here**. A hands-on introduction to your computer and phone: finding your way around, managing files, getting online, and filling out forms. Every lesson is show, follow along, then try it yourself.",
    lessons: [
      {
        title: "Understanding Your Computer and Phone",
        summary: "Hardware vs. software, the parts of your device, and the difference between an operating system, an app, and a website.",
        teach: "Hardware versus software, the common parts of a device, and the difference between an operating system, an application, and a website.",
        do: "Identify the parts of your own device, open applications, adjust the volume and display settings, and practice restarting safely.",
        leave: "You can find your way around your device and describe a basic technology problem when you need help.",
      },
      {
        title: "Mouse, Keyboard, and Everyday Shortcuts",
        summary: "Clicking, scrolling, dragging, selecting text, and the shortcuts you will use every day.",
        teach: "Clicking, scrolling, dragging, selecting text, and the shortcuts for copying, pasting, undoing, and saving, including the Mac equivalents.",
        do: "Edit a short document and move between open applications.",
        leave: "A shortcut reference sheet and more confidence with everyday tasks.",
      },
      {
        title: "Files, Folders, and Storage",
        summary: "File names, file types, downloads, and where your files actually live.",
        teach: "File names, common file types, downloads, and the difference between local storage and cloud storage.",
        do: "Create a business folder, download a sample document, rename it, move it, and find it again.",
        leave: "An organized folder structure you can reuse for your business records.",
      },
      {
        title: "Getting Connected and Navigating the Internet",
        summary: "Wi-Fi, browser tabs, and the difference between a search engine and a web address.",
        teach: "How to connect to Wi-Fi, recognize connection problems, use browser tabs, and tell a search engine from a web address.",
        do: "Connect to an approved network, find a business resource online, bookmark it, and download a sample form.",
        leave: "You can reach online resources and troubleshoot basic connection issues on your own.",
      },
      {
        title: "Online Forms and Submitting Documents",
        summary: "Completing an online application, uploading a document, and confirming it went through.",
        teach: "How online applications work, with a short refresher on attachments and downloads. (Email and Google Drive are covered in depth in *Email & Google Drive Essentials*.)",
        do: "Complete a practice business application, upload a sample document, and verify that the submission was successful.",
        leave: "You can complete common online applications independently.",
      },
    ],
  },
  {
    title: "Email & Google Drive Essentials",
    group: "The Basics — Start Here",
    kind: "Mini course",
    type: "pre-course",
    ...DAKOTAH,
    description:
      "Part of **The Basics — Start Here**. Set up a professional business email, keep your inbox under control, and build a filing system in Google Drive so you can find anything in ten seconds.",
    lessons: [
      {
        title: "Set Up Gmail",
        summary: "A dedicated business Gmail with 2-step verification and a signature.",
        body: "Create a dedicated business Gmail — professional address, close to your business name, no nicknames or numbers. Turn on 2-step verification, add recovery info, and set a signature with your name, business, and phone so every email carries your contact info automatically.",
      },
      {
        title: "Send and Organize Email",
        summary: "Emails that get read and answered, and an inbox that files itself.",
        body: "A business email’s job is to get read and get answered: a subject line that says what it’s about, the point in the first two lines, a clear next step at the end. Then organize with three tools — archive what’s done, star what needs action, label by category (Clients, Money, Receipts) — and set filters so Gmail files recurring senders automatically.",
      },
      {
        title: "Build Your Drive Filing System",
        summary: "One master business folder, five drawers, and a file-naming rule that sorts itself.",
        body: "Drive is your filing cabinet. Build the drawers before you upload. One master business folder containing:\n\n- **01 Clients** (a folder per client)\n- **02 Money** (invoices, receipts, taxes — by year)\n- **03 Legal & Admin**\n- **04 Marketing**\n- **05 Operations**\n\nName every file *Date — What — Who* (“2026-03 Invoice 004 — Johnson”) so it sorts itself and you can find anything in ten seconds. New file arrives? It goes in Drive, named, that day.",
      },
    ],
  },
  {
    title: "AI Basics for Business",
    group: "The Basics — Start Here",
    kind: "Mini course",
    type: "pre-course",
    ...DAKOTAH,
    description:
      "Part of **The Basics — Start Here**. What AI tools like ChatGPT and Claude are, how to ask for what you need, where they pay off in a small business, how to use them safely, and how to build your core business documents with AI doing the first draft.",
    lessons: [
      {
        title: "What AI Is",
        summary: "A fast, eager assistant whose work you review — not a source of truth.",
        body: "Tools like ChatGPT and Claude are programs that learned the patterns in human writing — they’re excellent at anything involving words (drafting, rewriting, summarizing, brainstorming) and they can be confidently wrong. Treat AI like a fast, eager assistant whose work you review, not a source of truth. Free versions are plenty to start.",
        doNow: "Create a free account on one tool and ask it one real question about your business.",
      },
      {
        title: "How to Ask for What You Need",
        summary: "Context, a specific task, and a format — then refine.",
        body: "Talk to it like a smart new employee on day one: give context (“I run a cleaning business in Baltimore”), a specific task (“write a short, friendly text offering past clients 15% off a spring deep-clean”), and a format (“under 50 words, three options”). Then treat the first answer as a first draft — reply, refine, redirect. The back-and-forth is free.",
        doNow: "Draft a real text to a real client with AI, then edit it until it sounds like you — and send it.",
      },
      {
        title: "Using It in Your Business",
        summary: "AI does the blank-page 80%. You do the final 20%.",
        body: "The highest-payoff uses: first drafts of writing you already have to do (client emails, service descriptions, social posts), thinking through decisions (ask for pros, cons, and the questions you should be asking), explaining jargon in plain English, and summarizing anything long. AI does the blank-page 80% and you do the final 20%, where your facts, judgment, and voice live.",
        doNow: "Paste in a decision you’re weighing and ask for the pros, cons, and the questions you haven’t thought of.",
      },
      {
        title: "Using It Safely",
        summary: "Four rules that keep your customers, your money, and your name protected.",
        body: "Four rules:\n\n1. Never paste in what you wouldn’t put on a postcard — no customer data, banking info, or passwords.\n2. Verify anything that matters against a real source. AI is not your lawyer or accountant.\n3. Never send AI-written text you haven’t read, because it goes out under your name.\n4. Never pass along unchecked AI “facts” in applications or client documents.",
        doNow: "Ask AI a factual question about your industry, then verify its answer against a real source — notice what it got right and wrong.",
      },
      {
        title: "Making Business Documents",
        summary: "Template for the bones, AI for the first draft, you for the facts and the voice, PDF out the door.",
        body: "Every business needs a handful of professional documents, and AI plus Google Docs or Word gets you all of them.\n\n**The formatting basics apply to everything:** real headings (not just bold text), one clean font, consistent spacing, and always send as PDF — a PDF looks the same on every device and a Doc file doesn’t. Start from an HTH template instead of a blank page whenever one exists. AI fills in the words and the template handles the look.\n\n**The documents to build:**\n\n- **A business letter on your letterhead.** Tell AI who it’s to, what it’s about, and the tone. It drafts, you fix.\n- **A flyer.** AI writes the headline and the short punchy lines. You drop them into a template with your photo and contact info.\n- **A one-page business overview.** The leave-behind with who you are, what you offer, and how to reach you. AI structures it from your rambling description.\n- **Service descriptions.** Two or three sentences per service, clear enough that a stranger knows what they’re buying. Paste your service list into AI and ask for plain-English descriptions, then make them true.\n\nThe pattern every time: template for the bones, AI for the first draft, you for the facts and the voice, PDF out the door.",
        doNow: "Pick the document your business is missing most and build it — template, AI draft, your edit, PDF.",
      },
    ],
  },
  {
    title: "Staying Safe Online",
    group: "The Basics — Start Here",
    kind: "Mini course",
    type: "pre-course",
    ...BRITTNI,
    minutes: 60,
    description:
      "Part of **The Basics — Start Here**. Protect your accounts, your money, your devices, and your reputation. All practice uses demonstration accounts and fictional data — you never share a real password in class.",
    lessons: [
      {
        title: "Passwords and Two-Step Verification",
        summary: "Long, unique passwords, password managers, and a second lock on every account.",
        teach: "Why passwords should be long and unique, how password managers help, and why two-step verification matters.",
        do: "Create sample passphrases and practice turning on verification on a demonstration account, including how to store recovery codes securely.",
        leave: "A checklist for securing your own accounts — without ever sharing a password in class.",
      },
      {
        title: "Recognizing Scams and Phishing",
        summary: "Fake emails, texts, job offers, QR codes, and invoices — and how to spot them.",
        teach: "Realistic examples of fraudulent emails, text messages, job offers, QR codes, and fake invoices.",
        do: "Examine simulated messages, identify the warning signs, and practice verifying a request using contact information you looked up yourself.",
        leave: "A simple routine: stop, verify, and report before you respond or click.",
      },
      {
        title: "Protecting Your Money Online",
        summary: "Safe shopping, payment app scams, fake invoices, and gift card requests.",
        teach: "Safe online shopping, payment app scams, fraudulent business invoices, and requests for gift cards or verification codes.",
        do: "Work through fictional payment scenarios and decide which transactions need extra verification.",
        leave: "You know how to verify a payment request, turn on transaction alerts, and contact your bank promptly if fraud happens.",
      },
      {
        title: "Keeping Devices Secure",
        summary: "Updates, screen locks, trusted apps, backups, and public Wi-Fi.",
        teach: "Software updates, screen locks, trusted app sources, backups, and safe use of shared devices and public Wi-Fi.",
        do: "Find your device’s security settings, review app permissions, and practice backing up a non-sensitive file.",
        leave: "A practical device security checklist.",
      },
      {
        title: "Social Media Privacy and Responding to Incidents",
        summary: "Privacy settings, impersonation, and what to do if an account is compromised.",
        teach: "Privacy settings, location sharing, impersonation, and keeping personal and business information separate.",
        do: "Review the privacy settings on a demonstration or personal account and work through a simulated account compromise.",
        leave: "You know how to limit public exposure, recover an account through official channels, and report suspicious activity.",
      },
    ],
  },

  // ─────────────────── Track 1 mini course (Brittni) ───────────────────
  {
    title: "Presentations: PowerPoint & Google Slides Basics",
    group: "Track 1 — Pitch & Sell Your Business",
    kind: "Mini course",
    type: "hth-course",
    ...BRITTNI,
    minutes: 60,
    description:
      "A mini course inside **Track 1 — Pitch & Sell Your Business**. How to operate presentation software and build clean, readable slides. This course covers the technical side. Pitch strategy and delivery are covered separately.",
    lessons: [
      {
        title: "Getting Started with PowerPoint",
        summary: "The interface, slide layouts, text boxes, and editing vs. presenting.",
        teach: "The PowerPoint interface, slide layouts, text boxes, and the difference between editing and presenting.",
        do: "Create, save, and reopen a short presentation, then practice adding and rearranging slides.",
        leave: "You are comfortable navigating the software.",
      },
      {
        title: "Creating Clean, Readable Slides",
        summary: "Consistent fonts and colors, strong contrast, and one main idea per slide.",
        teach: "Consistent fonts and colors, strong contrast, alignment, and limiting each slide to one main idea.",
        do: "Redesign a cluttered example slide and compare the results.",
        leave: "A practical set of design rules you can apply to any presentation.",
      },
      {
        title: "Working with Images and Visuals",
        summary: "Inserting and resizing images, simple shapes and charts, and using images you have permission to use.",
        teach: "Inserting and resizing images without distortion, adding simple shapes and charts, and using images you have permission to use.",
        do: "Insert a business-related image and a chart from your spreadsheet activity.",
        leave: "You can communicate information visually instead of relying entirely on text.",
      },
      {
        title: "Building a Five-Slide Presentation",
        summary: "A simple business introduction: title, overview, product or service, visual, and close.",
        teach: "Technical execution and visual consistency across a short deck. Investor messaging and pitch strategy are covered separately.",
        do: "Build a five-slide business introduction: a title, an overview, a product or service description, a supporting visual, and a closing slide.",
        leave: "An editable presentation you can build on.",
      },
      {
        title: "Presenting and Sharing Your Work",
        summary: "Slideshow mode, presenter notes, transitions, and exporting to PDF.",
        teach: "Slideshow mode, presenter notes, basic transitions, and exporting to PDF.",
        do: "Deliver a brief practice presentation, get feedback on readability and technical execution, and save both an editable version and a PDF.",
        leave: "You can operate PowerPoint independently and share your work professionally.",
      },
    ],
  },

  // ─────────────────────── Track 2 (Dakotah) ───────────────────────
  {
    title: "Getting Paid & Staying Paid",
    group: "Track 2 — Getting Paid & Staying Paid",
    kind: "Live track",
    type: "hth-course",
    ...DAKOTAH,
    description:
      "**Track 2**, live and instructor-led. Know whether you actually made money, track it simply, invoice like a professional, get set up on QuickBooks, and get paid faster.\n\nMini courses inside this track: *QuickBooks Essentials* and *Spreadsheets for Your Business*.",
    lessons: [
      {
        title: "Income vs. Expenses",
        summary: "Did you make money last month — not “did money come in.”",
        body: "The question most owners can’t answer: did you make money last month — not “did money come in.” Everyone lists their real last 30 days (the forgotten subscriptions always surface), calculates rough profit on the spot, and leaves with the separation rule: one business bank account, starting now.",
      },
      {
        title: "Simple Money Tracker",
        summary: "Build a Google Sheets tracker live and enter your real last two weeks.",
        body: "Everyone builds a Google Sheets tracker live — date, what, who, money in, money out, running total (first formula, written together) — and enters their real last two weeks from their bank app. Habit set before leaving: ten minutes, same day weekly, reminder on. Simple survives and fancy gets abandoned.\n\nThe tracker is the starter system: when you move to QuickBooks in Session 4, it takes over and the sheet retires — you run one system, never both.",
      },
      {
        title: "Professional Invoice",
        summary: "A finished invoice template with every element that gets you paid.",
        body: "Built live from a template with every element that gets you paid: both parties’ info, invoice number (start at 1001), itemized work, total, a real due date (never blank), and exactly how to pay — if paying you requires a question, you get paid later. Everyone leaves with their finished template, and most send a real one before the session ends.\n\nUse this template until you’re set up on QuickBooks — then switch to invoicing from QuickBooks and retire the template, continuing the same number sequence so you never run two invoice systems at once.",
      },
      {
        title: "QuickBooks Fast Version",
        summary: "The five features that matter, done together. Leave with a live connected account.",
        body: "The five features that matter, done together at speed: create the account, connect the bank, fix the key settings, add your main services with prices, categorize the first batch of real transactions. Send one invoice inside QuickBooks to see the full loop. Everyone leaves with a live connected account — not a plan to make one.",
      },
      {
        title: "Getting Paid Faster",
        summary: "Ways to accept money, how to prevent late payment, and the follow-up ladder.",
        body: "**First, set up the ways to actually accept money** — everyone picks and sets up at least one in session.\n\n- **Zelle** is free, bank-to-bank, and instant (best for clients you know).\n- **Cash App and Venmo business accounts** are familiar to customers but take a cut of each payment.\n- **Square, Stripe, or QuickBooks Payments** let you accept cards and look most professional, for roughly 3% per transaction.\n\nThe rule: the fee is the cost of getting paid *now* — a 3% fee beats a 30-day wait — but know each fee before you choose, and put your payment details on every invoice.\n\n**Then prevention:** deposits on larger jobs, terms agreed before work starts, invoice the day the work ends.\n\n**Then the follow-up ladder,** with scripts personalized in session — friendly nudge at 3 days, direct check-in at 2 weeks, firm final notice at 30. Saved as email templates, ready the day an invoice goes overdue. Polite and relentless gets paid.",
      },
    ],
  },
  {
    title: "QuickBooks Essentials",
    group: "Track 2 — Getting Paid & Staying Paid",
    kind: "Mini course",
    type: "hth-course",
    ...DAKOTAH,
    description:
      "A mini course inside **Track 2 — Getting Paid & Staying Paid**. Set up QuickBooks Online, keep the books current in fifteen minutes a week, handle taxes and paying yourself, and read your profit and loss report.\n\nNote: QuickBooks is a paid subscription. Check current pricing, start with the free trial, and ask whether a program discount is available.",
    lessons: [
      {
        title: "Money In, Money Out",
        summary: "What bookkeeping actually is, and the first rule: a separate business bank account.",
        body: "Bookkeeping is writing down every dollar in (income) and out (expenses) in categories that mean something — and the gap between them, profit, is the number your business lives on. Categorized expenses are tax deductions and forgotten ones are donations to the IRS. First rule: a separate bank account for the business, so every transaction in it is a business transaction by definition.",
      },
      {
        title: "Setup",
        summary: "QuickBooks Online Simple Start, with your bank account connected.",
        body: "QuickBooks Online Simple Start is enough to begin. QuickBooks is a paid subscription — check current pricing and start with the free trial (and ask whether a program discount is available).\n\nThe one step that matters most: connect your business bank account so transactions import automatically — your job becomes labeling them, not typing them. Check your business name, logo, and invoice numbering (start at 1001).",
      },
      {
        title: "Chart of Accounts",
        summary: "The category list your money sorts into. Keep it short.",
        body: "It’s just the category list your money sorts into. Keep it short — 10–15 expense categories that match how your business actually works. The test: do report lines answer questions you’d actually act on? Add or rename anytime, and let real transactions tell you what’s missing.",
      },
      {
        title: "Products, Services & Business Lines",
        summary: "List everything you sell with a price, and keep each line of business separate.",
        body: "List everything you sell with a price. Invoicing gets fast (pick the service, price fills in) and reports get smart (which service actually makes money?).\n\nRun multiple lines of business? Keep their income separate — on Simple Start that means a separate income account per line (the Classes feature that tags transactions by line requires a higher-tier plan), and that’s enough to answer “which part is working?”",
      },
      {
        title: "Recording Transactions",
        summary: "Weekly, same day, fifteen minutes.",
        body: "Weekly, same day, fifteen minutes: open the Banking tab, confirm or fix each imported transaction’s category, add it. QuickBooks learns your patterns as you go. Send invoices from inside QuickBooks so payments match to invoices and you always know who hasn’t paid. Photograph big receipts in the mobile app.",
      },
      {
        title: "Reconciling",
        summary: "Once a month, prove the books are right.",
        body: "Weekly categorizing keeps the books current, and monthly reconciling proves they’re *right*. Once a month, match QuickBooks against your actual bank statement (Reconcile, under the gear menu): same starting balance, same ending balance, every transaction accounted for. Fifteen minutes that catches duplicates, missed charges, and bank errors — and means your reports can be trusted.",
      },
      {
        title: "Taxes",
        summary: "Tax money was never yours. Set it aside on arrival.",
        body: "Nobody withholds taxes for you now — that’s the money mistake that hurts self-employed people most. The fix is mechanical: every time you get paid, move 25–30% into a separate tax savings account before you touch the rest.\n\nThe IRS also expects self-employed people to pay quarterly estimated taxes, not one bill in April — your P&L tells you your profit, and a tax professional (or last year’s return) tells you what to send each quarter. The habit is the lesson: tax money was never yours, so set it aside on arrival.",
      },
      {
        title: "Paying Yourself",
        summary: "Owner’s draw, on a schedule, like a paycheck.",
        body: "The question every new owner asks. As a sole proprietor or single-owner LLC, you pay yourself with an owner’s draw — transfer money from the business account to your personal account and record it as a draw, not an expense (it doesn’t reduce your profit, and you still owe taxes on profit whether you draw it or not).\n\nPayroll with a real paycheck comes later, mainly if you elect S-corp status — a decision to make with a tax professional. Either way: pay yourself the same amount on the same schedule, like a paycheck, instead of raiding the account when you need money.",
      },
      {
        title: "Reading a P&L",
        summary: "Three questions to ask every month, then one decision.",
        body: "Income on top, expenses in the middle, profit at the bottom. Monthly, ask three questions:\n\n1. Did I make money?\n2. Where did it go (any surprises in the categories)?\n3. What changed vs. last month?\n\nThen make one decision based on the answer. That’s running your business on numbers instead of vibes.",
      },
    ],
  },
  {
    title: "Spreadsheets for Your Business",
    group: "Track 2 — Getting Paid & Staying Paid",
    kind: "Mini course",
    type: "hth-course",
    ...BRITTNI,
    minutes: 60,
    description:
      "A mini course inside **Track 2 — Getting Paid & Staying Paid** (also used in Track 4 for “Know Your Numbers”). Excel and Google Sheets from your first spreadsheet to a reusable monthly budget tracker. Concepts are taught in one platform first, then shown in the other.",
    lessons: [
      {
        title: "Creating Your First Spreadsheet",
        summary: "Rows, columns, cells, worksheets, and entering and editing data.",
        teach: "An introduction to Excel and Google Sheets: rows, columns, cells, worksheets, and how to enter and edit data.",
        do: "Create a simple business expense list, save it, and reopen it.",
        leave: "A working spreadsheet and an understanding of how information is organized.",
      },
      {
        title: "Organizing and Formatting Data",
        summary: "Headings, currency and date formats, sorting, and filtering.",
        teach: "Headings, currency and date formats, column widths, sorting, and filtering. Two rules: one row per transaction, and sort the entire table rather than a single column.",
        do: "Organize a sample transaction list and filter it by category.",
        leave: "A clean, readable expense record.",
      },
      {
        title: "Using Basic Formulas",
        summary: "SUM, AVERAGE, and basic subtraction and multiplication.",
        teach: "How formulas begin with an equals sign, how cell references work, and how to use SUM, AVERAGE, and basic subtraction and multiplication.",
        do: "Calculate sales totals, expenses, and remaining income using sample business data.",
        leave: "You can create and check formulas instead of calculating every total by hand.",
      },
      {
        title: "Building a Monthly Budget Tracker",
        summary: "Planned vs. actual income and expenses, category totals, and a remaining balance.",
        teach: "How to copy formulas, check totals, and read the difference between planned and actual spending.",
        do: "Create a tracker with planned and actual income and expenses, category totals, and a remaining balance.",
        leave: "A reusable budget template you can update each month.",
      },
      {
        title: "Charts, Sharing, and Maintaining Records",
        summary: "A simple chart, a new sheet for each month, and sharing with the right permissions.",
        teach: "How to create a simple chart from expense totals, duplicate a worksheet for a new month, and share a spreadsheet with the right viewing or editing permissions.",
        do: "Complete each of these with your budget tracker and export a copy.",
        leave: "You can maintain and communicate basic business financial information without exposing sensitive records.",
      },
    ],
  },

  // ─────────────────────── Track 3 (Dakotah) ───────────────────────
  {
    title: "Your Online Business Presence",
    group: "Track 3 — Your Online Business Presence",
    kind: "Live track",
    type: "hth-course",
    ...DAKOTAH,
    description:
      "**Track 3**, live and instructor-led. By the end, everything a stranger finds when they search for you says real business, real professional.\n\nMini course inside this track: *Working Online Like a Pro*.",
    lessons: [
      {
        title: "LinkedIn Profile",
        summary: "A finished profile, built live.",
        body: "Finished live: a clear headshot (taken in session if needed), a headline that says what you do for whom — not just a title — a three-paragraph About drafted together, business listed under Experience, custom URL and contact info visible. Staying visible after: comment thoughtfully twice a week, and you never have to post.",
      },
      {
        title: "Google Business Profile",
        summary: "Get on the map for free, and start the review engine.",
        body: "Get on the map for free: set up or claim the profile, pick the right category (it decides which searches you appear in), add hours, phone, service area — and start verification in session so it actually happens.\n\nThen the winning extras: real work photos, services listed, and the review engine — everyone drafts the review-ask text and sends it to two past customers before leaving. Reply to every review, because future customers read the replies.",
      },
      {
        title: "Your Home Base",
        summary: "One page, one link, used everywhere.",
        body: "Your Google profile, social bios, and email signature all need one link to point to — a home base. A full website can wait. A free one-page site or link page (Google Sites, Canva, or a link-in-bio page) built in session is enough: who you are, what you do, how to book, your reviews link. One page, one link, used everywhere — consistent and done.",
      },
      {
        title: "Social Media for Business",
        summary: "One platform done well, and your first month planned.",
        body: "One platform, chosen for your business (visual trades → Instagram, local services → Facebook, B2B → LinkedIn) — one done well beats two done badly. Set up the account with a bio that’s a storefront sign (what, where, how to book), then build the first month live on a simple weekly rotation: a finished job (before/after wins for service businesses), a tip, something about you, a review. Phone photos are fine. The bar: when a customer checks, you look current and competent.",
      },
      {
        title: "Email Like a Professional",
        summary: "The address, the signature, the writing, and templates for the hard ones.",
        body: "Three upgrades: the address (no more sparklequeen2004@ — fixed today), the signature (name, business, phone, one link — built in session), and the writing (point in the subject line, ask in the first two lines, one topic, clear next step).\n\nPlus saved templates for the hard ones: the unhappy-customer reply (acknowledge, own it, offer the fix — never argue in writing), the quote that protects your scope, and the polite no.",
      },
      {
        title: "Your Digital Reputation",
        summary: "We Google everyone, live — then fix what customers see.",
        body: "We Google everyone, live — that’s what customers see. Then three fixes:\n\n1. **Consistency.** Name, phone, and hours matching everywhere, with a one-page master-info doc to copy from forever.\n2. **Reviews as a standing habit.** And the bad-review playbook: respond once, professionally, take it offline.\n3. **A Google Alert on your business name,** so you hear about mentions automatically.\n\nClose by re-running the search: everything a stranger now finds says real business, real professional.",
      },
    ],
  },
  {
    title: "Working Online Like a Pro",
    group: "Track 3 — Your Online Business Presence",
    kind: "Mini course",
    type: "hth-course",
    ...DAKOTAH,
    description:
      "A mini course inside **Track 3 — Your Online Business Presence** (also used in Track 4 for the 90-day plan). Gmail beyond the basics, sharing and collaborating in Drive, Google Calendar, and running your business from your phone.",
    lessons: [
      {
        title: "Gmail Beyond the Basics",
        summary: "Templates, schedule-send, undo-send, and snooze.",
        body: "Templates for any email you write twice a month, schedule-send so Sunday-night work arrives Monday at 8:30, undo-send set to 30 seconds, and snooze so your inbox only shows *now* things. Have a custom-domain address? Connect it to Gmail and send from it inside the tools you already know.",
      },
      {
        title: "Sharing & Collaborating",
        summary: "One live file instead of attachment ping-pong.",
        body: "One file, in Drive, instead of attachment ping-pong. Share with specific people and give the lowest permission that works — Viewer looks, Commenter suggests, Editor changes (a client reviewing a proposal is a Commenter). Everyone works in the same live file with automatic saving and full version history. Share the folder, not file-by-file.",
      },
      {
        title: "Google Calendar",
        summary: "If it matters, it has a time slot.",
        body: "If it matters, it has a time slot — including the admin work itself (“Friday 9–11: invoices”), not just appointments. Addresses in the location field so your phone navigates, reminders set by default, color-code by type. For meetings, send real invites — an accepted invite is a commitment, and a “see you Tuesday” text is a hope.",
      },
      {
        title: "Your Business in Your Pocket",
        summary: "Your phone as a branch office — with a boundary.",
        body: "Gmail, Drive, Calendar, and Docs on your phone make it a branch office. Drive’s + → Scan turns receipts and signed paperwork into filed PDFs (goodbye scanner). Attach from Drive anywhere, navigate from Calendar, mark key files available offline. And a boundary: being able to answer at 9pm isn’t an obligation to.",
      },
    ],
  },
];

// ───────────── Supplementary courses: the mini courses above become units ─────────────
// Lesson fields are unchanged. Each unit keeps its own instructor.
const unit = (name, miniTitle, over = {}) => {
  const m = minis.find((x) => x.title === miniTitle);
  if (!m) throw new Error(`No mini course "${miniTitle}"`);
  return { name, instructor: m.instructor, minutes: m.minutes, intro: m.description, lessons: m.lessons, ...over };
};

const WORD_UNIT = {
  name: "Word",
  instructor: "Brittni Hardie",
  minutes: 60,
  lessons: [
    {
      title: "Word: Getting Started",
      summary: "Open Word, type a document, format it properly, and save it.",
      teach: "Opening Word, typing a document, changing the font, and saving. The formatting basics that apply to every business document: real headings (not just bold text), one clean font, and consistent spacing.",
      do: "Create and save a formatted one-page Word document about your business.",
      leave: "A formatted one-page document, and the formatting habits you will use in everything you write.",
      note: "New lesson, written from the Module Library card (Brittni) and Dakotah's document formatting basics.",
    },
    {
      title: "Word: Start from a Template",
      summary: "Letters and flyers that are already designed — you fill in the words.",
      teach: "Finding and opening a template, replacing the placeholder text, and saving as PDF. Start from an HTH template instead of a blank page whenever one exists: the template handles the look. Always send as PDF, because a PDF looks the same on every device.",
      do: "Open a letter template, personalize it for your business, and save it as both an editable file and a PDF.",
      leave: "A business letter on your own letterhead, ready to reuse.",
      note: "New lesson, written from the Module Library card (Brittni) and Dakotah's Making Business Documents.",
    },
  ],
};

export const courses = [
  {
    title: "The Basics — Start Here",
    teacher: "PCC Admin",
    description:
      "Supplementary course. Four short units that get you comfortable with the tools everything else is built on. Take the whole thing in order, or jump to the unit you need.\n\n1. **Getting Comfortable with Your Device** — Brittni Hardie\n2. **Email & Google Drive Essentials** — Dakotah Jennifer\n3. **AI Basics for Business** — Dakotah Jennifer\n4. **Staying Safe Online** — Brittni Hardie",
    units: [
      unit("Getting Comfortable with Your Device", "Getting Comfortable with Your Device"),
      unit("Email & Google Drive Essentials", "Email & Google Drive Essentials"),
      unit("AI Basics for Business", "AI Basics for Business"),
      unit("Staying Safe Online", "Staying Safe Online"),
    ],
  },
  {
    title: "Microsoft Essentials",
    teacher: "Brittni Hardie",
    description:
      "Supplementary course. Word, Excel, and PowerPoint for your business, with the Google Sheets and Google Slides equivalents shown alongside. You will leave with a business letter, a monthly budget tracker, and a five-slide presentation.\n\n1. **Word** — Brittni Hardie\n2. **Spreadsheets for Your Business** (Excel & Google Sheets) — Brittni Hardie\n3. **Presentations** (PowerPoint & Google Slides) — Brittni Hardie",
    units: [
      WORD_UNIT,
      unit("Spreadsheets for Your Business", "Spreadsheets for Your Business"),
      unit("Presentations", "Presentations: PowerPoint & Google Slides Basics"),
    ],
  },
  {
    title: "Getting Paid & Staying Paid",
    teacher: "PCC Admin",
    description:
      "Supplementary course. Know whether you actually made money, track it simply, invoice like a professional, and get paid faster — then set up QuickBooks and keep the books in fifteen minutes a week.\n\n1. **Live Sessions** — Dakotah Jennifer\n2. **QuickBooks Essentials** — Dakotah Jennifer\n\nThe spreadsheet skills used here are taught in *Microsoft Essentials*, in the Spreadsheets for Your Business unit.",
    units: [
      unit("Live Sessions", "Getting Paid & Staying Paid", { intro: undefined }),
      unit("QuickBooks Essentials", "QuickBooks Essentials"),
    ],
  },
  {
    title: "Your Online Business Presence",
    teacher: "PCC Admin",
    description:
      "Supplementary course. By the end, everything a stranger finds when they search for you says real business, real professional.\n\n1. **Live Sessions** — Dakotah Jennifer\n2. **Working Online Like a Pro** — Dakotah Jennifer",
    units: [
      unit("Live Sessions", "Your Online Business Presence", { intro: undefined }),
      unit("Working Online Like a Pro", "Working Online Like a Pro"),
    ],
  },
];

// Standalone courses created by the first version of this seed. They are now units above.
export const retired = [
  "Getting Comfortable with Your Device", "Email & Google Drive Essentials", "AI Basics for Business", "Staying Safe Online",
  "Presentations: PowerPoint & Google Slides Basics", "QuickBooks Essentials", "Spreadsheets for Your Business", "Working Online Like a Pro",
  "Google Essentials", "Business Money Basics", "Look Professional: Email, Documents & Slides",
];

export function lessonMarkdown(l) {
  const parts = [];
  if (l.body) parts.push(l.body);
  if (l.teach) parts.push(`## What we cover\n\n${l.teach}`);
  if (l.do) parts.push(`## What you'll do\n\n${l.do}`);
  if (l.leave) parts.push(`## What you'll walk away with\n\n${l.leave}`);
  if (l.doNow) parts.push(`## Do this now\n\n${l.doNow}`);
  return parts.join("\n\n");
}
