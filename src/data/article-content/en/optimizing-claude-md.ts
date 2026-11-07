export const optimizingClaudeMdContentEn = `## Summary

- When the contents of \`CLAUDE.md\` or \`AGENTS.md\` disagree with the actual code, coding agents mostly follow the file. In one experiment, 90.1% of their choices followed an outdated file, and they did so even after noticing the mismatch.
- The evidence that simply having such a file improves results is still weak. One experiment found that runs finished faster, but another found that success rates did not improve while costs went up.
- After reading six papers, I arrived at the following approach to writing these files. Cut descriptions that can be learned by reading the code, and attach the conditions under which each rule applies. In the user-level file, add a sentence saying "when the documentation and the code disagree, follow the code."

---

Last month I wrote a piece for the Seoul AI Club archive comparing five papers on agent instruction files such as \`AGENTS.md\` and \`CLAUDE.md\`. I wanted to know whether these files make agents faster or simply more expensive.

Then, on October 22, a new paper appeared. It reports that when the file and the code say different things, the agent follows the file even after reading the code. Where the earlier five papers asked "does the file help?", this one asks "what happens when the file is wrong?" Placing the two questions side by side made it somewhat clearer how these files ought to be written. I organized the contents of all six papers with the assistance of artificial intelligence (AI).

---

## Agents follow the file over the code

[Xu & Wu (2026)](https://arxiv.org/abs/2610.30571) built 40 Python projects, each with a deliberately outdated instruction file. For example, \`CLAUDE.md\` states "print warnings and status messages with \`print()\`," while every existing module uses \`logging\`. The scenario is a team that moved from \`print\` to \`logging\` without updating the file.

- **Setup:** The authors selected 16 kinds of convention, including log output, path handling, error propagation, test style, and how monetary amounts are stored. In each project, the existing code consistently uses one convention and the file requires the opposite one. Claude Code (Claude Sonnet 5.5) and Codex CLI (GPT-6 Sol) were each asked to add one feature. The task requests said nothing about conventions. There were 320 runs in total.
- **Results:** Of the agents' 720 choices, 90.1% (649) followed the outdated file, and only 4.2% followed the existing code. Claude Code followed the file 86.4% of the time and Codex CLI 93.9% of the time. The file won in 14 of the 16 kinds of convention.

What stood out was how differently the two agents followed the file.

- **Claude Code noticed the mismatch and followed the file anyway.** In 79 of 80 runs, its final reply pointed out that "the existing modules use \`logging\`, but \`CLAUDE.md\` requires \`print\`." Even so, 86.2% of its new code followed the file. It read the code and saw the difference, but judged the code to be the side that was wrong.
- **Codex CLI rewrote the existing code to match the file.** In 20 of 80 runs, it rewrote working code to conform to the file, deleting a median of 198 lines across 9 files. When the original tests were restored and run after these runs, 17 of the 20 failed. In the remaining 60 runs, it followed the file without mentioning the mismatch.

An outdated file produces new code that does not fit the project and, in some cases, breaks code that was working. Because the file is read in every session, the same mistake repeats in every task and for every team member until the file is fixed.

### Why does the file win?

The authors trace the cause to the paths by which the two kinds of information reach the model.

Claude Code places \`CLAUDE.md\` in a user message immediately after the system prompt and prefixes it with this sentence:

> "Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written."

The existing code, by contrast, arrives as **tool output** when the agent opens a file. Models are trained to give instructions priority over tool output (the instruction hierarchy). The purpose is to defend against prompt injection, such as an "ignore previous instructions" hidden in a web page or a file. That same training gives a single outdated line of instruction more authority than the actual code the line was meant to describe.

The emphatic wording is not the whole explanation. Codex CLI inserts \`AGENTS.md\` without any such wording, yet it followed the file 93.9% of the time.

The authors point to one further cause: the style in which instruction files are written. "Print progress messages with \`print()\`" is phrased as a command, but what it actually records is **what the code looked like when the line was written**. When the code changes, the content becomes wrong, but the form of a command remains.

### One sentence reversed the result

The same reasoning yields a remedy. The authors added a single sentence to the user-level instruction files (\`~/.claude/CLAUDE.md\` and \`~/.codex/AGENTS.md\`):

~~~text
When a repository's documentation and its existing code disagree, follow the conventions used in the existing code, and in your final reply point out each inconsistency you found between the documentation and the code.
~~~

Because this sentence is also delivered as an instruction, following the code now becomes an instruction in its own right.

- Choices that followed the code rose from 4.2% to 91.4%: from 7.5% to 94.4% for Claude Code, and from 0.8% to 88.3% for Codex CLI.
- Both agents reported the mismatches they found in all 160 of their runs.
- No run rewrote existing code, and the test pass rate rose from 89.4% to 100%. Tool calls and run time also decreased slightly.

The advantage of this method is that no one needs to find and fix the outdated lines in the file beforehand. The authors recommend that teams fix their files based on the mismatches the agent reports. They suggest that agent developers put this rule into their system prompts, and that model developers train models to distinguish **rules**, such as "run the tests before committing," from **descriptions of the code**, such as "print progress messages with \`print\`," since descriptions can be checked against the code.

### Points to read with caution

- The subjects were 40 small Python projects built by the authors, and only cases in which the file was the outdated side were examined. The tasks were feature additions completed in a single pass without human involvement. There is no guarantee that the same proportions would hold in large real-world repositories or in interactive work.
- The opposite case concerned me. For a team that is **in the middle of moving** from \`print\` to \`logging\` and has written the new convention into the file first, this sentence would pull the agent back toward the old code. In that situation it would probably be better to write a rule with a clear scope rather than a description, such as "New code uses \`logging\`. The existing \`print\` calls are being migrated." The paper did not test this approach.

---

## Files go stale faster than you might expect

The surveys cited by Xu & Wu suggest that the situation in this experiment is not unusual.

- Across 441 enterprise repositories, 73.8% of AI configuration files were never modified after their first commit.
- In 23.0% of 356 public repositories, a consistency-checking tool found references in instruction files to code that no longer exists.
- It happens even in large, well-maintained projects. For 13 days after Supabase moved its dashboard to React 19, a skill file advised that "Studio still uses React 18, so skip React 19 patterns." An \`AGENTS.md\` in the Codex CLI repository asked for updates to a document that had already been deleted, for 24 days.

The Claude Code documentation recommends reviewing the file periodically and deleting outdated lines. In a large project, however, it is difficult to notice which lines have become wrong.

---

## Does having a file actually help? Five papers

From here on are the five papers I read last month. Three measured effects, and two surveyed how real repositories use these files.

| Paper | Type | Key result | Caveat |
| --- | --- | --- | --- |
| A. Lulla et al. | Controlled experiment | On small PRs, median run time −28.6%, output tokens −16.6% | Correctness only skimmed by a human; cost (USD) not reported |
| B. Gloaguen et al. | Benchmark experiment | No demonstrated improvement in success rate; cost +20–23% | "Improvement not demonstrated," not "performance declined" |
| C. Arabat & Sayagh | Before-and-after comparison of real PRs | Merge rate rose by over 20% in 27.7% of projects and fell in 26.4% | Before-and-after comparison without a control group |
| D. Galster et al. | Survey of practice | 90.6% use only context files; \`AGENTS.md\` is becoming the common standard | Shows what is used, not what is effective |
| E. Chatlatanagulchai et al. | Survey of practice | Frequently edited, but additions outnumber deletions; security and performance instructions under 15% | Readability metrics have low reliability |

### A: Small PRs finished faster

[Lulla et al.](https://arxiv.org/abs/2601.20404v2) had Codex reimplement 124 small pull requests (PRs) from 10 repositories, each no larger than 100 lines and 5 files. Each task was run both with and without \`AGENTS.md\`, and the two runs were compared as a pair. Median run time fell from 98.6 seconds to 70.3 seconds, and output tokens fell from 2,925 to 2,440. However, correctness was checked only by a human skimming 50 of the tasks rather than by tests, and cost was not reported.

### B: Success rate unchanged, cost increased

[Gloaguen et al.](https://arxiv.org/abs/2602.11988v3) evaluated four agents on the 300 tasks of SWE-bench Lite and on 138 tasks from 12 repositories that have developer-written context files.

- **Success rate:** Files generated by a large language model (LLM) changed it by −0.5 to −2 percentage points, and developer-written files by +2.4 percentage points. Neither was significant compared with having no file.
- **Cost:** Both kinds of file significantly increased cost and the number of steps.
- **Traces:** The agents followed the instructions closely. When \`uv\` was mentioned, they used it 1.6 times per task; when it was not, they rarely used it at all. In exchange, testing, searching, and file reading all increased. A repository overview did not help the agents find the files to fix any faster.
- **Additional experiments:** Removing the testing instructions reduced cost from $0.47 to $0.37, with no significant difference in success rate. When the repository's other documentation was deleted, LLM-generated files raised the success rate by about 2.7 percentage points on average. This suggests that the effect of a file can be masked when its content overlaps with other documentation.

### C: In real PRs, results varied by project

[Arabat & Sayagh](https://doi.org/10.1145/3793302.3793601) collected 15,549 agent PRs from 148 projects and compared them before and after each project first added an instruction file. The share of projects whose merge rate rose by more than 20% (27.7%) was similar to the share whose merge rate fell (26.4%). Some projects also saw more discussion comments or longer merge times.

The files in projects whose merge rate rose were longer and more finely divided (a median of 976 words against 569). The authors propose treating instruction files, like Infrastructure as Code, as an engineering artifact with standards and review, which they call **Instructions-as-Code**. Because this is a before-and-after comparison without a control group, however, no causal claim can be made.

B found no relationship between length and success rate, while C found longer files alongside improved merge rates. I read C's "longer files" as possibly a proxy for **files that received more care**. Writing out paths, commands, and examples concretely and dividing the content by topic tends to make a file longer. Neither paper says what the right length is.

### D: Most projects stop at a single context file

[Galster et al.](https://doi.org/10.1145/3805760.3814887) analyzed 2,853 GitHub repositories that contain agent configuration. Of these, 90.6% use context files, and other kinds of configuration (Skills, Subagents, Hooks, the Model Context Protocol (MCP), and so on) were rare. The most common setup was a \`CLAUDE.md\` that points to \`AGENTS.md\`. The authors recommend keeping \`AGENTS.md\` as the shared source and using tool-specific files as adapters that point to it, and they warn that content duplicated across several files can come into conflict.

### E: Adding is more common than deleting

[Chatlatanagulchai et al.](https://doi.org/10.1145/3840295) analyzed 2,303 context files.

- The median length of a \`CLAUDE.md\` is 485 words. Sixty-seven percent were revised more than once, with a median interval between revisions of about one day.
- The median addition per commit is 57 words, while deletions are under 15 words.
- Instructions about testing, code style, and architecture are common, while instructions about security (14.8%) and performance (14.5%) are rare.
- In two repositories that added a "four-space indentation" rule, the violation rate in AI-written code dropped sharply.

The authors call this state, in which instructions pile up and become hard to manage, **context debt**. They suggest reviewing whether the file also needs changes in any PR that alters the build or core modules, and automatically checking that the commands written in the file match \`package.json\`.

---

## Reading the six papers together

With only the five papers, the conclusion was blurry. An experiment that found agents faster, one that found only higher costs, and an observation that results varied by project were all mixed together. Adding the paper by Xu & Wu revealed a common thread: **agents follow what is written in the file very faithfully.**

- In B, agents used \`uv\` when told to and ran tests when told to. That is why costs rose.
- In Xu & Wu, agents followed the file even when it was wrong, and even after reading the code themselves and noticing the difference.
- In E, files grow mostly by addition. In D, most projects entrust all their configuration to this single file.

To summarize, the instruction file is the most authoritative information an agent has, and lines keep accumulating in it. Some of those lines are procedures that are no longer needed, and some are descriptions that are no longer accurate. Unneeded procedures raise costs (B), and inaccurate descriptions produce wrong code (Xu & Wu).

What I came to suspect first, therefore, is **descriptions of the code**. A line such as "this project uses \`logging\`" can be learned by looking at the code. In B, a repository overview did not help agents find files, and in Xu & Wu, such descriptions turned into wrong commands as they went stale. Conversely, things that cannot be learned from the code alone, such as the reasons behind a team's decisions, places that must not be touched, and procedures needed only for particular tasks, are worth keeping in the file.

---

## What to check when writing CLAUDE.md or AGENTS.md

These are practical suggestions drawn from the papers' results. The papers did not test this checklist itself.

### Checking line by line

1. **Is it a description that can be learned by reading the code?** If so, remove it or link to another document such as the README. Any description that remains will become a wrong command when the code changes. (B, Xu & Wu)
2. **Is it a rule or a description?** "Run the tests before committing" is a rule; "print progress messages with \`print\`" is a description. If a convention is being changed, write it as a rule with a clear scope rather than as a description. (Xu & Wu)
3. **If it is an instruction, does it state when it applies?** Write down whether it is needed "always" or only for particular tasks. (B)
4. **Can a machine check it?** Move rules such as indentation and import paths into linters, hooks, or scripts. This is more reliable than writing them in the file, and when they go stale, the check fails first. (E)
5. **Is it concrete?** Check whether it is tied to a problem actually encountered or a decision the team made, and whether it includes paths, commands, and examples. (C)
6. **Is there a single source?** If the same content is written separately in \`AGENTS.md\`, \`CLAUDE.md\`, and skill files, only one will be updated and the others will go stale. (D, Xu & Wu)
7. **Is there a line to delete while adding one?** In a PR that adds lines, also clean up outdated commands, notes about finished work, and descriptions that duplicate the code. (E)

Files generated automatically with \`/init\` would also benefit from review against these criteria. In B, developer-written files performed better than LLM-generated ones.

### Make verification instructions conditional

In B, removing the testing instructions reduced cost. The point is not to drop verification, but to write down separately what should be checked for which kind of task.

~~~md
- If only document text is edited, check the links only.
- If executable code is edited, run the related tests.
- If shared styles or routes are edited, check the build and the affected screens.
- If a required check could not be run, state it in the completion report along with the reason.
~~~

### What to do outside the file

- **Put the priority sentence in the user-level file.** Adding the sentence from Xu & Wu to \`~/.claude/CLAUDE.md\` once applies it to every project.
- **Fix the file using the mismatches the agent reports.** The second half of that sentence makes the agent report mismatches. Receiving those reports reduces the effort of finding outdated lines.
- **Review the instruction file in PRs that change the structure.** This is the Instructions-as-Code that C and E describe.
- **Measure the effect.** Compare the current file, a trimmed file, and no file on two or three representative tasks, and record time, cost, test results, and how much a person had to fix afterward. The measure is not the cost of a single run but **the cost of obtaining one usable result**.

---

## Looking at this blog's CLAUDE.md

The \`CLAUDE.md\` in this blog's repository is about 6,000 words, more than ten times E's median of 485 words. It covers topics such as the layer structure, the islands policy, linking rules, and comment security.

Fortunately, some of the work is already done. Several of the linking, layer, and island rules have been moved into ESLint rules, and a documentation sync script flags the docs for review when the file structure, scripts, or dependencies change. As the docs themselves note, however, that script **sees shape, not behavior.** If what a component does changes while its file name stays the same, the script does not notice. The outdated convention descriptions that caused trouble in the Xu & Wu experiment are exactly of that kind.

So I intend to try two things first. I will put the priority sentence into my user-level \`CLAUDE.md\`, and when the agent reports a mismatch, I will fix that line first. After that, I plan to remove, one at a time, the descriptions that can be learned by reading the code.

---

## References

- [Xu & Wu, "Stale Instruction Files Override the Code in Coding Agents: A One-Sentence Fix"](https://arxiv.org/abs/2610.30571) — arXiv, 2026. The rate at which agents follow an outdated instruction file when it conflicts with the code (90.1%), and an experiment in which one sentence in the user-level file made them follow the code (4.2% → 91.4%)
- [Lulla et al., "On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents"](https://arxiv.org/abs/2601.20404v2) — arXiv, 2026. On 124 small PRs, median run time −28.6% and output tokens −16.6%
- [Gloaguen et al., "Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"](https://arxiv.org/abs/2602.11988v3) — arXiv, 2026. No demonstrated improvement in success rate, cost +20–23%, and an additional experiment without testing instructions
- [Arabat & Sayagh, "Toward Instructions-as-Code: Understanding the Impact of Instruction Files on Agentic Pull Requests"](https://doi.org/10.1145/3793302.3793601) — MSR '26. A comparison of merge rates before and after 148 projects adopted instruction files
- [Galster et al., "Configuring Agentic AI Coding Tools: An Exploratory Study"](https://doi.org/10.1145/3805760.3814887) — AIware '26. Eight ways of configuring agents, and their adoption, across 2,853 GitHub repositories
- [Chatlatanagulchai et al., "Agent READMEs: An Empirical Study of Context Files for Agentic Coding"](https://doi.org/10.1145/3840295) — ACM TOSEM. An analysis of the structure, maintenance, and content of 2,303 context files, and context debt
`
