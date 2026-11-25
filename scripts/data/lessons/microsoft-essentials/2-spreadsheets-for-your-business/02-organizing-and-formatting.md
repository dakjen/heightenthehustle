# Sort and Filter Your Transactions Without Scrambling Them

> Format an expense list with clear headings, currency and dates, then sort and filter it safely to answer questions like "what did I spend on supplies?"

## Why this matters

A list of numbers only helps you if you can read it quickly and trust it. Formatting makes it readable. Sorting and filtering let you ask it questions. Say you own a cleaning business and want to know how much you spent on supplies last month. With a filter, you click twice and see only the supplies rows. Without one, you scroll and squint and probably miss a line. The same clean list is what a tax preparer or lender wants to see. They do not want a pile of receipts. They want one row for each purchase, with a date, a description, a category, and an amount.

## What you'll be able to do

- Make the heading row stand out and stay in view on a long list
- Show amounts as currency and dates in one consistent style
- Clear up cut-off text and ##### in seconds
- Sort a whole table by date or amount with every row kept intact
- Filter to one category, read the total, and bring the full list back

## The lesson

### Two rules that keep the records trustworthy

**Rule one: one row per transaction.** A transaction is one purchase or one sale. Each one gets its own row. Do not combine two gas fill-ups into one row, and do not spread one purchase across two rows. When every row is one transaction, the spreadsheet can count, add, sort, and filter correctly.

**Rule two: sort the entire table, not a single column.** If you sort only the Amount column, the amounts move but the dates and items stay put. Now the $64.50 sits next to "Gas" and your records are wrong, with no warning. Always sort the whole table together so each row stays in one piece.

### Headings that stay put

Make the labels in row 1 look different from the data so your eye finds them.

1. Click the row number **1** on the left edge to select the whole row.
2. On the **Home** tab, click **B** for bold, or press **Ctrl + B** on Windows or **Cmd + B** on a Mac.
3. To keep the headings in view while you scroll a long list, go to the **View** tab, click **Freeze Panes**, and choose **Freeze Top Row**.

### Currency and date formats

A format changes how a cell looks without changing what is in it. The cell still holds 64.5. The currency format shows it as $64.50.

1. Click the letter at the top of the Amount column to select the whole column.
2. On the **Home** tab, find the number format box. It usually says **General**.
3. Click it and choose **Currency**.

Dates work the same way. Select the Date column, open the same box, and choose **Short Date**. Every date will now show in the same style, such as 3/2/2026. If a date stays stuck on the left side of its cell and will not change, it was typed as plain text. Retype it with slashes.

### Column widths

If you see a row of pound signs like ##### in a cell, the number is fine. The column is too narrow to show it. Move your pointer to the line between two column letters at the top and double-click. The column sizes itself to fit its longest entry. You can also drag that line left or right to set the width by hand.

### Sorting the whole table

Sorting puts rows in order, such as oldest to newest or largest to smallest.

1. Click any one cell inside your table. Do not select a whole column.
2. Go to the **Data** tab and click **Sort**.
3. Make sure **My data has headers** is checked, so row 1 stays on top.
4. In **Sort by**, choose a column, such as Date.
5. In **Order**, choose Oldest to Newest.
6. Click **OK**.

Because you clicked only one cell, Excel selected the whole table for you and moved each row as a unit. After any sort, check one row you know. If "Phone bill" still sits next to $55.00, the sort was safe.

### Filtering to answer a question

Filtering hides the rows you do not need right now. It does not delete anything.

1. Click any cell in your table.
2. On the **Home** tab, click **Sort & Filter**, then choose **Filter**. A small arrow appears in each heading.
3. Click the arrow in the Category heading.
4. Uncheck **Select All**, then check **Supplies**.
5. Click **OK**. Only the supplies rows show. The row numbers on the left turn blue and skip, which tells you rows are hidden.
6. To see everything again, click the arrow and choose **Clear Filter From "Category"**.

While the filter is on, drag down the visible amounts and look at the status bar along the bottom edge of the Excel window. It shows the sum of the cells you selected. That is your category total, with no formula needed.

### In Google Sheets

For currency, select the column and go to **Format > Number > Currency**. For dates, use **Format > Number > Date**. To freeze the headings, go to **View > Freeze > 1 row**. To sort and filter, click any cell in the table and go to **Data > Create a filter**. A filter button appears in each heading. Click it to sort A to Z or Z to A, or to check and uncheck categories. The same two rules apply.

## Try it

Open your `Expenses-2026` file for Fresh Start Cleaning from the last lesson. Add these three rows at the bottom, in this order.

| Date | Item | Category | Amount |
| --- | --- | --- | --- |
| 3/25/2026 | Mop heads | Supplies | 22.00 |
| 3/7/2026 | Gas | Travel | 38.00 |
| 3/12/2026 | Flyers | Marketing | 48.00 |

1. Bold the headings in row 1 and freeze the top row.
2. Format the Amount column as **Currency**.
3. Format the Date column as **Short Date**.
4. Double-click the column borders so every column fits its contents.
5. Sort the whole table by Date, oldest to newest. The top row of data should be 3/2/2026 and the last should be the mop heads on 3/25/2026.
6. Check that the phone bill still shows $55.00.
7. Turn on the filter and show only **Supplies**. You should see three rows: $64.50, $18.25, and $22.00.
8. Clear the filter so all eight rows show again.
9. Save the file.

You are done when you have a saved, formatted list of eight transactions in date order.

## Where owners lose time or money

- **Sorting one selected column.** Amounts end up beside the wrong purchases, and nothing on screen flags it. Fix: undo right away with Ctrl + Z or Cmd + Z, click a single cell in the table, and sort again from the Data tab.
- **A category spelled two ways, such as "Supply" and "Supplies."** The filter treats them as different categories and the total comes up short. Fix: pick one spelling and correct the others.
- **Retyping rows that a filter has hidden.** Fix: clear the filter and they come back.
- **Deleting or retyping a number that shows as #####.** The number is intact. Fix: widen the column.
- **Several purchases combined in one row.** Fix: split them so each transaction has its own row.

## Before you move on

1. Can you pull up only one category of your own spending in two clicks?
2. After you sort, which row do you use as your spot check, and does it still match?
3. Is every category in your list spelled one way?
4. Would your list make sense to a tax preparer who has never seen your receipts?

## What you walk away with

A clean, readable expense record in date order that you can sort and filter by category whenever you have a question about your spending.
