# Build a Six-Column Money Tracker

> Set up a one-page Google Sheets tracker with a running total, enter your real last two weeks, and lock in a ten-minute weekly update.

## Why this matters

Adding up one month by hand, as you did in the last session, tells you where you stand today. It does not tell you where you stand next week. For that you need one place where every dollar gets recorded as it happens. Marcus, a barber who rents a booth, kept his receipts in the glove box and rebuilt the whole year from them each spring. It cost him days, and the numbers arrived too late to act on. Once he ran a one-page tracker, he could open his phone on any Monday and see what he had earned, spent, and kept. A tracker does not need to be impressive. It needs to be used.

## What you'll be able to do

- Set up the six columns a money tracker needs, and nothing more
- Have the sheet keep a running total so you never do the math by hand
- Enter two weeks of real transactions from your bank app and match the balance
- Pull totals by customer or vendor in seconds
- Hold a weekly update slot, and know the day this tracker retires and QuickBooks takes over

## The lesson

### Lean survives and fancy gets abandoned

You can find trackers with colored dashboards, twenty tabs, and charts. Most people who download them stop within a month, because every entry feels like homework. The tracker you build here has six columns on one sheet. You can update it from the Sheets app on your phone while you wait for a coffee. That is why it lasts.

### The six columns

Each row is one transaction, meaning one time money moved.

1. **Date.** The day the money moved.
2. **What.** A few words about what it was, such as "Booth rent" or "Wedding party grooming."
3. **Who.** The customer who paid you or the business you paid.
4. **Money In.** The amount, if a customer paid you. Leave it blank if money went out.
5. **Money Out.** The amount, if you spent it. Leave it blank if money came in.
6. **Running Total.** How much you have after this row.

"What" and "Who" are separate on purpose. Later you will want answers like "How much did I spend at the beauty supply store?" or "How much has this client paid me this year?" With Who in its own column, you turn on a filter, pick the name, and the answer is on screen.

### Let the sheet keep the running total

The running total is one formula copied down the column. It says: take the total from the row above, add any money in, subtract any money out.

Set it up like this:

1. In row 1, type your six headings in columns A through F.
2. In row 2, type "Starting balance" under What, and type the amount you are starting with in column F.
3. In cell F3, type `=F2+D3-E3` and press Enter.
4. Click cell F3 again, copy it, and paste it down column F for as many rows as you want.

Now every time you add a row, the running total updates on its own. The Spreadsheets for Your Business unit in the Microsoft Essentials course goes further with formulas if you want more from the sheet.

Two settings make the sheet faster to work in:

- **Freeze the heading row.** Choose View, then Freeze, then 1 row. The headings stay visible however far down you scroll.
- **Turn on a filter.** Click any heading, then choose Data, then Create a filter. Use the Who column to see one customer or one vendor at a time.

### A worked example: Marcus's first week

Marcus starts with $1,200 in his business account. Here is his first week.

| Date, what, and who | Money In | Money Out | Running Total |
| --- | --- | --- | --- |
| Starting balance | | | $1,200 |
| Mar 1, booth rent, Fade Factory | | $250 | $950 |
| Mar 2, haircuts, walk-ins | $340 | | $1,290 |
| Mar 4, clipper blades, beauty supply | | $62 | $1,228 |
| Mar 5, haircuts, walk-ins | $410 | | $1,638 |
| Mar 7, wedding party grooming, Jordan Ellis | $300 | | $1,938 |
| Mar 8, phone bill, phone company | | $75 | $1,863 |

Check the math. Money in was $340 + $410 + $300 = $1,050. Money out was $250 + $62 + $75 = $387. Start with $1,200, add $1,050, subtract $387, and you get $1,863. The last running total matches. For the week, Marcus brought in $1,050, spent $387, and kept $663.

![The six-column tracker filled in with Marcus's first week, from a $1,200 starting balance down to a final running total of $1,863.](/lessons/getting-paid-and-staying-paid--u1-02-simple-money-tracker.svg)

The check that matters most is the last one: the final running total should equal the balance in the bank app. When it does, nothing is missing. When it does not, the gap is usually the exact amount of the row you skipped or mistyped, which tells you what to look for.

### The weekly slot is the real system

A tracker is only as good as its last update. Before you leave the session, choose one day of the week and set a repeating reminder on your phone. Ten minutes, same day, every week. Open the bank app, open the tracker, and add every new transaction. If you miss a week, you do not start over. You catch up at the next reminder.

### The tracker has an end date

This sheet is not forever. When you move to QuickBooks in Session 4, QuickBooks takes over and the sheet retires. You run one system, never both. Two sets of records mean double the work, and the two will never quite match.

## Do this now

This is what everyone does together in the session.

1. Open Google Sheets and create a new blank sheet. Name it "Money Tracker" plus the year.
2. Type the six headings in row 1: Date, What, Who, Money In, Money Out, Running Total.
3. Enter your starting balance in row 2.
4. Type the running total formula in F3 and copy it down the column.
5. Open your bank app and enter every business transaction from the last two weeks, oldest first.
6. Compare your last running total to the balance in your bank app. If they differ, look for a row you missed or typed wrong.
7. Pick your weekly tracker day and set a repeating ten-minute reminder on your phone.

You finish with a working tracker that holds your real last two weeks and a reminder already on your phone.

## Where owners lose time or money

- **Extra columns and tabs.** Every added field is one more reason to skip an entry. Fix: keep the six columns until you have used the tracker for a full month.
- **An amount in both Money In and Money Out.** The running total goes wrong from that row down. Fix: each row uses one or the other, never both.
- **Typing over the running total by hand.** It breaks the formula for every row below. Fix: leave column F alone and let the formula do the math.
- **Saving it all for the end of the month.** A month of entries takes an evening and the details are gone. Fix: ten minutes weekly, on the day your reminder goes off.
- **Keeping the sheet going after you start QuickBooks.** You pay for the same work twice. Fix: retire the sheet the day QuickBooks takes over.

## Before you move on

- Does your last running total match your bank balance to the dollar?
- Can you filter the Who column and see what one customer has paid you?
- What did the business bring in, spend, and keep over the two weeks you entered?
- What day and time is your weekly tracker reminder set for?
- On what date does this sheet retire in favor of QuickBooks?

## What you walk away with

A working Google Sheets tracker with your real last two weeks entered, a running total that does its own math, and a weekly reminder on your phone.
