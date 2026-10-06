-- HTH core curriculum (course + 16 unit lessons). Safe to re-run. Applied by: npm run db:apply
-- Teacher = first admin account.

INSERT INTO "classes" ("title", "description", "teacher_id", "type")
SELECT 'Heighten The Hustle™ Core Curriculum', $md$Heighten The Hustle™ participants will explore, analyze and contemplate the context of cultural differences, the impact of those differences on how we interact as a society, and the influences those differences have in the workplace. Students will also learn to relate their strengths to the market with dynamic language, and learning how to verbally communicate those strengths will culminate the course.

## Course objectives
1. Develop an understanding of basic business principles.
2. Develop a set of skills that allows one to pitch their business effectively.
3. Develop a business plan.
4. Develop an understanding of how to implement a business and grow a business.

## Learning outcomes
1. Demonstrate the ability to comprehend the Lean Canvas model.
2. Demonstrate a comprehensive understanding of business principles.
3. Demonstrate, through creation of a financial model, the importance of understanding how a business makes profit.
4. Demonstrate the skills to communicate the value of a business.

## Assignments
- #1, due Unit 2: Bring two news articles to class (one about an entrepreneur or business you admire, one about a business that competes with yours). Complete the Competitive Landscape Template.
- #2, due Unit 4: Complete the List of Services Template.
- #3, due Unit 5: Complete the List of Expenses Template.
- #4, due Unit 6: Complete the Revenue and Expenses Template.
- #5, due Unit 9: Lean Canvas, Components #1 and #2.
- #6, due Unit 10: Lean Canvas, Component #3.
- #7, due Unit 11: Lean Canvas, Components #4 and #5.
- #8, due Unit 12: Lean Canvas, Components #6 and #7.
- #9, due Unit 13: Lean Canvas, Components #8 and #9.
- #10, due Unit 14: Completed HTH Business Plan Summary Template and the full Lean Canvas.
- #11, due Week 20: Pitch presentation (PowerPoint).

## Required reading
Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson. A chapter is assigned for each unit (audiobook on Audible, provided by HTH), with a short survey at the end of each unit. All other readings are listed in each unit.$md$, (SELECT "id" FROM "users" WHERE "role" = 'admin' ORDER BY "id" LIMIT 1), 'hth-course'
WHERE NOT EXISTS (SELECT 1 FROM "classes" WHERE "title" = 'Heighten The Hustle™ Core Curriculum')
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 1 — What''s Your Hustle?', $md$## Topics
1. What is entrepreneurship?
2. What is social entrepreneurship and social innovation?
3. What problem are you trying to solve?
4. What data do you have that demonstrates the impact of the problem or the need for your product?
5. What is your solution?

## Required readings
- Definition of Entrepreneurship (handout)
- [What is Social Entrepreneurship?](https://www.uschamber.com/co/start/startup/what-is-social-entrepreneurship) — US Chamber of Commerce
- [Social Entrepreneurship: The Case for Definition](https://ssir.org/articles/entry/social_entrepreneurship_the_case_for_definition) — Stanford Social Innovation Review
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 1 (Finding Fearlessness)

## Required videos
- [Hustle Harder, Hustle Smarter](https://www.youtube.com/watch?v=dOsipB_Ru_4) — 50 Cent
- [Entrepreneurship](https://napkinfinance.com/napkin/entrepreneur-definition/) — Napkin Finance (watch the video and read the article)
- [12 Inspiring African Entrepreneurs](https://sosmusicmedia.com/music-that-matters/pharrell-williams-entrepreneur) — profiled in Entrepreneur by Pharrell
- [50 Cent Tip 5 Favorite Rappers](https://www.youtube.com/watch?v=LNoitc9sjcc) — Larry King$md$, 1
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 1)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 2 — Who Else Is in the Game?', $md$## Topics
1. Who else does what you do?
2. Why do people use their services?
3. What do you do differently than your competitors?

## Required readings
- [Competitive Landscape](https://www.productplan.com/glossary/competitive-landscape/) — Product Plan
- [8 Easy Steps to Creating a Competitive Landscape Analysis](https://www.oktopost.com/blog/8-easy-steps-creating-competitive-landscape-analysis/) — Oktopost

## Recommended readings & listening
- [How To Create a Competitive Landscape Analysis](https://outcry.io/2018/11/12/competitive-landscape-analysis/) — Outcry.io
- [How To Write The Competitor Analysis Section of The Business Plan](https://www.thebalancesmb.com/how-to-write-the-competitive-analysis-section-of-the-business-plan-2947025) — The Balance Small Business
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 2 (Heart of a Hustler, first 30 minutes)

## Required videos
- [How Competitive Intelligence Grows Your Business](https://quickbooks.intuit.com/r/starting-a-business/conduct-competitive-analysis/) — QuickBooks (video required, article recommended)
- [50 Cent – Hustler’s Ambition](https://www.youtube.com/watch?v=juoggmbU1qw) — 50 Cent

## Due this unit
Assignment #1 due: two news articles and the Competitive Landscape Template.$md$, 2
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 2)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 3 — Who Is Your Client?', $md$## Topics
1. Who is your typical consumer?
2. How do they become aware of your product?
3. How will you acquire them?

## Required readings
- Determining Your Ideal Customer — Brian Tracy, Entrepreneur (handout)
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 2 (Heart of a Hustler, second 30 minutes)

## Required videos
- [7 Client Acquisition Methods](https://www.youtube.com/watch?v=sAlWDSrwqyo) — Daniel DiPiazza
- [50 Cent- Straight To The Bank](https://www.youtube.com/watch?v=ZTEfInwgxVs) — 50 Cent (Vitamin Water sold in 2007; made 50 $100M)

Guest speaker: Nkenge Yasin, Learning How (daycare service provider).$md$, 3
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 3)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 4 — How Do You Make Money?', $md$## Topics
1. What services do you charge for?
2. Review the Fee and Expense Template.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 3 (Constructing Your Crew)

## Required videos
- [Hustle Harder, Hustle Smarter](https://www.youtube.com/watch?v=dOsipB_Ru_4) — 50 Cent motivational video

Required tool: List of Services Template.

## Due this unit
Assignment #2 due: List of Services Template.$md$, 4
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 4)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 5 — Show Me the Money, Part I', $md$## Topics
1. How much will you charge for those services?
2. What do those services cost you to produce and deliver to your client?
3. Review and update the spreadsheet listing all of the fees for your service.
4. Review and update the spreadsheet listing all of the expenses of your business.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 4 (Knowing Your Value, first 30 minutes)

## Required videos
- [Rapper 50 Cent Thinks Like a Harvard Business Man](https://www.youtube.com/watch?v=ybxsh2wk9qs) — Wall Street Journal

Required tool: Revenue and Expenses Template.

## Due this unit
Assignment #3 due: List of Expenses Template.$md$, 5
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 5)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 6 — Show Me the Money, Part II', $md$## Topics
1. Create a spreadsheet calculating all of your revenues for each month for 24 months, then annually for the following 8 years.
2. Create a spreadsheet calculating all of your expenses for each month for 24 months, then annually for the following 8 years.
3. Calculate profit.
4. Discussion of results.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 4 (Knowing Your Value, second 30 minutes)

## Required videos
- [50 Cent: I Never Did Any Drugs,](https://www.youtube.com/watch?v=lRlcLozRibg) — CNN

Required tool: Spreadsheet Template.

## Due this unit
Assignment #4 due: Revenue and Expenses Template.$md$, 6
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 6)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 7 — Rise Up', $md$## Topics
1. How will your business grow?
2. What kinds of talent do you need to sustain your business?
3. How will you manage that growth financially?

## Required readings
- [6 Tips To Grow Your Business in 2021](https://www.forbes.com/sites/ashleystahl/2021/01/11/6-tips-to-grow-your-business-in-2021/?sh=5ef04e447b62) — Ashley Stahl, Forbes
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 5 (Evolve or Die)

## Required videos
- [50 Cent Tells Us How He Built His Empire and The Magic Behind Power](https://www.youtube.com/watch?v=opBbCWSlQN8) — On Air with Ryan Seacrest$md$, 7
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 7)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 8 — Business Plan Overview', $md$## Topics
1. Review the Lean Canvas Template and the Business Plan Summary.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 6 (Power of Perception)

## Required videos
- [Lean Canvas Intro – Uber Example](https://www.youtube.com/watch?v=pvIN9STpzCQ) — Railsware Product Academy
- [Lean Canvas Example](https://www.youtube.com/watch?v=2nW9lg-fenY) — ChannelX
- [How to Write a One Page Business Plan Template and Example](https://www.youtube.com/watch?v=QelL8nkZXsY) — League of Hustlers
- [50 Cent’s Spiritual Side](https://www.youtube.com/watch?v=F2rd-V65ueg) — Oprah’s Next Chapter, OWN
- [A Meditation for Overcoming Obstacles with Deepak Chopra](https://www.youtube.com/watch?v=W5T0iQ10A1M&t=155s) — Infinite Love Coaching Academy

Required tools: Lean Canvas Template and Business Plan Summary.$md$, 8
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 8)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 9 — Business Plan, Part 1', $md$## Topics
1. Complete Lean Canvas Components #1 and #2: Problem and Customer.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 7 (If We Can’t Be Friends)

## Required videos
- [I want to Sell Water:50 Cent Shares Inspiration Behind Vitamin Water](https://www.youtube.com/watch?v=zQ3jy-JV7YI) — Larry King

## Due this unit
Assignment #5 due: Lean Canvas Components #1 and #2.$md$, 9
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 9)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 10 — Business Plan, Part 2', $md$## Topics
1. Complete Lean Canvas Component #3: Unique Value Proposition.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 8 (Learning from Your L’s)

## Required videos
- [50 Cent: Robert Greene Gave Me The Best Advice,](https://www.youtube.com/watch?v=Zqteyp2vCt4) — Sirius XM
- [50 Cent Interviewed by Robert Greene,](https://www.youtube.com/watch?v=RHCK_O0YkiQ) — chronus20

## Due this unit
Assignment #6 due: Lean Canvas Component #3.$md$, 10
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 10)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 11 — Business Plan, Part 3', $md$## Topics
1. Complete Lean Canvas Components #4 and #5: Solution and Key Benefits / Unfair Advantage.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 9 (The Entitlement Trap, first 30 minutes)

## Required videos
- [How To Pitch your Startup in 3 Minutes](https://www.youtube.com/watch?v=XWRtG_PDRik) — SAS Programme
- [Startup Pitch Video: How To Create a Pitch Deck For Investors](https://www.youtube.com/watch?v=SB16xgtFmco) — SlideBean
- [50 Cent talks about what made him so successful](https://www.youtube.com/watch?v=wt7LtxtKeeo) — Kristen Gijbels

## Due this unit
Assignment #7 due: Lean Canvas Components #4 and #5.$md$, 11
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 11)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 12 — Business Plan, Part 4', $md$## Topics
1. Complete Lean Canvas Components #6 and #7: Revenue Streams and Cost Structure.

## Required readings
- Hustle Harder, Hustle Smarter — Curtis "50 Cent" Jackson, Chapter 9 (The Entitlement Trap, second 30 minutes)

## Required videos
- [50 Cent Talks Raising Kanan, Losing His Mom at a Young Age, Growing Up in Jamaica Queens + More](https://www.youtube.com/watch?v=QX8_iiIQ9bo) — Thisis50

## Due this unit
Assignment #8 due: Lean Canvas Components #6 and #7.$md$, 12
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 12)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 13 — Business Plan, Part 5', $md$## Topics
1. Complete Lean Canvas Components #8 and #9: Key Metrics and Channels.
2. Review the Business Plan Summary.

## Required videos
- [Exclusive: What 50 Cent Wants His Legacy to Be](https://www.youtube.com/watch?v=dd8PtHWivP4) — Oprah’s Next Chapter, OWN

## Due this unit
Assignment #9 due: Lean Canvas Components #8 and #9.$md$, 13
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 13)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 14 — Pitch Practice, Part 1', $md$## Topics
1. Draft your PowerPoint business plan presentation.
2. Practice pitches and refine the presentation deck.

## Due this unit
Assignment #10 due: completed HTH Business Plan Summary Template and full Lean Canvas.$md$, 14
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 14)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 15 — Pitch Practice, Part 2', $md$## Topics
1. Continue practice pitches with feedback.
2. Finalize the presentation deck.$md$, 15
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 15)
;

INSERT INTO "lessons" ("class_id", "title", "content", "order")
SELECT c."id", 'Unit 16 — Business Plan Pitch', $md$## Topics
1. Deliver your PowerPoint business plan pitch.

## Required videos
- [Hustle Harder Hustle Smarter 50 Cent Summary](https://www.youtube.com/watch?v=lyIa59hUaYE) — Brief Book Club

## Due this unit
Assignment #11: pitch presentation.$md$, 16
FROM "classes" c WHERE c."title" = 'Heighten The Hustle™ Core Curriculum'
AND NOT EXISTS (SELECT 1 FROM "lessons" l WHERE l."class_id" = c."id" AND l."order" = 16)
;
