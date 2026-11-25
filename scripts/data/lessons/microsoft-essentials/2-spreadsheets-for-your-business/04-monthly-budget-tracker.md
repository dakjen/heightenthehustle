# Building a Monthly Budget Tracker

> Build a planned-versus-actual tracker with category totals and a remaining balance that you can reuse every month.

## Why this matters

A budget is a plan for your money. A tracker shows whether the plan held up. Without one, most owners find out they overspent when the account runs low. With one, you see it by the middle of the month, while there is still time to adjust. Take a barber who rents a booth. He plans to spend $250 on supplies. By the end of the month he has spent $315. The tracker shows him the $65 gap in one glance, so next month he can buy in bulk, raise the plan, or cut back. One page, updated a few minutes a week, turns "I think we did okay" into a number.

## What you'll learn

- How to lay out planned and actual income and expenses
- How to copy a formula down a column instead of retyping it
- How to total each section and find the remaining balance
- How to read the difference between planned and actual
- How to check your totals before you trust them

## The lesson

### Planned versus actual

**Planned** is what you expect at the start of the month. **Actual** is what really happened. The **difference** is actual minus planned. Reading that difference is the whole point of the tracker, and it reads two ways.

- For **income**, a positive difference is good news. You earned more than you planned.
- For **expenses**, a positive difference means you spent more than you planned.

### The layout

Use four columns: Category in column A, Planned in column B, Actual in column C, and Difference in column D. Put income at the top, expenses below it, and the remaining balance at the bottom. Here is the tracker for Sharp Lines Barbershop, a fictional business. The number on the left is the spreadsheet row.

| Row and category | Planned | Actual |
| --- | --- | --- |
| 2 Haircuts | 3000 | 3250 |
| 3 Product sales | 400 | 310 |
| 4 Total income | formula | formula |
| 6 Booth rent | 800 | 800 |
| 7 Supplies | 250 | 315 |
| 8 Phone and internet | 90 | 90 |
| 9 Marketing | 100 | 60 |
| 10 Insurance | 75 | 75 |
| 11 Total expenses | formula | formula |
| 13 Remaining balance | formula | formula |

Row 1 holds the headings. Rows 5 and 12 are left blank to separate the sections.

### The total formulas

Each total uses SUM from the last lesson.

1. In B4, type `=SUM(B2:B3)`. This adds planned income. The answer is 3400.
2. In B11, type `=SUM(B6:B10)`. This adds planned expenses. The answer is 1315.
3. In B13, type `=B4-B11`. This is planned income minus planned expenses. The answer is 2085.

The remaining balance is what is left after the bills are paid. It is the most important number on the page.

### Copying formulas

You need the same three totals in the Actual column. You could retype them, but copying is faster and makes fewer mistakes. When you copy a formula one column to the right, the spreadsheet shifts the references one column to the right too. So `=SUM(B2:B3)` copied from B4 into C4 becomes `=SUM(C2:C3)` automatically.

1. Click B4.
2. Find the small square at the bottom-right corner of the cell. This is the **fill handle**.
3. Drag the fill handle one cell to the right, into C4, and let go.
4. Do the same for B11 and B13.

You should now see 3560 in C4, 1340 in C11, and 2220 in C13.

The fill handle also copies down. In D2, type `=C2-B2`, which is actual minus planned. Then drag the fill handle from D2 down to D4. Each row gets its own version: `=C3-B3`, then `=C4-B4`. Do the same for the expense rows. Type `=C6-B6` in D6 and drag down to D11. Finally, type `=C13-B13` in D13.

### Reading the difference

Look at column D for Sharp Lines Barbershop.

- Haircuts: 250. He earned $250 more than planned.
- Product sales: -90. He sold $90 less than planned.
- Total income: 160. Income came in $160 ahead overall.
- Supplies: 65. He spent $65 over the plan.
- Marketing: -40. He spent $40 less than planned.
- Total expenses: 25. Spending was $25 over overall.
- Remaining balance: 135. He ended the month $135 better than planned.

Those numbers tell a story. Haircuts carried the month. Product sales were weak, and marketing was underspent, which may be connected. Supplies need a closer look. That is three decisions for next month from one small table.

### Checking totals

Before you trust the tracker, check it.

1. Click each total and look at the formula bar. Make sure the range covers every row in its section and nothing else.
2. Check that the differences agree. The income difference minus the expense difference should equal the remaining balance difference. Here, 160 minus 25 is 135. It matches.
3. Change one actual number and make sure the section total, the difference, and the remaining balance all move.

### In Google Sheets

Every formula here works the same way in Google Sheets. The fill handle is the small blue square at the bottom-right corner of the selected cell. Drag it across or down to copy. Sheets may offer to fill in the rest of a column for you. Check the suggestion before you accept it.

## Try it

1. Open a new blank workbook and save it as `Budget-Tracker`.
2. In row 1, type the headings: Category, Planned, Actual, Difference.
3. Type the Sharp Lines Barbershop categories and numbers into the rows shown in the table above. Leave rows 5 and 12 blank.
4. Enter the three total formulas in B4, B11, and B13.
5. Use the fill handle to copy each one into column C.
6. Type `=C2-B2` in D2 and fill down to D4. Type `=C6-B6` in D6 and fill down to D11. Type `=C13-B13` in D13.
7. Compare your answers to the ones in this lesson: 3400, 1315, 2085, 3560, 1340, 2220, and a remaining balance difference of 135.
8. Bold the headings and the three total rows. Format columns B, C, and D as Currency.
9. Save the file.

You are done when you have a saved tracker with planned and actual income and expenses, section totals, differences, and a remaining balance that match the numbers above.

## Common mistakes

- **Typing a total by hand instead of using a formula.** Fix: replace it with SUM so it updates when the numbers change.
- **Adding a new category below the total row.** Fix: insert the new row inside the section, above the total, then check that the SUM range grew to include it.
- **Subtracting in the wrong order.** Fix: always use actual minus planned, so the sign means the same thing every time.
- **Reading a positive expense difference as good news.** Fix: remember that for expenses, positive means over the plan.
- **Dragging the fill handle too far.** Fix: undo with Ctrl + Z or Cmd + Z and drag again, stopping at the last row.

## Check yourself

1. What is the difference between planned and actual?
2. What happens to `=SUM(B2:B3)` when you copy it one column to the right?
3. What does a positive difference mean on an expense row?
4. Which formula gives the remaining balance?

## What you walk away with

A reusable budget tracker that shows planned and actual income and expenses, totals each section, and tells you what is left at the end of the month.
