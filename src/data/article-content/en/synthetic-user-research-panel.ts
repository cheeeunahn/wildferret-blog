export const syntheticUserResearchPanelContentEn = `Product design repeatedly raises two questions: how would a user respond to this screen, and how would they interpret this concept? Direct research with participants remains the most reliable way to answer them. When recruitment is not feasible, however, an interim method can help identify questions for later validation. A frontend platform engineer and I built a tool for that purpose.

The result is a **synthetic user panel**: a set of virtual personas grounded in prior user research that can provide preliminary responses to a screen or concept. It is not a substitute for research with people.

---

## It started as a hackathon idea

The initial prototype accepted a screenshot or Figma link and a brief description of the context. Several synthetic personas then responded in distinct voices, reporting a first impression, potentially confusing wording, and a trust score.

![A presentation slide showing the four MVP screens, from upload through to report](/assets/images/synthetic-user-research-panel-challenge-mvp-slide.webp)

After the hackathon, we continued to refine the prototype through demonstrations to product designers and feedback sessions.

---

## Giving the personas an evidential basis

The personas were constructed in two stages. Demographic data established each profile's basic characteristics, while prior research supplied service-specific attitudes and observed patterns.

**① Population data.** I used NVIDIA's publicly available Nemotron-Personas-Korea dataset to establish profile attributes such as age, occupation, region, education, and household composition. These attributes provide demographic coverage; they do not make an individual persona statistically representative by itself.

**② Empirical user-research data.** I then incorporated research accumulated by our service: nearly one hundred usability tests, in-depth interviews, concept tests, surveys, and weekly voice-of-customer analyses conducted over several years.

Because the material was distributed across PDFs, slide decks, and transcripts, it could not be used directly. I [reorganised the research into a wiki structured for LLM access](/en/article/research-wiki-for-llm), then derived persona attributes from it. These included income structure, service comprehension, mental model, digital literacy, cost sensitivity, trust posture, and anticipated friction points. Each persona contained more than ten such attributes, all linked to existing evidence rather than invented to complete the profile.

The following abbreviated example shows the structure of one persona.

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

I also recorded metadata at the panel level.

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

  "personas": [ /* the objects we saw above */ ]
}
~~~

\`framework\` defines vocabulary shared across the panel, \`demographic_basis\` records the observed distribution of sign-ups, and \`evidence_caveats\` documents limitations in the underlying research. The file also specifies that the system must not infer persona attributes in areas unsupported by a study.

---

## The three prompts I used

**The persona prompt.** This prompt asks the model to respond to a screen from the persona's perspective. In addition to the profile, it supplies fourteen attributes derived from user research, including mental model, cost sensitivity, reading and scrolling behaviour, trust posture, and recurring sources of difficulty.

The prompt evaluates four dimensions: wording, dark patterns, emotion, and usability. Internal UX-writing principles, dark-pattern guidance, and ten established usability heuristics provide evaluation criteria. The generated response does not cite these frameworks; it describes the resulting experience in ordinary language—for example, “Where is the button to turn this off?” rather than “This is a dark pattern.”

To model register, I identified recurring linguistic features in more than one hundred thousand survey comments from the service, including brief answers, spacing errors, typographical errors, and inconsistent sentence endings. The prompt uses these features to avoid producing polished report prose that would be uncharacteristic of the source responses.

The prompt also guards against forced criticism. Each item defaults to “fine,” and a negative response should appear only when the persona identifies a specific problem. The output contains five categories—first impression, problematic wording, dark patterns, heuristic issues, and emotion—along with trust and usefulness scores.

**The heuristic-evaluation prompt.** This separate prompt adopts an expert register, assesses the screen against ten usability heuristics, and records supporting evidence and potential improvements. It may cite only visible interface elements. Items that cannot be assessed from a screenshot receive no score. Keeping this stage separate prevents persona reactions from being conflated with an expert evaluation.

**The report-generation prompt.** This prompt consolidates responses from multiple personas. The summary groups only claims made by the panel; recommendations appear in a separate final section and must be supported by the preceding evidence.

The following excerpts show the principal constraints in each prompt:

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

## Observed uses

An examination of the call logs identified twenty-seven distinct use contexts. Fifteen involved screen evaluation; the remainder involved concept evaluation without a screen or follow-up questions.

Requests fell into five broad categories.

- **A single screen**: the home screen on first opening the app, the redesigned step counter, the new-user attendance event, the entry screen arrived at via a notification message
- **A specific point in a flow**: "I've just finished filing and landed on the completion screen" — writing out the path by which the user met that screen
- **A concept with no screen yet**: “We are considering a feature like this; what do you think?” These requests accounted for roughly one-third of calls and occurred during specification, before a Figma design existed
- **An entire specification**: some users supplied a complete draft product-requirements document and requested responses
- **Digging deeper**: "did you understand the overall context, was it hard?", "what do you think happens if you press this button?"

The prototype was designed for screenshot evaluation, but actual use extended from reviewing draft specifications to checking individual lines of entry-point copy.

---

## A worked example: evaluating an attendance event screen

The following example is adapted from an observed workflow. Input typically consists of two elements: the path by which the user reached the screen and the purpose of the screen.

~~~
Context: Arrived by tapping the [Check in and get a coffee coupon] banner at the top of home
Screen:  Attendance reward screen shown to new users.
         Is it understandable at a glance? Would they keep participating?
+ 1 screenshot
~~~

Three panel members produced the following responses.

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

Usefulness scores ranged from 2 to 10, but all three responses addressed the same discrepancy: the entry banner promised a coffee coupon for checking in, while the event screen required ten stamps. Persona A accepted the discrepancy, Persona B described it as “slightly deceiving,” and Persona C called it “a trick.”

The evaluator can then direct a follow-up question to a specific persona—for example, asking Persona C how the banner could state the condition more clearly—and receive a response in the same register.

---

## Appendix: where this project started

The tool originated during the second day of an internal “AI Week.” Approximately forty teams and more than eighty participants took part voluntarily, with developers and non-developers forming teams to address workplace problems within one day. The winning project was an internal communication platform that used retrieval-augmented generation (RAG) to answer questions about company policies and announcements.

- [3o3 holds "AI Week", accelerating its AI-native transition (2026.06.29)](https://blog.3o3.co.kr/260629-news/)
- [Jobis&Villains' AI voyage has begun (2026.07.10)](https://blog.3o3.co.kr/culture-ai-week/)`
