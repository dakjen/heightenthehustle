# Charts, Sharing, and Maintaining Records

> Turn expense totals into a chart a lender can read at a glance, roll your tracker forward month by month, and share only what each person needs to see.

## Why this matters

Your budget tracker is useful to you. Sooner or later it also has to be useful to someone else, such as a business partner, a bookkeeper, a tax preparer, or a lender. Those people need to see your numbers quickly, and they should see only what they need. A childcare provider applying for a small grant might be asked to show monthly expenses. A chart and a one-page PDF answer that request in a professional way. Sending the whole working file, with every note and every customer name in it, does not. This lesson covers showing your numbers, keeping them going month after month, and sharing them without exposing private records.

## What you'll be able to do

- Chart your expense categories so the largest costs are obvious
- Start each month from a copy of the last one, with formulas intact
- Share a live spreadsheet with view-only or editing permission
- Send a one-page PDF or an Excel copy in place of the working file
- Keep sensitive information out of anything that leaves your hands

## The lesson

### Chart the expense totals

A chart lets someone compare amounts at a glance. Two types cover most small-business needs. A column chart shows bars side by side and is best for comparing categories. A pie chart shows slices of a whole and is best for showing how one total is divided, as long as there are only a few slices.

You will chart the actual expenses from your budget tracker. The category names are in cells A6 through A10. The actual amounts are in cells C6 through C10. Leave the total row out, or it will show up as one giant bar that dwarfs the rest.

1. Drag to select A6 through A10.
2. Hold **Ctrl** on Windows or **Cmd** on a Mac, and drag to select C6 through C10. Both groups are now selected.
3. Go to the **Insert** tab.
4. Click **Recommended Charts** and choose a column chart, or click the column chart button directly.
5. Click the chart title and type a clear one, such as `March Expenses`.
6. Drag the chart so it sits beside your numbers, not on top of them.

A chart that holds up in front of a lender has a title that says what it shows and when. Skip 3-D effects and extra colors. They make a chart harder to read, not clearer.

### One sheet per month

Do not erase March to make room for April. You need the history, because comparing one month to the last is how you spot changes. Give each month its own worksheet, one tab, in the same workbook.

1. Right-click the worksheet tab at the bottom of the screen.
2. Choose **Move or Copy**.
3. Check the box for **Create a copy**, then click **OK**.
4. Double-click the new tab and rename it, such as `April 2026`. Rename the original `March 2026`.
5. On the April sheet, select the Actual numbers you typed in and press **Delete**. Do not delete the cells with formulas. They will show zero until you enter new numbers.
6. Update the Planned numbers if your plan has changed.

Your formulas and formatting carry over, so the next month is ready in a minute. Over a year you build twelve tabs in one file.

### Share with the right permissions

A permission is what another person is allowed to do with your file. There are two main levels. **Can view** means they can look but not change anything. **Can edit** means they can change your numbers. Give view-only access unless the person truly needs to make changes. Your bookkeeper might need to edit. A lender only needs to see.

In Excel, sharing a live file means the workbook has to be saved to OneDrive, Microsoft's online storage.

1. Click the **Share** button at the top right.
2. If asked, save the file to OneDrive.
3. Type the person's email address.
4. Choose **Can view** or **Can edit**.
5. Click **Send**.

### Send a copy, not the working file

Often the safest way to share is to send a copy and keep the live file closed to others. A PDF is best when someone only needs to read your numbers. It cannot be changed by accident, and it looks the same on every device.

1. Click the tab of the sheet you want to send.
2. Go to **File > Save As**.
3. In the file type menu, choose **PDF**.
4. Click **Save**, then open the PDF and check that it shows what you expected.

### Protect sensitive records

Before you share or export anything, ask one question: what is the least this person needs to see? A workbook can hold more than you remember, such as customer names, employee pay, or notes to yourself on another tab. Sharing a workbook shares every tab in it. A PDF of one sheet shares only that sheet. Never put bank account numbers, card numbers, Social Security numbers, or passwords in a spreadsheet you plan to share. When a project is over, go back to the Share window and remove people who no longer need access.

### In Google Sheets

To make a chart, select the same cells and go to **Insert > Chart**. A side panel opens where you can change the chart type and title. To copy a month, right-click the sheet tab and choose **Duplicate**, then right-click the copy and choose **Rename**. To share, click the **Share** button, type an email address, and choose **Viewer**, **Commenter**, or **Editor**. To export, go to **File > Download** and choose **PDF** or **Microsoft Excel (.xlsx)**.

## Try it

Open your `Budget-Tracker` file for Sharp Lines Barbershop. The actual expenses are Booth rent 800, Supplies 315, Phone and internet 90, Marketing 60, and Insurance 75.

1. Select A6 through A10, then hold Ctrl or Cmd and select C6 through C10.
2. Insert a column chart and title it `March Expenses`. Booth rent should be the tallest bar.
3. Rename the worksheet tab `March 2026`.
4. Duplicate the sheet and rename the copy `April 2026`.
5. On the April sheet, clear the Actual numbers but keep the formulas. Change the chart title to `April Expenses`.
6. Go back to the March sheet. Export it as a PDF named `Budget-March-2026`.
7. Open the PDF and confirm it shows only the March sheet.
8. If you have a classmate or partner to practice with, share the file with them as **Can view**. Ask them to confirm they cannot change a number.
9. Save the workbook.

You are done when you have one workbook with March and April tabs, a chart on each, and a separate PDF of March.

## Where owners lose time or money

- **The total row included in the chart.** Fix: select only the category rows, then insert the chart again.
- **Last month erased to start the next one.** Fix: duplicate the sheet and clear only the Actual numbers on the copy.
- **Formulas deleted while clearing a month.** Fix: undo, then select only the cells where you typed numbers.
- **Edit access given to everyone.** Fix: default to view-only and raise it only for people who need to make changes.
- **A whole workbook shared when one page would do.** Fix: export a PDF of the single sheet.

## Before you move on

1. If a lender asked for last month's expenses today, could you send a one-page PDF within five minutes?
2. Does your workbook have a separate tab for each month, with last month's numbers still intact?
3. Who can currently open your financial files, and does each of them need edit access or only view?
4. Is there anything in the workbook, on any tab, that should not travel with it?

## What you walk away with

You can show your numbers in a chart, keep a running record month by month, and share financial information with a bookkeeper, lender, or partner without exposing sensitive records.
