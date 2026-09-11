export const syntheticUserReadingContentEn = `## Abstract

Studies reporting closer correspondence between synthetic and human responses rely on data collected directly from people, including extended interview transcripts and survey responses. The literature reviewed here does not support replacing human participants with synthetic users. It instead positions synthetic users as an auxiliary method for preliminary hypothesis assessment or question refinement in domains with substantial prior research. Even in this limited role, responsible use requires adequate empirical grounding, critical examination of generated responses, and an explicit validation procedure.

---

This review was undertaken following the development and deployment of a [synthetic user panel](/en/article/synthetic-user-research-panel). It synthesises relevant research and practitioner presentations; AI tools were used to assist with organising the source material.

---

## Definition and context

[Gu, Chandrasegaran, and Lloyd (2025)](https://doi.org/10.1017/S0890060424000283) define a **synthetic user** as a persona grounded in empirical data whose gaps are filled with synthetic data. Unlike a conventional static persona document, a synthetic user acts as an interactive conversational representation.

![The landing page of a synthetic user service, headlined "User research. Without the users."](/assets/images/synthetic-user-reading-service-landing.webp "Source: [Synthetic Users: If Nothing Is Real, Everything Is Permitted](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024")

[Salminen, Amin, Jung, and Jansen (2025)](https://doi.org/10.1145/3745900.3746108) describe growing industrial interest in synthetic users. They identify several contributing factors, including privacy constraints, difficulty quantifying the value of user research, and the cost of recruiting participants.

![Illustration of three people at a meeting table, facing four virtual participants rising like holograms from a screen and a phone, taking part in the conversation](/assets/images/synthetic-user-reading-panel-interview.webp "Seating synthetic users at the interview table instead of recruiting real participants (AI-generated)")

---

## Limitations of synthetic users without empirical grounding

An LLM generates responses from patterns learned during training; it cannot independently recover experiences absent from its data and context. Without specific grounding, it tends to produce generic descriptions rather than accounts tied to an identifiable population. Fluent language can also make weakly supported content appear credible. Salminen et al. (2025) identify this capacity to produce plausible but inaccurate imitations as a central risk.

From a practitioner perspective, [Rosala and Moran (2024)](https://www.nngroup.com/articles/synthetic-users/) offer a related critique. Synthetic users may be sycophantic and more positive than real participants. They may label many needs as important without distinguishing priorities, and generated statements do not constitute observed behavioural data. Moreover, opaque training corpora make it difficult to determine which biases inform a response.

---

## Improving correspondence with human responses

Studies reporting improved correspondence begin with material collected from people. Rather than relying only on attributes such as age and occupation, several methods provide extensive first-person narratives.

[Kang et al. (2025)](https://arxiv.org/abs/2504.11673) use this approach in Deep Binding. Instead of enumerating attributes, the method supplies transcripts from several interview sessions as background narrative, drawing on the concept of narrative identity. The authors report an 87% improvement, measured by Wasserstein distance, in reproducing the response distribution of a political-orientation survey.

[DeepPersona (2025)](https://arxiv.org/abs/2511.07338) combines both approaches, providing each persona with several hundred structured attributes and approximately 1 MB of descriptive prose. The authors report improvements of 32% in attribute diversity and 44% in profile uniqueness over prior methods, as well as a 31.7% reduction in the difference between synthetic and human responses on social surveys.

![Diagram of DeepPersona's two-stage pipeline. On the left, extracting attributes from self-disclosure Q&A; in the middle, filtering the extracted attributes and merging them into a human attribute tree; on the right, filling values from that tree to generate a narrative profile](/assets/images/synthetic-user-reading-deeppersona-pipeline.webp "Source: [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025, Figure 2")

These results depend on how accuracy is defined. A common method administers the same survey to people and their synthetic representations, then measures agreement. This method assumes that human responses provide a stable reference, an assumption examined by Park et al. (2024).

[Park et al. (2024)](https://arxiv.org/abs/2411.10109) conducted two-hour interviews and administered surveys, including items from the General Social Survey and Big Five inventory, to 1,052 US adults. Two weeks later, they repeated the survey to measure within-person consistency and administered the same items to agents constructed from the initial data.

For General Social Survey items, participants reproduced their earlier responses 79.53% of the time, while interview-grounded agents matched participants' responses 65.67% of the time. Thus, even human responses differed in roughly one-fifth of cases over two weeks. Stability also varied by instrument: the correlation between first and second responses on Big Five items was 0.95. The authors therefore normalise agent accuracy by human self-consistency: the agent–participant match rate divided by the participant test–retest match rate.

Other work collects human data repeatedly rather than at a single point. The hybrid panel proposed by [Romberg et al. (2026)](https://arxiv.org/abs/2608.22582) combines human respondents and an LLM within one panel. After each survey round, the method identifies divergences and recalibrates the model for the next round. Participants also review whether responses generated on their behalf are reasonable.

---

## Appropriate uses and limits

Any reported accuracy remains conditional on a particular context. [Anand (2026)](https://www.youtube.com/watch?v=YnNF55QV0zs) compares synthetic panels to weather forecasts: both are useful only within defined conditions. A synthetic persona should therefore be used only within the scope represented by its grounding data.

![A talk slide comparing synthetic personas to weather forecasting across fourteen principles](/assets/images/synthetic-user-reading-weather-forecast-personas.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

Anand also distinguishes between what people say and what they do. Training data contain abundant linguistic expression but do not directly represent behaviour. LLMs may therefore reproduce stated attitudes more successfully than actual choices. Citing work by Hewitt et al. on predicting experimental results, the talk reports stronger performance on attitude surveys than on field experiments measuring behaviour.

![A talk slide comparing, experiment by experiment, how attitude prediction is easier than behaviour prediction](/assets/images/synthetic-user-reading-attitudes-vs-actions.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

[Kuric, Demcak, and Krajcovic (2026)](https://arxiv.org/abs/2605.18302) reach a similar conclusion. They compared GPT-generated click predictions with twelve first-click tests involving 3,431 participants. Synthetic and observed click distributions differed significantly in 53% of tasks. Persona conditioning, step-by-step reasoning, and changes to sampling parameters did not improve correspondence.

![Box plots comparing synthetic and real responses on four measures: semantic diversity, word repetition, readability, and length](/assets/images/synthetic-user-reading-synthetic-vs-real-answers.webp "Source: [What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience](https://arxiv.org/abs/2605.18302) — Kuric, Demcak & Krajcovic, 2026, Figure 5")

---

## Conclusion and conditions for use

Across the studies reviewed here, improved synthetic representations depend on data collected from people. Deep Binding relies on extended interview transcripts; Park et al. (2024) use individual self-reports from interviews and surveys.

The available evidence does not justify replacing human-participant research with synthetic users. Their responsible use requires three conditions: sufficient research data in the relevant domain; critical examination and testing of generated responses; and an explicit procedure for validating those responses against human evidence.

![Illustration of two people around a desk looking at a screen together, comparing the answers on several floating synthetic persona cards against their source material](/assets/images/synthetic-user-reading-probing-answers.webp "Use synthetic users by continuing to question and test their answers rather than taking them as given (AI-generated)")

---

## References

- [Gu, K., Chandrasegaran, S., and Lloyd, P. (2025). “Synthetic users: insights from designers' interactions with persona-based chatbots.” *AI EDAM*.](https://doi.org/10.1017/S0890060424000283)
- [Salminen, J., Amin, R., Jung, S.-G., and Jansen, B. J. (2025). “The Use of Large Language Models in HCI: A Critical Analysis of Synthetic Users.” *Augmented Humans*.](https://doi.org/10.1145/3745900.3746108)
- [Park, J. S., et al. (2024). “Generative Agent Simulations of 1,000 People.”](https://arxiv.org/abs/2411.10109)
- [Romberg, J., et al. (2026). “Hybrid Panels: Toward Human-AI Collaboration in Survey Research.”](https://arxiv.org/abs/2608.22582)
- [Kuric, E., Demcak, P., and Krajcovic, M. (2026). “What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience.”](https://arxiv.org/abs/2605.18302)
- [Kang, B., et al. (2025). “Deep Binding of Language Model Virtual Personas.”](https://arxiv.org/abs/2504.11673)
- [“DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas.” (2025).](https://arxiv.org/abs/2511.07338)
- [Rosala, M., and Moran, K. (2024). “Synthetic Users: If Nothing Is Real, Everything Is Permitted.” Nielsen Norman Group.](https://www.nngroup.com/articles/synthetic-users/)
- [Anand, I. (2026). “Persona Engineering: A Field Guide to AI Synthetic Personas.” AI Engineer World's Fair.](https://www.youtube.com/watch?v=YnNF55QV0zs)

`
