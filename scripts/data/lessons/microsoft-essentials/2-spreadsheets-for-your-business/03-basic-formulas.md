# Totals, Averages, and Order Math That Update Themselves

> Use SUM, AVERAGE, subtraction, and multiplication so your sales, costs, and order totals recalculate on their own, and verify every answer before you rely on it.

## Why this matters

Adding a column of numbers on a calculator works until one number changes. Then you add it all again, and hope you did not skip a line. A formula does the math for you and redoes it the moment a number changes. Picture a caterer who tracks sales and costs each week. With four short formulas she can see her total sales, her total costs, what is left over, and what a normal week looks like. If a receipt turns up late, she types it in and every total updates by itself. That is the difference between guessing how the month went and knowing. The catch is that a formula pointed at the wrong cells gives a confident wrong answer, so this lesson spends as much time on checking formulas as on writing them.

## What you'll be able to do

- Total a column of sales or expenses with SUM
- Find what a typical week brings in with AVERAGE
- Calculate what is left after costs, and price times quantity for an order
- Build formulas from cell references so answers update when a number changes
- Run four quick checks that catch a wrong formula before it costs you

## The lesson

### The sample data

The examples below use four weeks of numbers from Tasha's Catering, a fictional business.

| Week | Sales | Expenses |
| --- | --- | --- |
| Week 1 | 1200 | 450 |
| Week 2 | 950 | 380 |
| Week 3 | 1400 | 520 |
| Week 4 | 1050 | 410 |

The headings are in row 1. Sales are in cells B2 through B5. Expenses are in cells C2 through C5.

### Point at cells, do not retype numbers

Every formula starts with **=**. The equals sign tells the spreadsheet you want an answer and not text. Type `5+3` in a cell and you see 5+3. Type `=5+3` and press Enter and you see 8.

The cell shows the answer. To see the formula behind it, click the cell and look at the formula bar, the long box above the column letters.

The professional habit is to build formulas from cell references, meaning cell addresses, and not from typed numbers. With 1200 in B2 and 450 in C2, the formula `=B2-C2` means "take what is in B2 and subtract what is in C2." The answer is 750. If you type `=1200-450`, the answer is stuck. With `=B2-C2`, changing B2 to 1300 updates the answer to 850 right away. You can type a reference, or you can click the cell while you are building the formula and the spreadsheet fills in the address for you.

### SUM: total sales, total costs

`=SUM(B2:B5)` adds every cell from B2 through B5. The colon means "through," and a block of cells like B2:B5 is called a range. For the sample data, the answer is 4600.

1. Click cell B6, the cell right below the sales numbers.
2. Type `=SUM(`
3. Drag from B2 down to B5. The formula now reads `=SUM(B2:B5`
4. Type `)` and press Enter.

There is also a shortcut. Click B6, go to the **Home** tab, and click **AutoSum**. Excel guesses the range above. Check that it is right, then press Enter.

### AVERAGE: what a normal week looks like

`=AVERAGE(B2:B5)` adds the cells in the range and divides by how many there are. For the sample data, that is 4600 divided by 4, which is 1150. So a typical week brings in $1,150. An average gives you a baseline to plan against. If next week comes in at $700, you know it was a slow one.

### Subtraction: what is left

Subtraction uses the minus sign. If total sales are in B6 and total expenses are in C6, then `=B6-C6` gives what is left. For the sample data, that is 4600 minus 1760, which is 2840.

### Multiplication: pricing an order

Multiplication uses the asterisk, the star above the 8 on most keyboards. Say a customer orders 12 trays at $45 each. Put 12 in cell B9 and 45 in cell B10. The formula `=B9*B10` gives 540. If the customer changes the order to 15 trays, change B9 and the total updates to 675.

### Four checks before you rely on an answer

A formula is only as good as the cells it points to. Check every one.

1. **Look at the range.** Double-click the formula cell. The cells it uses light up with colored borders. Make sure the top and bottom rows are both included.
2. **Estimate in your head.** Four weeks of about $1,000 each should total around $4,000. If the answer is 46,000 or 460, something is wrong.
3. **Test it.** Change one number and watch the total change. Then change it back.
4. **Look for text.** If a number sits on the left side of its cell, it may have been typed as text, and SUM will skip it. Retype it as a plain number.

### In Google Sheets

Formulas are written exactly the same way in Google Sheets. `=SUM(B2:B5)`, `=AVERAGE(B2:B5)`, `=B6-C6`, and `=B9*B10` all work without changes. As you type, Sheets shows a small suggestion box. Press Enter when your formula is complete.

## Try it

1. Open a blank workbook and save it as `Sales-Practice`.
2. Type the headings Week, Sales, and Expenses in A1, B1, and C1. Type the four weeks of Tasha's Catering data in rows 2 through 5.
3. In A6, type `Total`.
4. In B6, type `=SUM(B2:B5)`. You should get 4600.
5. In C6, type `=SUM(C2:C5)`. You should get 1760.
6. In D1, type `Remaining`. In D2, type `=B2-C2`. You should get 750.
7. In D6, type `=B6-C6`. You should get 2840.
8. In A7, type `Average week`. In B7, type `=AVERAGE(B2:B5)`. You should get 1150.
9. In A9, type `Trays`, and in B9, type 12. In A10, type `Price per tray`, and in B10, type 45. In A11, type `Order total`, and in B11, type `=B9*B10`. You should get 540.
10. Change the Week 2 sales in B3 from 950 to 1000. Watch B6 change to 4650 and D6 change to 2890. Change it back to 950.
11. Format the money cells as Currency and save.

You are done when every answer matches the ones above and the file is saved.

## Where owners lose time or money

- **A formula typed without the equals sign.** Fix: click the cell and retype it starting with =.
- **Numbers typed into a formula in place of references.** The answer stays frozen when the underlying figure changes, and a stale total gets quoted to a customer. Fix: replace the numbers with cell addresses so the answer updates.
- **A range that stops one row short.** The last week or the last receipt is silently left out. Fix: double-click the formula and check the colored border covers every row.
- **The total row included in its own range.** Fix: make sure the range ends at the last data row, not the row with the formula.
- **An x typed for multiplication.** The spreadsheet reads it as text. Fix: use the asterisk, as in =B9*B10.

## Before you move on

1. Can you state your total sales and total costs for the last four weeks from one sheet, without a calculator?
2. Do you know what an average week brings in for your business, and would you spot a slow one?
3. If a customer changed an order quantity while on the phone, could you give the new total by changing one cell?
4. Which two checks will you run on every total before you put it in a quote or hand it to a preparer?

## What you walk away with

You can write and verify formulas for totals, averages, what is left over, and price times quantity, so your numbers recalculate on their own and you can stand behind them.
