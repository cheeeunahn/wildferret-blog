export const mgs2026PlayHallContentEn = `
This article synthesises five sessions presented at MGS WEEK 2026. It reports the speakers' claims, examples, and figures rather than independently validating them. Accordingly, numerical results should be interpreted as conference evidence whose generalisability depends on the underlying datasets and methods.

## Engineering constraints on app growth

Eom's central claim was not that growth teams should distrust engineering teams, but that they should identify technical constraints with direct implications for growth and translate them into actionable engineering problems.

Eom Jae-woong, Senior DevRel Engineer at RevenueCat, presented findings from the *State of Subscription Apps* report, which aggregates data from approximately 120,000 apps. Unless otherwise noted, the figures in this section are those presented by the speaker.

According to the presentation, payment failure accounts for 32.2% of Google Play cancellations and 15.2% of App Store cancellations. Examples include an expired card or insufficient funds preventing automatic renewal. Only 3–7% of surveyed users reportedly identify the event as a technical problem, which means many do not submit a support request. The first automatic renewal is especially consequential: approximately half of monthly subscribers and three-quarters of annual subscribers discontinue at that point. Remediation is difficult because Apple, Google, and Stripe control payment and retry permissions, grace-period rules vary across iOS, Android, and the web, and new payment APIs may require system migration.

The speaker reported that 59.6% of paid conversions occur on the first day. Yet mobile payment screens are comparatively difficult to modify: even a copy change may require app review and a new release. He also challenged the assumption that shorter trials perform better, reporting that a 32-day trial converted at 1.7 times the rate of trials lasting four days or fewer.

The proposed intervention was server-driven screen configuration. Moving trial length, pricing copy, and discount timing from application code into configuration can allow teams to test several variants without a release. He cited one reverse-trial case—in which all paid features were available initially and reverted to a free tier when the trial ended—where conversion increased from 0.4% to 4.5%.

He also discussed revenue loss caused by plan-change configuration. Google Play offers six methods for calculating the remaining subscription period when a user changes plans; an inappropriate selection can provide paid access without corresponding revenue. For 10,000 users moving from a $9.99 monthly plan to a $99.99 annual plan, he estimated the difference at approximately $50,000. Because the cause may be only one or two configuration lines, it is not necessarily visible as such in analytics dashboards.

---

## Brand citation in generative search

Jo Kyung-sang, CEO of NNT, presented observations drawn from more than 200 search-optimisation projects. The figures below are reported from that presentation and should be read as project findings rather than general causal estimates.

In an analysis of 840 ChatGPT responses concerning one global brand, none cited the brand's official Korean channels. Jo argued that, when authoritative material is absent, a system may instead rely on third-party sources or unsupported inferences.

NNT refers to work intended to improve a brand's representation and citation in AI-generated answers as generative engine optimisation (GEO). Its framework contains four areas: sales; marketing, divided into human-written content and automated production; public relations and communications; and technology and operations.

Where a person might produce 18–30 pieces of content per month, automated systems can generate thousands. Jo cautioned, however, that undifferentiated machine-generated text can reduce site quality and search visibility. He described a food brand that used lower-risk queries such as “calories in X” and incorporated proprietary real-time search data and customer reviews. In the cases presented, pages with reviews showed purchase-conversion rates 8–19 times those of pages without them.

The public-relations argument followed the same logic. Systems such as ChatGPT and Gemini may decompose a question into subqueries and draw on community sources where authoritative material is unavailable. Supplying reliable information for those subqueries can therefore influence how a system describes a brand.

The presentation reported the following findings:

- A document ranking first on Google has a reported probability above 40% of being cited in an AI answer, with comparatively high citation rates through positions 1–7. This association does not establish causation, but it suggests that GEO overlaps with conventional search optimisation
- Roughly 70% of all citations come from about 30 sites
- Longer, more detailed content reportedly performs better when structured with a summary first, followed by evidence and supporting detail

He proposed three conditions for useful content: a distinctive analytical perspective, proprietary evidence, and a precisely defined audience. Rather than a broad category such as “women in their thirties who buy cars,” he recommended a concrete profile specifying age, income, budget, preferences, and commute. He also advised placing key points first, using question-and-answer structures where appropriate, and naming relevant brands, products, people, and figures.

He concluded that interfaces and usage patterns will continue to change, making short-lived technical tactics an insufficient strategy. The more durable question is which activities become more valuable as AI improves; his answer was the production of substantive, original content.

---

## From cost per install to lifetime value

Kim Sun-woo, Director at Mistplay, addressed the measurement of mobile-game marketing. Unless otherwise noted, the figures in this section are those reported in his presentation.

Kim reported that acquisition cost per install had increased by more than 48% on Android and by a factor of 3.5 on iOS. Over the same period, in-game purchase revenue reportedly grew by 4%, session counts by 12%, and playtime by 8%. He argued that installation is only the beginning of a sequence that includes first play, in-game progress, and payment, whereas many marketing budgets continue to optimise for installation alone.

As an alternative, he proposed rewards tied to playtime. These may be awarded at time intervals or upon reaching in-game milestones, such as clearing a stage, reaching level ten, making a first purchase, or joining a guild. In the cases presented, average playtime per game increased by 30% and daily active users by 20%. He emphasised the sequence: playtime increased before return on advertising spend. In his interpretation, the view that reward-driven users are low quality arose from rewarding installation rather than meaningful engagement.

For scale, he suggested extending proven reward models to services where reward-seeking behaviour is already established, including financial-app points, shopping cashback, and memberships. These channels reportedly reach more than forty million monthly users. In a Korean MMORPG case, a Chinese developer achieved 2.5 times its day-seven advertising-spend recovery target and a 40% next-day retention rate, 16 percentage points above conventional install-ad channels.

The presentation also described regional differences: users in the United States and United Kingdom were said to play several games concurrently, while users in Korea and Japan tended to concentrate on fewer games. On that basis, Kim recommended using rewards in Western markets to encourage return visits through new content and rotating events, and in East Asian markets to reinforce accumulated investment in characters, rankings, and equipment. These broad regional categories should be treated as reported marketing segments rather than universal user traits.

| Genre | Share of paying users | Time to first purchase | Characteristics |
| --- | --- | --- | --- |
| Puzzle | 7.3% | 1.6 days | Fastest and strongest purchase conversion |
| RPG | 5% | 1.7 days | Consistently high in both session count and time to purchase |
| Strategy | 4.3% | 2.2 days | Slowest, but the highest session count per user |

Evaluating a strategy-game campaign after seven days against a puzzle-game benchmark may therefore terminate a viable campaign prematurely. Kim recommended prioritising playtime and purchasing behaviour over cost per install on marketing dashboards. He also argued that marketing teams share responsibility for the path from installation to the game's core experience, and cautioned against transferring a campaign unchanged across markets or genres.

---

## Marketing strategies for cryptocurrency applications

Kim Jong-rim of Liftoff Mobile presented the following market figures and audience framework.

He reported 560 million cryptocurrency holders worldwide, equivalent to approximately 10% of the internet population, with annual growth of 32% over the preceding three years. He also stated that 78% of trades occur on mobile, although institutional and high-value investors remain active on desktop. His audience framework emphasised three tendencies: anxiety associated with news-driven volatility, engagement with check-in rewards and leaderboards, and responsiveness to trading rewards and cashback.

According to Kim, clients often operate cryptocurrency and prediction-trading services together. He placed the cryptocurrency market at $2.16 trillion while noting that it can decline by 50% from a peak. Prediction trading allows probabilities to change as an event unfolds—for example, after a goal in a football match—and was reported to be growing at 303%. The presentation did not specify the period or denominator for this growth figure.

| Group | Message | Ad creative |
| --- | --- | --- |
| New | “Start from ₩10,000” — clear explanation rather than exaggeration | App screens showing registration, asset review, and purchasing |
| Anxious | “Now is your opportunity”; “Others have already begun” | Rising cryptocurrency charts and live price movements |
| Steady-return | Long-term investing, automated returns, regular rewards | Six-month trends instead of short-term dip charts |
| High-value | Dedicated support, trading stability, and strong security | Platinum cards and hotel or airline benefits |

For new users, the speaker reported that demonstrations of usability perform better than provocative messages. Prediction-trading companies also use game-like creative, such as asking users to predict a player's scoring total, which reportedly produces a comparatively high click-through rate.

The proposed placement strategy also varied by segment. Casual games and lifestyle or entertainment apps were recommended for reaching new users; finance, weather, and news apps for the anxious and steady-return groups; and sports apps for prediction-trading users. A further strategy targets established high spenders, based on the claim that the top 10–20% of users often account for 70–80% of revenue. This may increase revenue per user but limits audience scale. Timing also matters: because activity increases immediately before a match, Kim recommended concentrating budget in the four hours before kickoff rather than distributing it evenly.

---

## Organisational redesign for AI-supported work

This panel brought together leaders responsible for AI adoption at Ajungdang and Kurly.

Kurly reported that producing a product-detail page required an average of two to four weeks, progressing from a merchandiser's brief through editing, design, and final approval. Adding AI separately to each stage produced little reduction in total time because handoffs remained the bottleneck. After redesigning the process so that a merchandiser could produce the complete page with one AI tool, the reported production time fell to as little as two to three hours. The change raised questions about roles and responsibilities, including ownership of page production and design standards.

> For more than 80% of work, the real problem is the cost of communication and the cost of decisions. A unit task finishes quickly with GPT or Claude, but work entangling several teams and stakeholders does not.

Ajungdang discussed customer consultation. Its interface offers “call” and “request a consultation,” but even with approximately 300 agents, demand can produce delays during which prospective customers may choose a competitor. The company therefore uses an AI system to call immediately after a consultation request, conduct an initial conversation, transcribe it, and pass structured notes to the customer-management system for a human agent. The company reported subsequent increases in both conversion and revenue.

The two companies diverged on what to tackle with AI first.

| | Ajungdang | Kurly |
| --- | --- | --- |
| Starting point | Implementation alone is no longer a differentiator | Cost-reduction methods transfer between organisations more readily than revenue-growth methods |
| Deciding question | Does the intervention reduce time and cost, and can it extend beyond the originating team? | Which functions account for the largest share of personnel? |
| How to identify work | Identify duplicated development across teams while preserving voluntary experimentation | Aggregate work-management records and identify highly repetitive tasks |
| Direction | Tools that individuals and teams can adapt | Focus on tools for merchandising and development, the functions with the largest headcounts |

The companies adopted contrasting diffusion strategies. Ajungdang enables practitioners to build their own tools. A centrally distributed data-analysis tool saw little use after one week, whereas hackathons and workshops encouraged voluntary development. Once the number of tools exceeded thirty to forty, however, management demands and AI-usage costs increased. The company introduced guidance and rules, reported compliance of approximately 50%, and began establishing a dedicated review role. It identified a weekly thirty- to sixty-minute internal meeting for sharing recent experiments as its most effective intervention.

Kurly described a more executive-led approach centred on three measures. First, roles must be redefined: reducing communication overhead requires individuals or teams to assume broader responsibilities, which depends on executive support. Second, tools should be accessible without requiring non-developers to install development software. Third, the company found substantive mandatory training more effective than optional instruction.

When asked how marketing changes, Ajungdang emphasised validation. If teams can produce hundreds of prototypes quickly, the remaining work is to test, revise, and identify effective options. As production becomes less expensive, evaluation becomes more important. Kurly reported that one marketer manages the US launch of its beauty brand from content planning through TikTok and Amazon setup to operations. Work that previously required a team can therefore shift expenditure from staffing to advertising and change the target return.

A Kurly panelist, drawing on experience with 100 apps and 300 projects since 2009, argued that single-app development is becoming less viable at company scale. In this account, a solo product earning several million won per month may remain sustainable, whereas a team of five or more may struggle to achieve an adequate return. This was a practitioner judgment, not a general market estimate.

The panel concluded with two recommendations. Decision-makers should treat AI adoption as an organisational-design question and redefine roles to reduce communication costs. Practitioners should begin problem definition with available data. The panelists also observed that employees who prioritise work against organisational goals and collaborate effectively tend to direct AI systems effectively.

---

## Event and source details

MGS WEEK 2026 (2026.07.21, Westin Seoul Parnas). The slogan was "Stack AI, Rewrite Everything".

**Main Hall**

- **What's blocking your app's growth may be engineering, not growth strategy** — Eom Jae-woong (Senior DevRel Engineer, RevenueCat) · 10:15–10:40

**Play Hall**

- **Beyond the ROAS Wall: past CPI, toward LTV** — Kim Sun-woo (Director & Commercial Director, Mistplay) · 10:55–11:20
- **Which brands does AI cite?** — Jo Kyung-sang (CEO, NNT) · 11:30–11:55
- **The crypto UA playbook: optimal creative and targeting strategy per user persona** — Kim Jong-rim (Liftoff Mobile, Pan-APAC) · 12:05–12:30

**Main Hall (continued)**

- **AI & agentic workflows: redesigning organisational operations and growth** — moderator Nam Sung-pil (CEO, AB180), panel Lee Ha-seok (Head of Marketing, Ajungdang) · Kwak Geun-bong (Head of AX Centre, Kurly) · 18:35–19:00

**Further reading**

- [MGS 2026 field sketch — "Time to rewrite marketing with AI" (AB180, 2026.08.03)](https://blog.ab180.co/posts/mgs-2026-recap) — the organiser's full recap of the event
`
