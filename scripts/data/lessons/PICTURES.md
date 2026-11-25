# Pictures for HTH lessons

Each lesson gets ONE illustration (two only if a second clearly earns its place) that makes the lesson easier to follow. It is a drawn diagram, not a screenshot.

## What to draw

Pick the one thing in the lesson a reader most needs to see. Good subjects:
- the finished document with its parts labelled (an invoice, a letter on letterhead, a profile page, a five-slide deck laid out as thumbnails)
- a table or grid exactly as the lesson builds it (the six-column tracker, a P&L with income, expenses and profit, a budget with planned vs actual)
- a structure (the Drive folder tree, the file-naming pattern broken into parts)
- a marked-up example (a fake email with the warning signs numbered, a weak slide beside a clean one)
- a short flow (the fix sequence, stop / verify / report, money moving from payment to tax savings to owner's draw)

Use only names, numbers and wording that already appear in that lesson. Do not invent figures. Do not draw anything that explains everyday objects (no "parts of a computer").

Do NOT imitate real product screens or logos. No Microsoft, Google, Intuit/QuickBooks, LinkedIn, Apple or other brand logos, icons or exact interface layouts. A generic document, grid, card or list is right. No faces or cartoon people. No clip-art.

## How to draw it

- Hand-written SVG, saved to `/Users/dakotahjennifer/Projects/heightenthehustle-portal/public/lessons/<course-folder>--<lesson-file-name-without-.md>.svg`
  (example: `public/lessons/getting-paid-and-staying-paid--03-professional-invoice.svg`). Create the `public/lessons` folder if needed.
- Root element: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" role="img">` with a `<title>` saying what the picture shows. Height may be up to 560 if the content needs it (change both viewBox and height).
- First child: a full-size white background rect (`fill="#ffffff"`), so it reads the same in light and dark mode.
- Colours: ink `#171717`, body grey `#4b4b4b`, lines `#d4d4d4`, panel fill `#f6f6f6`, brand red `#910000` for callouts, numbers and emphasis, light red `#f6e9e9` for highlights. Nothing else.
- Text: `font-family="Arial, Helvetica, sans-serif"`. Minimum font-size 14. Labels 14 to 16, headings 18 to 22. Keep it sparse: a picture, not a page of text. No more than about 60 words in the whole image.
- No external images, fonts, scripts, CSS files, `foreignObject`, filters or animations. Plain shapes, lines, paths and text only.
- SVG text does not wrap. Break long labels into separate `<text>` lines yourself and keep every label inside its box and inside the canvas with at least 16px margin.

## Check it by looking at it

After writing each SVG, render it and look:

    qlmanage -t -s 1600 -o <your scratch folder> <file.svg>

Then open the resulting PNG with the Read tool and inspect it. Fix and re-render until: no text overlaps other text or crosses a box edge, nothing is cut off at the canvas edge, and it is readable at a glance. Do not skip this step for any image.

## Put it in the lesson

Insert one line into the lesson's .md file, on its own line with a blank line above and below, right after the paragraph or steps it illustrates (inside `## The lesson`, never before the summary line, never inside a list or table):

    ![Short plain description of what the picture shows](/lessons/<same-file-name>.svg)

The description is real alt text for screen readers: say what is shown, in one sentence, with no "image of". Change nothing else in the lesson text. No line may end with a semicolon.
