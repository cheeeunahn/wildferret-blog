export const mgs2026PlayHallContentEn = `

## Engineering may be holding back app growth

> This is absolutely not an invitation to distrust the development team. Growth teams can make a difference simply by identifying engineering issues that directly affect growth, then framing them as problems developers can solve.

Eom Jae-woong, Senior Developer Relations (DevRel) Engineer at RevenueCat, drew on the company's *State of Subscription Apps* report, which aggregates data from approximately 120,000 apps.

Payment failure is the leading cause of subscription cancellations, accounting for 32.2% of cancellations on Google Play and 15.2% on the App Store. These failures occur when an expired card or insufficient funds prevent automatic renewal, yet only 3–7% of users describe the cause as a technical problem when asked. Because users often do not realise that their payment method has failed, they do not submit a support request. The first automatic renewal is the critical point: approximately half of monthly subscribers and three out of four annual subscribers drop off at this stage. The problem is difficult to fix because Apple, Google, and Stripe control payments and retry permissions. Grace-period rules differ across iOS, Android, and the web, and each new payment application programming interface (API) can require a system migration.

Some 59.6% of paid conversions occur on the first day. Yet payment screens are rarely updated. Even changing a single line of copy requires another app review and release, turning a task that takes an hour on the web into a two-week undertaking on mobile. The conventional belief that shorter trials perform better also conflicts with the data: a 32-day trial converted at 1.7 times the rate of trials lasting four days or fewer, even as the industry moves towards shorter trials.

The proposed solution was to deliver screen configurations from the server. Moving trial length, pricing copy, and the timing of discount offers out of the code and into configuration allows teams to run three or four tests per month without a new release. Eom cited a reverse-trial case in which all paid features were initially available before users reverted to the free tier at the end of the trial. The conversion rate rose from 0.4% to 4.5%.

He also identified places where revenue can leak away unnoticed. Google Play offers six options for calculating the remaining subscription period when a user changes plans; choosing the wrong one can give away paid features for free. For 10,000 users moving from a $9.99 monthly plan to a $99.99 annual plan, the loss would be approximately $50,000. The difference may come down to one or two lines of configuration, and no dashboard identifies it as the cause.

---

## Which brands does AI cite?

Jo Kyung-sang, CEO of NNT, shared findings from more than 200 search engine optimisation (SEO) projects.

When NNT analysed 840 ChatGPT responses about one global brand, it found that the brand's official Korean channels had not been cited once. Rather than saying that it does not know, artificial intelligence (AI) fills the gap with someone else's information.

The work of ensuring that a brand is properly cited in AI answers is known as generative engine optimisation (GEO). NNT divides it into four areas: sales, including Naver Shopping price comparison, Google Shopping, and ChatGPT product recommendations; marketing, split between high-quality human-written content and automated mass production; public relations and communications, which NNT expects to become the most important area next year; and technology and operations.

Where a person might produce 18–30 pieces of content per month, automated production can generate thousands. However, generic AI-generated articles can undermine a site's credibility, causing it to disappear from search results or fall in the rankings. One food brand could not use phrases such as “benefits of X” without risking legal issues, so it expanded its pages with combinations such as “calories in X” and incorporated proprietary material, including real-time search data and customer reviews. Purchase conversion rates differed by a factor of 8–19 before and after reviews were added.

The reasoning for public relations is similar. ChatGPT and Gemini break a user's question into multiple branches and search them independently; when information is unavailable, they fill the gaps with community posts or their own conjecture. Supplying the pieces that a brand is in a position to provide changes how AI describes that brand.

The research produced the following figures:

- A page ranked first on Google has a probability of more than 40% of being cited in an AI answer, and pages ranked from first through seventh also have a high probability. This is not a causal relationship, but responding to AI is not separate from conventional SEO
- Approximately 70% of all citations come from about 30 sites
- Longer, more detailed content has an advantage. Place the key summary at the top, followed by the evidence and then the detail

Good content should offer a distinctive perspective, as a critic would; use evidence available only to the organisation; and define its reader very precisely. Jo said that the audience profile should go beyond “a woman in her thirties buying a car” to something like “32 years old, an annual income of ₩96 million, an ₩80 million budget, brand-conscious, and a 15-kilometre commute each way”. He also recommended leading with the key point, using a question-and-answer structure, and densely incorporating brand names, product names, people, and specific figures.

His closing observation stayed with me. This year's AI and next year's AI will differ in both interface and use, so concentrating only on today's technical tactics amounts to chasing a passing trend. Ask instead, “What becomes more valuable as AI improves?” The answer ultimately comes back to valuable content.

---

## From cost per install to lifetime value

Kim Sun-woo, Director at Mistplay, spoke about mobile-game marketing.

The advertising cost of acquiring a single installation has risen sharply: by more than 48% on Android and by a factor of 3.5 on iOS. Over the same period, in-game purchase revenue grew by only 4%, while session counts rose by 12% and playtime by 8%. For a user, installation is only the beginning; first play, progress towards an in-game objective, and payment follow. Yet most marketing budgets still reward installation alone.

This led to rewards for playtime. The reward system is divided into two axes: one provides rewards at intervals as playtime accumulates, while the other ties them to in-game objectives such as clearing a stage, reaching level ten, making a first purchase, or joining a guild. Average playtime per game increased by 30%, and daily active users increased by 20%. Kim emphasised the sequence: playtime rose first, followed by return on advertising spend (ROAS). He argued that the industry's perception that reward-driven users are low quality arose because rewards had been tied to installation.

To scale the approach, Kim recommended extending proven reward models beyond games. By connecting with areas where reward-driven behaviour is already established, such as financial-app points, shopping cashback, and memberships, Mistplay secured more than 40 million monthly users. In a Korean massively multiplayer online role-playing game (MMORPG) case, a Chinese developer achieved 2.5 times its day-seven ROAS target and a 40% next-day retention rate. This was 16 percentage points higher than conventional installation-advertising channels.

Patterns also differed by country. Users in the United States and United Kingdom play several games concurrently, whereas users in Korea and Japan invest deeply in a small number of games. Even with the same reward budget, Western markets need reasons to return, such as new content and rotating events. East Asian markets need reasons not to leave, such as characters, rankings, and equipment whose value grows with the time invested.

| Genre | Share of paying users | Time to first purchase | Characteristics |
| --- | --- | --- | --- |
| Puzzle | 7.3% | 1.6 days | Fastest and strongest purchase conversion |
| Role-playing game (RPG) | 5% | 1.7 days | Consistently high in both session count and time to purchase |
| Strategy | 4.3% | 2.2 days | Slowest, but the highest session count per user |

Evaluating a strategy-game campaign on day seven against a puzzle-game benchmark can lead a team to terminate a sound campaign. Kim recommended replacing cost per install (CPI) in the first section of the dashboard with playtime and purchasing-behaviour metrics. Marketing teams must also design the path through which users reach the game's core appeal after installation. He added that even a successful campaign structure should not be copied unchanged across markets or genres.

---

## A marketing playbook for cryptocurrency applications

Kim Jong-rim of Liftoff Mobile.

There are 560 million cryptocurrency holders worldwide, or approximately 10% of the internet population, and the figure has grown by 32% annually over the past three years. Mobile devices account for 78% of trades, although institutional investors and high spenders are also active on desktop computers. Kim identified three aspects of user psychology: anxiety caused by sharp news-driven price swings, an appetite for features such as check-in rewards and leaderboards, and sensitivity to trading rewards and cashback.

Clients usually operate two types of service together. The cryptocurrency market recently reached a capitalisation of $2.16 trillion, but it is highly volatile and can fall as much as 50% from its peak. Prediction trading taps into the desire to bet. Even if a football match begins at even odds, a goal can change the odds, creating opportunities to profit during the match; this market has grown by 303%.

| Group | Message | Ad creative |
| --- | --- | --- |
| New | “Start with ₩10,000” — clear explanation rather than exaggeration | App screens showing how to register, check assets, and make a purchase |
| Anxious | “Now is your opportunity”; “Others have already begun” | Surging cryptocurrency charts and real-time price changes |
| Steady-return | Long-term investing, automated returns, and regular rewards | Six-month trends instead of short-term decline charts |
| High-value | Dedicated support, trading stability, and strong security | Platinum cards and hotel or airline benefits |

For new users, showing how easy the application is to use works better than provocative messaging. Companies that also offer prediction trading use game-like creative around the National Football League (NFL) or the World Cup, such as asking users to predict how many goals a player will score. These advertisements have particularly high click-through rates.

There are three approaches to ad placement. Reach new users through casual games and lifestyle or entertainment applications; increase the share of finance, weather, and news applications for the anxious and steady-return groups; and concentrate exclusively on sports applications for prediction-trading users. Another approach is to identify existing high spenders and advertise to them intensively, because the top 10–20% of users often account for 70–80% of total revenue. This maximises revenue but is difficult to scale because the target audience is small. Timing matters as well. Users contact friends and check news and comments shortly before a match, so the daily budget is concentrated in the four hours before the event rather than spent evenly throughout the day.

---

## Changing how we work with AI

This panel brought together the people responsible for AI adoption at Ajungdang and Kurly.

At Kurly, producing a product-detail page took an average of two to four weeks: a merchandise planner (MD) prepared the brief, an editor wrote the copy, a designer created the page, and the result went through final approval. Adding AI to each stage did little to reduce the total time. The bottleneck lay in the handoffs and waiting between stages. Once the sequence itself was redesigned so that the merchandise planner could use a single AI tool to produce everything from the brief to the detail page, the work could be completed in as little as two to three hours. This, however, created conflicts over roles and responsibilities (R&R): why should the merchandise planner produce the detail page, and who is responsible for design standards?

> In more than 80% of work, communication and decision-making costs are the real problem. Individual tasks can be completed quickly with GPT or Claude, but work involving multiple teams and stakeholders cannot.

Ajungdang focused on customer consultations. Customers had only two buttons to choose from: place a call or request a consultation. Even with approximately 300 consultants, a surge in calls meant that customers could move to a competitor while waiting. Ajungdang therefore arranged for AI to call immediately after a consultation request, conduct a conversation, transcribe the recording, and pass a summary to the customer relationship management (CRM) system for a human consultant to continue. This kept customers engaged while they waited and meant that they had already invested time in the process. Both conversion and revenue increased.

The two companies differed on which problems to address with AI first.

| Category | Ajungdang | Kurly |
| --- | --- | --- |
| Starting point | Building something is no longer a differentiator in itself | Cost-reduction methods transfer to other companies more readily than revenue-growth methods |
| Deciding question | Does it actually reduce time and cost, and can it spread beyond our team? | Which team has the most people on the organisational chart? |
| How to identify work | Look for teams independently building the same things, without dampening their initiative | Aggregate records from work-management tools to identify highly repetitive tasks |
| Direction | Tools that individuals and organisations can adapt for themselves | Focus on tools for merchandise planners and developers, the two largest groups |

Their approaches to spreading adoption were diametrically opposed. Ajungdang allows practitioners to build tools on their own. When it used AI to create and distribute a data-analysis tool, no one was using it a week later; switching to hackathons and workshops brought forward people who built tools voluntarily. However, once the number of tools exceeded thirty to forty, both the management burden and AI usage fees rose sharply. The company introduced guidelines and rules, but compliance remained at approximately 50%, so it is establishing a separate review function. Its most effective measure was a weekly internal AI gathering lasting thirty minutes to an hour. Participants share what they built the previous week, even if it is unrelated to their work.

Kurly takes an executive-led approach and identified three requirements. Redefining roles is the most important. Reducing communication costs requires one person or team to assume broader responsibilities, which is impossible without commitment from management. The second is an accessible working environment: non-developers should not be asked to begin by installing developer software. The final requirement is training, and compulsory training proved the most effective.

Asked what changes in marketing, Ajungdang pointed to validation. In an era when teams can produce hundreds of prototypes per day, the remaining task is to fail quickly, make corrections, and find what works. As production becomes cheaper, verification becomes more important, which ultimately brings the work back to fundamentals. Kurly offered a concrete example. A single marketer handles the US launch of its in-house beauty brand, from content planning to TikTok and Amazon setup and ongoing operations. The work would previously have required a team, so money once spent on personnel can be redirected to advertising, changing the baseline for the target rate of return itself.

The Kurly panelist, who has worked on 100 applications and 300 projects since 2009, argued that the app business is no longer worth pursuing at company scale. It remains viable as a solo venture earning several million to ten million won per month, but a team of five or more is unlikely to achieve either success or the expected return by launching a single application.

The panel closed with advice for both groups. Decision-makers should treat AI as a team member rather than an assistive tool, redesign roles, and directly reshape organisational structures and responsibilities to reduce communication costs. Practitioners should begin problem definition with data. The panelists also observed that people who are good at their work are good at using AI: those who set priorities in line with company goals and collaborate effectively also give AI effective direction.

---

## Where I heard these talks

MGS WEEK 2026 (2026.07.21, Westin Seoul Parnas). The slogan was "Stack AI, Rewrite Everything".

**Main Hall**

- **What is blocking your app's growth may be engineering, not growth strategy** — Eom Jae-woong (Senior DevRel Engineer, RevenueCat) · 10:15–10:40

**Play Hall**

- **Beyond the ROAS Wall: from CPI to LTV** — Kim Sun-woo (Director and Commercial Director, Mistplay) · 10:55–11:20
- **Which brands does AI cite?** — Jo Kyung-sang (CEO, NNT) · 11:30–11:55
- **The crypto UA playbook: optimal creative and targeting strategies for each user persona** — Kim Jong-rim (Liftoff Mobile, Pan-APAC) · 12:05–12:30

**Main Hall (continued)**

- **AI and agentic workflows: redesigning organisational operations and growth** — moderator Nam Sung-pil (CEO, AB180), panelists Lee Ha-seok (Head of Marketing, Ajungdang) · Kwak Geun-bong (Head of AX Centre, Kurly) · 18:35–19:00

**Further reading**

- [MGS 2026 field report — "Now is the time to rewrite marketing with AI" (AB180, 2026.08.03)](https://blog.ab180.co/posts/mgs-2026-recap) — the organiser's recap of the full event
`
