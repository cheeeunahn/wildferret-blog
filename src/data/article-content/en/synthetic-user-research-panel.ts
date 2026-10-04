export const syntheticUserResearchPanelContentEn = `When working on design or product planning, I repeatedly encounter the same questions: “How will real users feel about this screen? What will they think when they see this concept?” The surest way to find out is to meet users directly, whether through usability testing or another form of research. Yet there are times when, for unavoidable reasons, there is simply no capacity to recruit users. For those occasions, I worked with an exceptionally talented frontend platform engineer on a tool that could help.

That tool is a **synthetic user panel**: it shows a screen first to virtual users created from user research data, rather than to real users.

---

## It began as a hackathon idea

The idea began as a simple tool: provide a screenshot or Figma link and a one-line description of the context, and several synthetic personas would view the screen and respond in their own voices. After a screenshot was uploaded, each persona would give a first impression, flag wording that gave them pause, and provide a trust score.

![A presentation slide showing the four minimum viable product (MVP) screens, from upload through to report](/assets/images/synthetic-user-research-panel-challenge-mvp-slide.webp)

It seemed too valuable to leave behind as a hackathon project, so after the challenge ended, the engineer and I continued refining it, showing it to product designers and gathering their feedback.

---

## Grounding the personas in evidence

The personas were created in two stages. Demographic data provided a broad outline of “who this person is,” while research data supplied the details of “how this person actually responds.”

**① Statistically representative demographic data.** I used NVIDIA's Nemotron-Personas-Korea, a public synthetic-persona dataset based on Korean demographic statistics, to establish basic profile attributes such as age, occupation, region, education level, and household composition.

**② Directly observed behavioural data.** I then layered in the user experience (UX) research accumulated within our service: nearly one hundred usability tests, in-depth interviews, concept tests, surveys, and weekly voice-of-customer (VOC) analyses conducted over several years.

Because this material was scattered across PDFs, presentation decks, and transcripts, it could not be used as it was. I first [organised the research into a wiki that a large language model (LLM) could read](/en/article/research-wiki-for-llm), then used that wiki to populate the persona attributes. These included income structure, service comprehension, mental model, digital literacy, cost sensitivity, trust posture, and anticipated friction points. Each persona required more than ten attributes, and the wiki meant that I did not have to fill those fields from imagination.

The following abbreviated example illustrates the structure of a single persona.

~~~json
{
  "segment": "New user",
  "uuid": "123456789",

  "persona": "Fictional person A is 34, runs a pet supply shop in a small
              city, and treats conversations with her regulars as the
              highlight of her day.",
  "sex": "Female",
  "age": 34,
  "occupation": "Self-employed, retail",
  "education_level": "Four-year university",
  "district": "○○ Province — ○○ City",
  "family_type": "Two-person household with spouse",
  "hobbies_and_interests": "At weekends, walks the dog along the nearby river (...)",

  "service_profile": {
    "usage_context": "Every time she opens the app, the first thing that
                      arrives is the worry 'what if I tap the wrong thing'.
                      She comes in only when she has something to do, and
                      pauses at each step to re-read the screen.",
    "service_comprehension": "Low. The very concept of what the service does for her is unfamiliar",
    (...)
  }
}
~~~

I also devoted considerable attention to the persona metadata.

~~~json
{
  "version": "2.x",
  "last_updated": "2026-08-06",
  "source": "Demographic dataset + N internal user research studies",
  "purpose": "Synthetic research panel for evaluating screens and flows",

  "demographic_basis": { "...": "Gender and age distribution of real signups" },
  "research_basis":    ["ut_...", "survey_...", "..."],
  "evidence_caveats":  ["Do not read this evidence as ..."],

  "framework":      { "...": "Vocabulary shared across the whole panel" },
  "profile_schema": { "...": "What each attribute field means" },

  "segmentation_axis":   "...",
  "segment_distribution": { "...": "Headcount per segment" },
  "panel_design":        { "...": "Why these particular people were chosen" },

  "personas": [ /* persona objects of the form shown above */ ]
}
~~~

\`framework\` defines the vocabulary shared across the panel, \`demographic_basis\` records the actual gender and age distribution of registered users, and \`evidence_caveats\` documents the limitations of the research used as evidence. The file also establishes that areas for which no research exists must not be synthesised into the personas.

---

## The three prompts

**The persona prompt.** Its role is to respond to the screen “as this person.” In addition to the persona profile, the prompt injects fourteen attributes drawn from actual user research, including mental model, cost sensitivity, how the person reads a screen, scrolling tendencies, trust posture, and likely sticking points.

There are four assessment dimensions: wording (UX writing), dark patterns, emotion, and usability. Behind them are hidden evaluation criteria drawn from internal UX-writing principles, internal dark-pattern guidelines, and ten widely used usability principles. The persona knows these principles but never cites them, speaking only about how the interface feels. For example, the response says, “Where is the button to turn this off?” rather than, “This is a dark pattern.”

I paid close attention to the voice as well. From well over one hundred thousand responses to service surveys, I extracted patterns such as short, clipped answers, missing spaces and typographical errors, and mixed sentence endings, then instructed the personas to imitate them. If the output reads like polished report prose, it does not sound like a user.

There is one further rule: the persona must not find fault with a perfectly sound screen merely to fill every field. The default for every category is “fine,” and the response should be negative only when something is clearly bothersome. The output is fixed at five categories, first impression, problematic wording, dark patterns, heuristics, and emotion, together with two scores for trust and usefulness.

**The heuristic-evaluation prompt.** This prompt uses an expert voice and is entirely separate from the persona evaluation. It scores the screen against ten usability principles and records the evidence and suggested improvements. The evidence may cite only elements actually visible on the screen. If an item cannot be judged from the screenshot alone, the prompt leaves it blank instead of forcing a score. I separated the two evaluations completely so that the persona's emotional response would not become mixed with the expert's dispassionate assessment.

**The report-generation prompt.** Its role is to consolidate multiple personas' responses into a single summary. The summary section only groups and organises what the panel said. Suggestions for improvement appear only in the final section, and the prompt must not invent new claims without evidence.

The following excerpts show a few of the decisive passages from the actual prompts:

~~~
[ PERSONA ROLEPLAY PROMPT ] excerpt

  You ARE the person below.
  React not as a UX expert, but as an ordinary real user of this app.

  [Your attitude toward {service name} (based on real research)]
  (Don't explain it — BEHAVE that way)
  - Mental model (what you take the app to be): {mental_model}
  - Trust posture: {trust_posture}
  …

  [Judgement calibration: no forced negativity]
  Do not nitpick a perfectly fine screen just to fill all four boxes.
  The default value for each item is 'fine / okay', and you react
  negatively only when something is definitely irritating.

  [Voice]
  - Short, clipped. Usually one or two words to a single sentence.
  - Spelling and spacing not perfect. ("soooo good", "got it", "doesnt work")
  - Never write in tidy report sentences.

  → Never cite rule numbers or principle names; just let out how it
    actually feels at the point where the standard was broken.


[ HEURISTIC EVALUATION PROMPT ] excerpt

  You are a senior usability expert evaluating mobile app UX.

  - For items that cannot be judged from the screenshot alone, put null
    instead of a score and write the reason in criteria. Do not
    manufacture a score by guessing.
  - In evidence, cite only elements actually visible on the screen.
    (e.g. "X button, top right", "grey 9pt helper text")
  …


[ SUMMARY REPORT PROMPT ] excerpt

  In the summary buckets, do not assign scores, judge launch readiness,
  or analyse "why this problem arose" — just organise what the panel said.
  Cover only improvements that actually surfaced in the statements and
  heuristics organised above, and do not invent problems that aren't
  there or ideas without evidence.
~~~

---

## Seeing how people actually used it

When I opened the call logs, I found many contexts I had never anticipated. Reviewing the queries revealed twenty-seven distinct contexts. Just over half, fifteen, involved screen evaluation; the remainder involved concept validation without a screen or follow-up questions.

The subjects of the requests varied widely.

- **A single screen**: the home screen on first opening the app, a redesigned step counter, an attendance event for new users, or an entry screen reached through a notification message
- **A particular point in a flow**: the requester also described the path that brought the user to the screen, such as, “I have just finished filing and reached the completion screen”
- **A concept with no screen yet**: “We are considering adding a feature like this. What do you think?” These accounted for roughly one in three calls. People used the panel to expose an idea to scrutiny at the planning-document stage, before it had even reached Figma
- **An entire planning document**: one person pasted in a complete draft product requirements document (PRD) and asked for reactions. I had never imagined the tool being used this way
- **A deeper follow-up**: “Did you understand the overall context, and was it difficult?” or “What do you think will happen if you press this button?”

I had built “a tool in which personas respond to a screenshot,” but people were using it both to review early planning drafts and to check a single line of entry-point copy. I found that fascinating.

---

## Example: evaluating an attendance-event screen

The following example is adapted from an actual workflow. The input is usually two lines: how the user encountered the screen and what the screen is.

~~~
Context: Arrived by tapping the [Check in and get a coffee coupon] banner at the top of home
Screen:  Attendance reward screen shown to new users.
         Is it understandable at a glance? Would they keep participating?
+ 1 screenshot
~~~

Placing the responses from three panel members side by side produces the following result.

~~~
[ A ]  Trust 9/10 · Useful 10/10
  First impression  "Tempting, they're giving out coupons, and the character's cute"
  Snagging wording  "'Tap once a day' is intuitive, I know exactly what to do"
  Dark patterns     Nothing in particular
  Emotion           Satisfied: "I come in every day anyway, might as well collect coupons"

[ B ]  Trust 8/10 · Useful 5/10
  First impression  "Cute, but having to fill the whole stamp card sounds like a lot of effort"
  Snagging wording  "'Awarded on completing 10 stamps' — ten days? deflating"
  Dark patterns     "Not quite bait, but I came in thinking one tap would do it
                     and seeing it's ten days does feel slightly deceived"
  Emotion           Indifferent: "Remembering to tap daily is a hassle, I'd quit after a few days"

[ C ]  Trust 3/10 · Useful 2/10
  First impression  "Thought checking in gave a coupon right away, and now they want ten stamps"
  Snagging wording  "Outside it said 'check in and get a coupon', then inside it's
                     'on completing 10 stamps' — that's absurd"
  Dark patterns     "Making it look instant then attaching conditions is straight-up a trick"
  Emotion           Disappointed: "Even the event is twisted like this, it's annoying"
~~~

The usefulness scores diverged sharply, at 10 and 2, but all three personas identified the same issue. The banner said, “Check in and get a coffee coupon,” while the screen revealed a requirement to collect ten stamps. Persona A merely overlooked the gap; Persona B felt “slightly deceived,” and Persona C called it “a trick.”

It is also possible to select a specific persona and explore the issue further. If I ask Persona C, “Then how should we change the banner wording so that it does not feel like bait?” the reply continues in that persona's voice.

---

## Appendix: where the project began

The internal artificial intelligence (AI) challenge that gave rise to this tool was held on the second day of the company's “AI Week.” Approximately forty teams and more than eighty people participated voluntarily. Developers and non-developers formed teams to solve problems of their choosing within a single day. The winning project was an internal communication platform that used retrieval-augmented generation (RAG) to learn from company policies and announcements and answer employees' questions conversationally.

- [3o3 holds "AI Week", accelerating its AI-native transition (2026.06.29)](https://blog.3o3.co.kr/260629-news/)
- [Jobis&Villains' AI voyage has begun (2026.07.10)](https://blog.3o3.co.kr/culture-ai-week/)`
