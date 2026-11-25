# Simple Money Tracker

> Build a six-column Google Sheets tracker, enter your real last two weeks, and set a ten-minute weekly habit.

## Why this matters

Adding up one month by hand, like you did in the last session, tells you where you stand today. It does not tell you where you stand next week. For that you need a place where every dollar gets written down as it happens. Marcus, a barber who rents a booth, used to keep receipts in his glove box and "do the books" in a panic every spring. Once he started a one-page tracker, he could open his phone on any Monday and see exactly what he had earned, spent, and kept. A tracker does not need to be impressive. It needs to be used.

## What you'll learn

- The six columns a money tracker needs, and nothing more
- How to write your first formula: a running total
- How to enter two weeks of real transactions from your bank app
- How to set a weekly habit that sticks
- When this tracker retires and QuickBooks takes over

## The lesson

### Simple survives and fancy gets abandoned

You can find trackers with colored dashboards, twenty tabs, and charts. Most people who download them stop using them within a month, because every entry feels like homework. The tracker you will build has six columns on one sheet. You can update it from your phone in the time it takes to wait for a coffee. That is why it works.

### The six columns

Each row in your tracker is one transaction, which means one time money moved.

1. **Date.** The day the money moved.
2. **What.** A few words about what it was, such as "Booth rent" or "Wedding party grooming."
3. **Who.** The customer who paid you or the business you paid.
4. **Money In.** The amount, if a customer paid you. Leave it blank if money went out.
5. **Money Out.** The amount, if you spent it. Leave it blank if money came in.
6. **Running Total.** How much you have after this row.

"What" and "Who" are separate on purpose. Later you will want to answer questions like "How much did I spend at the beauty supply store?" or "How much has this client paid me this year?" Two columns make that easy.

### Your first formula: the running total

A formula is an instruction you type into a cell so the sheet does the math for you. Every formula starts with an equals sign. The running total says, in plain words: take the total from the row above, add any money in, subtract any money out.

Set it up like this:

1. In row 1, type your six headings in columns A through F.
2. In row 2, type "Starting balance" under What, and type the amount you are starting with in column F.
3. In cell F3, type `=F2+D3-E3` and press Enter.
4. Click cell F3 again, copy it, and paste it down column F for as many rows as you want.

Now every time you add a row, the running total updates on its own. If spreadsheets are new to you, the Microsoft Essentials course covers formulas step by step in the Spreadsheets for Your Business unit.

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

### The habit is the real lesson

A tracker is only as good as the last time you updated it. Before you leave the session, you choose one day of the week and set a repeating reminder on your phone. Ten minutes, same day, every week. Open the bank app, open the tracker, and add every new transaction. If you miss a week, you do not start over. You catch up at the next reminder.

### This is your starter system

The tracker is not forever. When you move to QuickBooks in Session 4, QuickBooks takes over and the sheet retires. You run one system, never both. Keeping two sets of records means double the work, and the two will never quite match.

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

## Common mistakes

- **Adding too many columns or tabs.** Fix: keep the six columns until you have used the tracker for a full month.
- **Typing an amount in both Money In and Money Out.** Fix: each row uses one or the other, never both.
- **Typing over the running total by hand.** Fix: leave column F alone and let the formula do the math.
- **Saving it all for the end of the month.** Fix: ten minutes weekly, on the day your reminder goes off.
- **Keeping the sheet going after you start QuickBooks.** Fix: retire the sheet the day QuickBooks takes over.

## Check yourself

- What are the six columns, in order?
- In plain words, what does the running total formula do?
- What day and time is your weekly tracker reminder set for?
- What happens to this sheet when you start using QuickBooks?

## What you walk away with

A working Google Sheets tracker with your real last two weeks entered, a running total that does its own math, and a weekly reminder on your phone.
