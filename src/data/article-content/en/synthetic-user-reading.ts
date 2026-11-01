export const syntheticUserReadingContentEn = `## Summary

- Several studies report that supplying interview transcripts or survey responses makes synthetic users answer more like real people. However, a result obtained on one survey cannot simply be carried over to a different situation.
- Reproducing survey answers and predicting actual behavior are different abilities. In a study that predicted where people would click on a screen, adding personas did not improve accuracy.
- Based on what I have read, synthetic users could be used to check hypotheses or questions in advance in fields where research data already exist. A procedure for comparing their responses against real data is still necessary.

---

After building a synthetic user panel and using it in my work, I began to wonder how far its answers could be trusted. I therefore looked up and read the relevant research and talks, then organized what I learned with the assistance of artificial intelligence (AI).

---

## A persona that answers questions

[Gu, Chandrasegaran, and Lloyd (2025)](https://doi.org/10.1017/S0890060424000283), of Delft University of Technology, propose using the term **synthetic user** for a persona that is based on real data but uses synthetic data to fill the gaps. Such a persona can be asked questions and will give answers.

![The landing page of a synthetic user service, headlined "User research. Without the users."](/assets/images/synthetic-user-reading-service-landing.webp "Source: [Synthetic Users: If Nothing Is Real, Everything Is Permitted](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024")

[Salminen, Amin, Jung, and Jansen (2025)](https://doi.org/10.1145/3745900.3746108) identify three factors behind the spread of synthetic users: privacy regulations, the difficulty of demonstrating the value of research in numbers, and the cost of recruiting participants.

![Illustration of three people at a meeting table, facing four virtual participants rising like holograms from a screen and a phone and taking part in the conversation](/assets/images/synthetic-user-reading-panel-interview.webp "Seating synthetic users at the interview table instead of recruiting real participants (AI-generated)")

---

## Problems with synthetic users created without research data

When a synthetic user is created without data from real participants, it is difficult to verify whether it reproduces any particular person's experience. It may draw familiar patterns from its training data and produce a generic description of a user. If the sentences read naturally, such answers can still come across as real experience. Salminen et al. (2025) identify this kind of plausible, but factually inaccurate, imitation as a risk.

[Rosala and Moran (2024)](https://www.nngroup.com/articles/synthetic-users/) of Nielsen Norman Group point out the problems that arise in practice. Synthetic users tend to please the person interacting with them, so they answer more favorably than real users would. They also describe every need as important, which makes priorities difficult to establish. Their answers alone cannot provide data from observing actual behavior. Nor is it possible to verify what biases are present in the internet data used to train them.

---

## Supplying interview and survey data

Some studies attempt to improve the accuracy of responses by supplying interview transcripts or detailed profiles. These include not only attributes such as age and occupation but also how the person describes their own experiences.

Deep Binding, proposed by [Kang et al. (2025)](https://arxiv.org/abs/2504.11673), supplies transcripts from several interview sessions as the persona's background narrative. Its design applies narrative identity theory, which holds that people form their identities by organizing their lives into stories. On a political-orientation survey, the authors report that the difference between the distributions of synthetic and actual responses fell by 87%, measured by Wasserstein distance.

[DeepPersona (2025)](https://arxiv.org/abs/2511.07338) gives each persona several hundred structured attributes together with approximately one megabyte (MB) of descriptive prose. Compared with prior methods, the authors report that attribute diversity improved by 32% and profile uniqueness by 44%, and that the difference between synthetic and actual responses in social surveys fell by 31.7%.

![Diagram of DeepPersona's two-stage pipeline. On the left, attributes are extracted from self-disclosure questions and answers; in the middle, the extracted attributes are filtered and merged into a human attribute tree; on the right, values from that tree are populated to generate a narrative profile](/assets/images/synthetic-user-reading-deeppersona-pipeline.webp "Source: [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025, Figure 2")

When accuracy is measured by agreement with survey responses, it must be remembered that the answers of the people being compared against can also change.

[Park et al. (2024)](https://arxiv.org/abs/2411.10109) conducted two-hour interviews and surveys, including the General Social Survey (GSS) and the Big Five personality inventory, with 1,052 adults in the United States. Two weeks later, they administered the same surveys again to measure how closely each participant's two sets of answers agreed. They also asked agents created from the first round of data the same questions.

On GSS items, participants' two sets of answers agreed 79.53% of the time, while agents created from interview transcripts matched participants' answers 65.67% of the time. In other words, about 20% of the human answers changed as well. On the Big Five, the correlation between first- and second-round responses was 0.95.

The authors adjust agent accuracy to account for these retest results. For the GSS, they divide the agent's agreement rate by the participants' self-agreement rate. Dividing 65.67% by 79.53% gives a normalized accuracy of approximately 0.83. This figure does not mean that the agents matched people's answers 83% of the time.

The hybrid panel proposed by [Romberg et al. (2026)](https://arxiv.org/abs/2608.22582) places human respondents and a large language model (LLM) together and collects data continuously. In each repeated survey, it identifies where the two sets of answers diverge and corrects the model. It also includes a procedure in which people review the responses the LLM generates.

---

## Matching survey answers does not mean predicting behavior

In a talk, [Anand (2026)](https://www.youtube.com/watch?v=YnNF55QV0zs) compares synthetic panels to weather forecasts. Just as one checks the range a forecast applies to, one must check which situations a synthetic persona's training data actually cover.

![A talk slide comparing synthetic personas to weather forecasts across fourteen principles](/assets/images/synthetic-user-reading-weather-forecast-personas.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

The talk cites research by Hewitt et al. that used LLMs to predict experimental results. Prediction accuracy was lower for field experiments that observed actual behavior than for experiments that asked about attitudes in surveys. Anand points to the gap between what people say, which is what LLMs learn from, and what people actually do.

![A talk slide comparing, experiment by experiment, why predicting attitudes is easier than predicting behavior](/assets/images/synthetic-user-reading-attitudes-vs-actions.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

[Kuric, Demcak, and Krajcovic (2026)](https://arxiv.org/abs/2605.18302) tested the behavioral predictions of a generative pre-trained transformer (GPT) against twelve first-click tests from real user experience (UX) research, involving 3,431 participants. The model was asked to predict where people would click on a screen, and in 53% of all tasks the click distribution of the synthetic responses differed significantly from the actual one. Assigning personas, step-by-step reasoning, and adjusting sampling parameters did not improve accuracy.

![Box plots comparing synthetic and actual responses on four measures: semantic diversity, word repetition, readability, and length](/assets/images/synthetic-user-reading-synthetic-vs-real-answers.webp "Source: [What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience](https://arxiv.org/abs/2605.18302) — Kuric, Demcak & Krajcovic, 2026, Figure 5")

---

## What to check when using synthetic users

In Deep Binding and in Park et al., the data used to reproduce responses were interviews and surveys of real people. Research with people was also needed to obtain those data and to check how closely the synthetic responses matched. These results are therefore difficult to cite as grounds for skipping research with human participants.

When I use a synthetic panel in practice, I intend to check the following:

- Does the field in question have sufficient data obtained from real people, such as interviews or surveys?
- Can the hypotheses formed, or the questions refined, on the basis of synthetic responses be checked in real research?
- Is there a procedure for comparing synthetic responses against real data and correcting them when they diverge?

![Illustration of two people seated around a desk and looking at a screen together, comparing the answers on several floating synthetic persona cards with source material](/assets/images/synthetic-user-reading-probing-answers.webp "Continue questioning and testing synthetic-user responses rather than accepting them at face value (AI-generated)")

---

## References

- [Gu, Chandrasegaran & Lloyd, "Synthetic users: insights from designers' interactions with persona-based chatbots"](https://doi.org/10.1017/S0890060424000283) — *AI EDAM*, 2025. The paper that proposes the concept of synthetic users
- [Salminen, Amin, Jung & Jansen, "The Use of Large Language Models in HCI: A Critical Analysis of Synthetic Users"](https://doi.org/10.1145/3745900.3746108) — *Augmented Humans*, 2025. The factors behind the spread of synthetic users, the associated risks, and the conditions under which they can and cannot be used
- [Park et al., "LLM Agents Grounded in Self-Reports Enable General-Purpose Simulation of Individuals"](https://arxiv.org/abs/2411.10109) — 2024. A study that first measured variation in human responses by surveying 1,052 adults in the United States again after two weeks. For the General Social Survey, participant self-consistency was 79.53%, raw accuracy for interview-grounded agents was 65.67%, and normalized accuracy was 0.83
- [Romberg et al., "Hybrid Panels: Toward Human-AI Collaboration in Survey Research"](https://arxiv.org/abs/2608.22582) — 2026. A design that places a human panel and an LLM in the same survey and recalibrates the model after each survey round. In a German pilot with 1,201 participants, willingness to participate was 83% versus 69%
- [Kuric, Demcak & Krajcovic, "What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience"](https://arxiv.org/abs/2605.18302) — 2026. An evaluation of GPT's click predictions using twelve real-world first-click tests with 3,431 participants. Distributions differed significantly in 53% of tasks, and personas, step-by-step reasoning, and sampling adjustments produced no improvement
- [Kang et al., "Deep Binding of Language Model Virtual Personas"](https://arxiv.org/abs/2504.11673) — 2025. Improved reproduction of political-orientation survey response distributions by providing interview transcripts as background narratives, with an 87% improvement by Wasserstein distance
- [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025. Personas that combine hundreds of structured attributes with approximately 1 MB of narrative text
- [Rosala & Moran, "Synthetic Users: If Nothing Is Real, Everything Is Permitted"](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024. A practitioner critique that highlights sycophancy and excessive optimism, the absence of prioritization, and the lack of behavioral data, while limiting the circumstances in which synthetic users are appropriate
- [Anand, "Persona Engineering: A Field Guide to AI Synthetic Personas"](https://www.youtube.com/watch?v=YnNF55QV0zs) — AI Engineer World's Fair, 2026. The weather-forecast analogy and the gap between attitudes and behavior

`
