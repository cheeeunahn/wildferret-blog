export const syntheticUserReadingContentEn = `## Summary

- Every study that reports making synthetic users more like real people begins with data collected directly from people, such as lengthy interview transcripts or survey responses. In fields where such data are unavailable, it is difficult to make synthetic users behave like people.
- Most research published to date therefore concludes that synthetic users are unlikely to replace research with human participants. Instead, they are viewed as an auxiliary tool for preliminary hypothesis testing or refining questions in fields where substantial research data already exist.
- Even this use is subject to conditions: there must be sufficient research data in the field; responses from a synthetic panel should be discussed and tested rather than accepted at face value; and a procedure for validating the responses should be in place.

---

I became interested in synthetic panels after building a synthetic user panel myself and using it in practice. I therefore read the relevant research and talks, then organized what I learned with the assistance of artificial intelligence (AI).

---

## What is a synthetic user?

[Gu, Chandrasegaran, and Lloyd (2025)](https://doi.org/10.1017/S0890060424000283), of Delft University of Technology, propose using the term **synthetic user** for a persona that is based on real data but uses synthetic data to fill the gaps. Whereas a conventional persona is a document to be read, a synthetic user is a virtual conversational partner that responds to questions.

![The landing page of a synthetic user service, headlined "User research. Without the users."](/assets/images/synthetic-user-reading-service-landing.webp "Source: [Synthetic Users: If Nothing Is Real, Everything Is Permitted](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024")

According to [Salminen, Amin, Jung, and Jansen (2025)](https://doi.org/10.1145/3745900.3746108), the use of synthetic users in industry is growing. In some cases, privacy regulations have made it harder to meet real users. There is also the difficulty of quantifying the impact of user research. Above all, recruiting real participants costs money, and organizations tend to choose the less expensive option.

![Illustration of three people at a meeting table, facing four virtual participants rising like holograms from a screen and a phone and taking part in the conversation](/assets/images/synthetic-user-reading-panel-interview.webp "Seating synthetic users at the interview table instead of recruiting real participants (AI-generated)")

---

## Problems with synthetic users created without research data

A large language model (LLM) combines patterns in its training data, so it struggles to produce accounts that fall outside those patterns. Instead of a specific person's experiences, it offers generic user descriptions that seem familiar. Moreover, synthetic users are so articulate that even weak content can appear more credible than it is. More troubling than being wrong is not appearing to be wrong. Salminen et al. (2025) identify this plausible, but factually inaccurate, imitation as one of the risks.

The most concrete practitioner account of the same problem comes from [Rosala and Moran (2024)](https://www.nngroup.com/articles/synthetic-users/) at Nielsen Norman Group. Synthetic users tend to please the person interacting with them, producing more favorable responses than real users. Because they describe everything as important, they generate many needs without revealing which problems should be addressed first. Synthetic users cannot provide behavioral data in the first place. Furthermore, their responses are learned from internet data beyond our control, making it difficult to know what biases they contain.

---

## How, then, can accuracy be improved?

Every study that reports improved accuracy begins with material collected from real people. Rather than merely listing attributes such as age and occupation, these approaches provide a lengthy account of the person's story, or narrative.

Deep Binding, proposed by [Kang et al. (2025)](https://arxiv.org/abs/2504.11673), takes this approach. Instead of enumerating attributes, it supplies transcripts from several interview sessions as background narrative. Its design draws on narrative identity theory, which holds that people construct their identities through the stories they tell about themselves. The authors report an 87% improvement in accuracy when reproducing the response distribution of a political-orientation survey.

[DeepPersona (2025)](https://arxiv.org/abs/2511.07338) combines both approaches. Each persona contains several hundred structured attributes together with approximately one megabyte (MB) of descriptive prose. Compared with prior methods, it improved attribute diversity by 32% and profile uniqueness by 44%, and reduced the difference between simulated and actual responses in social surveys by 31.7%.

![Diagram of DeepPersona's two-stage pipeline. On the left, attributes are extracted from self-disclosure questions and answers; in the middle, the extracted attributes are filtered and merged into a human attribute tree; on the right, values from that tree are populated to generate a narrative profile](/assets/images/synthetic-user-reading-deeppersona-pipeline.webp "Source: [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025, Figure 2")

What does accuracy mean here? A common method is to ask a persona the same survey questions previously asked of a person, then measure how closely the two sets of answers agree. This approach assumes that the person's answers, which serve as the answer key, do not change over time. One study tested whether that assumption holds.

[Park et al. (2024)](https://arxiv.org/abs/2411.10109) conducted two-hour interviews and surveys, including the General Social Survey and the Big Five personality inventory, with 1,052 adults in the United States. Two weeks later, they administered the same surveys again, first measuring how consistently each person reproduced their earlier answers. They also asked agents created from the initial data the same questions.

For General Social Survey items, participants retained their own responses two weeks later 79.53% of the time, while agents created from interview transcripts matched participant responses 65.67% of the time. What stands out is that even when the same person is asked the same question, 20% of the answers change within two weeks. The degree of change varies by item. For Big Five items, the correlation between first- and second-round responses was 0.95, indicating much greater stability. The authors therefore argue that using human responses as an answer key requires considering how stable that key is for a given item. They propose normalizing agent accuracy as follows: the rate at which the agent matches participant responses divided by the rate at which participants retain their own responses.

Other research has designed systems that collect human data continuously rather than only once in order to improve synthetic-user accuracy. The hybrid panel proposed by [Romberg et al. (2026)](https://arxiv.org/abs/2608.22582) places human respondents and an LLM in the same panel. After each survey round, it identifies where their answers diverge and adjusts the model for the next round. It also includes a process in which people review whether the LLM-generated responses are reasonable.

---

## What, then, can synthetic users be asked?

No matter how much accuracy improves, it remains accuracy within a particular context. In a talk, [Anand (2026)](https://www.youtube.com/watch?v=YnNF55QV0zs) compares synthetic panels to weather forecasts. A weather forecast performs well under defined conditions but fails outside them. Similarly, a synthetic persona is useful only within the scope covered by its training data.

![A talk slide comparing synthetic personas to weather forecasts across fourteen principles](/assets/images/synthetic-user-reading-weather-forecast-personas.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

Anand notes that LLMs learn what people have said in text and speech, not what they have actually done through actions and behavior. As a result, they can imitate expressed attitudes to some extent but are less successful at predicting actual choices. The talk cites research by Hewitt et al. that used LLMs to predict experimental results. Predictions were reasonably accurate for experiments that asked about attitudes in surveys, but accuracy fell markedly for field experiments that observed actual behavior.

![A talk slide comparing, experiment by experiment, why predicting attitudes is easier than predicting behavior](/assets/images/synthetic-user-reading-attitudes-vs-actions.webp "Source: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

Other research reaches a similar conclusion about behavioral prediction. [Kuric, Demcak, and Krajcovic (2026)](https://arxiv.org/abs/2605.18302) took twelve first-click tests involving 3,431 participants from real user experience (UX) research and examined whether a generative pre-trained transformer (GPT) could predict where people would click on a screen. In 53% of all tasks, the click distributions of synthetic and actual responses differed significantly. Adding personas, asking the model to write out its reasoning step by step, and adjusting sampling parameters all failed to improve accuracy.

![Box plots comparing synthetic and actual responses on four measures: semantic diversity, word repetition, readability, and length](/assets/images/synthetic-user-reading-synthetic-vs-real-answers.webp "Source: [What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience](https://arxiv.org/abs/2605.18302) — Kuric, Demcak & Krajcovic, 2026, Figure 5")

---

## Conclusion: Synthetic users must be supported by research data from real people

The common thread across the studies I have reviewed is research data collected from real people. The studies that improved synthetic-user accuracy shared this premise. Deep Binding required lengthy interview transcripts, while Park et al. (2024) first required individual self-report data from real people, whether gathered through two-hour interviews or surveys.

Given these limitations, synthetic users appear unlikely to replace research with human participants. Using them properly requires three conditions: (1) the field must have sufficient accumulated research data; (2) synthetic-user responses must not be accepted at face value, but instead discussed and tested continually; and (3) some form of validation procedure for synthetic-user responses must be included.

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
