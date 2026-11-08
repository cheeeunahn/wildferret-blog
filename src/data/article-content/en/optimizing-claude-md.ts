export const optimizingClaudeMdContentEn = `## Summary

- Research shows that coding agents give agent instruction files such as \`CLAUDE.md\` and \`AGENTS.md\` higher priority than the actual codebase. In that study, when the file and the code disagreed, the agents mostly followed the file (90.1%), and they did so even after noticing the mismatch. Yet these files tend to be written once and left alone, or they grow by addition without anything being deleted. It made me reconsider how these files are written and maintained.
- If a file is going to need constant editing, what goes into it is also worth thinking about. When descriptions of the code and rules that a machine can check are moved into linters and tests, the tests themselves act as a safeguard even when the file is out of date.
- Drawing on six papers, I wrote down my own thoughts on what to put in these files and what to leave out. This is not a list the papers validated, and it is not the answer.

---

Last month I came across five papers on the efficiency of agent instruction files such as \`AGENTS.md\` and \`CLAUDE.md\`. Then, on October 22, a new paper appeared. It reports that when the file and the code say different things, the agent follows the file even after reading the code. Where the earlier five papers asked "does the file help?", this one asks "what happens when the file is wrong?" Reading them made me start wondering **what should actually go into an agent instruction file**. I organized the contents of all six papers with the assistance of artificial intelligence (AI).

| Paper | Type | Key result | Caveat |
| --- | --- | --- | --- |
| Xu & Wu | Controlled experiment | When an outdated file conflicts with the code, 90.1% of choices follow the file. One sentence makes 91.4% follow the code | Small Python projects built by the authors; only cases where the file is the outdated side |
| A. Lulla et al. | Controlled experiment | On small PRs, median run time −28.6%, output tokens −16.6% | Correctness only skimmed by a human; cost (USD) not reported |
| B. Gloaguen et al. | Benchmark experiment | No demonstrated improvement in success rate; cost +20–23% | "Improvement not demonstrated," not "performance declined" |
| C. Arabat & Sayagh | Before-and-after comparison of real PRs | Merge rate rose by over 20% in 27.7% of projects and fell in 26.4% | Before-and-after comparison without a control group |
| D. Galster et al. | Survey of practice | 90.6% use only context files; \`AGENTS.md\` is becoming the common standard | Shows what is used, not what is effective |
| E. Chatlatanagulchai et al. | Survey of practice | Frequently edited, but additions outnumber deletions; security and performance instructions under 15% | Readability metrics have low reliability |

---

## When agents follow outdated instructions

### Agents follow the file even after reading the code

[Xu & Wu (2026)](https://arxiv.org/abs/2610.30571) built 40 Python projects, each with a deliberately outdated instruction file. For example, \`CLAUDE.md\` states "print warnings and status messages with \`print()\`," while every existing module uses \`logging\`. The scenario is a team that moved from \`print\` to \`logging\` without updating the file.

- **Setup:** The authors selected 16 kinds of convention, including log output, path handling, error propagation, test style, and how monetary amounts are stored. In each project, the existing code consistently uses one convention and the file requires the opposite one. Claude Code (Claude Sonnet 5.5) and Codex CLI (GPT-6 Sol) were each asked to add one feature. The task requests said nothing about conventions. There were 320 runs in total.
- **Results:** Of the agents' 720 choices, 90.1% (649) followed the outdated file, and only 4.2% followed the existing code. Claude Code followed the file in 86.4% of its choices and Codex CLI in 93.9%. The file won in 14 of the 16 kinds of convention.

What stood out was how the two agents followed the file.

- **Claude Code noticed the mismatch and followed the file anyway.** In 79 of 80 runs, its final reply pointed out that the existing modules use \`logging\` while \`CLAUDE.md\` requires \`print\`. Even so, 86.2% of the choices it made in those 79 runs followed the file. It read the code and saw the difference, but in effect judged the code to be the side that was wrong.
- **Codex CLI rewrote the existing code to match the file.** In 20 of 80 runs, it rewrote working code to conform to the file, deleting a median of 198 lines across 9 files. When the original tests were restored and run after these runs, 17 of the 20 failed. In the remaining 60 runs, it followed the file without mentioning the mismatch.

In the other papers, too, agents followed the file faithfully. B's traces show that when the file mentioned \`uv\`, agents used it 1.6 times per task, and when it did not, they rarely used it at all. In E, the violation rate in AI-written code dropped sharply in two repositories that added a "four-space indentation" rule. When something is written in the file, the agent does it. The problem is that it also does it when what is written is wrong.

### Why agents give the instruction file priority

Xu & Wu trace the cause to the paths by which the two kinds of information reach the model.

Claude Code places \`CLAUDE.md\` in a user message immediately after the system prompt and prefixes it with this sentence:

> "Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written."

The existing code, by contrast, arrives as **tool output** when the agent opens a file. Models are trained to give instructions priority over tool output (the instruction hierarchy). The purpose is to defend against prompt injection, such as an "ignore previous instructions" hidden in a web page or a file. That same training gives a single outdated line of instruction more authority than the actual code the line was meant to describe.

The emphatic wording is not the whole explanation. Codex CLI inserts \`AGENTS.md\` without any such wording, yet it followed the file 93.9% of the time.

### How instruction files affect results

If agents follow the file this closely, one might expect results to improve whenever a file is present. The first three papers suggest it is not that simple.

- **A: Small PRs finished faster.** [Lulla et al.](https://arxiv.org/abs/2601.20404v2) had Codex reimplement 124 small pull requests (PRs) from 10 repositories, each no larger than 100 lines and 5 files. Each task was run both with and without \`AGENTS.md\` and compared as a pair: median run time fell from 98.6 seconds to 70.3 seconds, and output tokens fell from 2,925 to 2,440. However, correctness was checked only by a human skimming 50 of the tasks rather than by tests, and cost was not reported.
- **B: Success rate unchanged, cost increased.** [Gloaguen et al.](https://arxiv.org/abs/2602.11988v3) evaluated four agents on the 300 tasks of SWE-bench Lite and on 138 tasks from 12 repositories that have developer-written context files. The difference in success rate was −0.5 to −2 percentage points for files generated by a large language model (LLM) and +2.4 percentage points for developer-written files. Neither was significant compared with having no file. Both kinds of file, however, significantly increased cost and the number of steps, because the agents did more testing, searching, and file reading as instructed.
- **C: In real PRs, results varied by project.** [Arabat & Sayagh](https://doi.org/10.1145/3793302.3793601) collected 15,549 agent PRs from 148 projects and compared them before and after each project first added an instruction file. The share of projects whose merge rate rose by more than 20% (27.7%) was similar to the share whose merge rate fell (26.4%). Some projects also saw more discussion comments or longer merge times. Because this is a before-and-after comparison without a control group, however, no causal claim can be made.

Agents act on what is written in the file, but that does not mean the results are better. Doing what the file says can raise costs (B), and if what is written is wrong, the code that comes out is wrong (Xu & Wu).

### Outdated instructions persist even in frequently edited files

The situation in Xu & Wu's experiment is not unusual. The surveys the authors cite show the following.

- Across 441 enterprise repositories, 73.8% of AI configuration files were never modified after their first commit.
- In 23.0% of 356 public repositories, a consistency-checking tool found references in instruction files to code that no longer exists.
- It happens even in large, well-maintained projects. After Supabase moved its dashboard to React 19, a skill file continued for 13 days to advise that "Studio still uses React 18, so skip React 19 patterns." An \`AGENTS.md\` in the Codex CLI repository asked for updates to a document that had already been deleted, for 24 days.

A file is not safe simply because it is edited often. Of the 2,303 context files analyzed by [Chatlatanagulchai et al.](https://doi.org/10.1145/3840295) (E), 67% of \`CLAUDE.md\` files were revised more than once, with a median interval between revisions of about one day. Yet the median addition per commit is 57 words, while deletions are under 15 words. The files are edited, but mostly by adding to them. The authors call this state, in which instructions pile up and become hard to manage, **context debt**.

More files mean more places to go stale. [Galster et al.](https://doi.org/10.1145/3805760.3814887) (D) analyzed 2,853 GitHub repositories that contain agent configuration. Of these, 90.6% use context files, and other kinds of configuration (Skills, Subagents, Hooks, the Model Context Protocol (MCP), and so on) were rare. The most common setup was a \`CLAUDE.md\` that points to \`AGENTS.md\`. The authors warn that content duplicated across several files can come into conflict.

The Claude Code documentation recommends reviewing the file periodically and deleting outdated lines. In a large project, however, it is difficult to notice which lines have become wrong. Because the file is read in every session, the same mistake repeats in every task and for every team member until the file is fixed.

### An experiment telling agents to prefer the existing code

Xu & Wu use the same reasoning to propose a remedy. They added a single sentence to the user-level instruction files (\`~/.claude/CLAUDE.md\` and \`~/.codex/AGENTS.md\`):

~~~text
When a repository's documentation and its existing code disagree, follow the conventions used in the existing code, and in your final reply point out each inconsistency you found between the documentation and the code.
~~~

Because this sentence is also delivered as an instruction, following the code now becomes an instruction in its own right.

- Choices that followed the code rose from 4.2% to 91.4%: from 7.5% to 94.4% for Claude Code, and from 0.8% to 88.3% for Codex CLI.
- Both agents reported the mismatches they found in all 160 of their runs.
- No run rewrote existing code, and the test pass rate rose from 89.4% to 100%. Tool calls and run time also decreased slightly.

![A horizontal bar chart showing whether the agents' choices matched the file, the code, or neither. Without the sentence, Claude Code followed the file in 86.4% of its choices and Codex CLI in 93.9%. With the sentence, the share that followed the code became 94.4% for Claude Code and 88.3% for Codex CLI](/assets/images/optimizing-claude-md-one-sentence-fix.webp "Whether the agents' choices matched the file or the code, before and after adding the sentence. Source: [Xu & Wu](https://arxiv.org/abs/2610.30571), 2026")

The advantage of this method is that no one needs to find and fix the outdated lines in the file beforehand. The authors recommend that teams fix their files based on the mismatches the agent reports.

There are, however, points to read with caution.

- The subjects were 40 small Python projects built by the authors, and only cases in which the file was the outdated side were examined. The tasks were feature additions completed in a single pass without human involvement. There is no guarantee that the same proportions would hold in large real-world repositories or in interactive work.
- The opposite case concerned me. For a team that is **in the middle of moving** from \`print\` to \`logging\` and has written the new convention into the file first, this sentence would pull the agent back toward the old code. The file can be the correct side and the code the outdated one.

Adding this sentence does not make the problem of maintaining the file go away. For a file that agents follow this faithfully, it is worth thinking about how it is written and kept up to date.

---

## What to keep in the file, and what to move into tests

If a file is going to need constant editing, one approach is to reduce what there is to edit. Every line in the file is a line that may one day go stale. So the question becomes which content to write as instructions, and which to move into checks such as linters, tests, and hooks.

### Rules and descriptions of the code in instruction files

Another cause that Xu & Wu point to is the style in which instruction files are written. "Print progress messages with \`print()\`" is phrased as a command, but what it actually records is **what the code looked like when the line was written**. When the code changes, the content becomes wrong, but the form of a command remains.

The authors therefore suggest that model developers train models to distinguish **rules**, such as "run the tests before committing," from **descriptions of the code**, such as "print progress messages with \`print\`," because descriptions can be checked against the code.

I began to wonder whether content that can be checked against the code needs to be written as a sentence at all. The agent can read the code directly. In B, too, a repository overview did not help agents find the files to fix any faster. If such a description must be enforced, another option is to write it as code that checks it rather than as a sentence.

### How linters and tests differ from instruction files

The same convention goes stale differently depending on where it is kept.

- **When a rule kept in a linter or test goes stale,** the check fails. If someone moves the code to \`logging\`, the check that required \`print\` breaks, and it gets fixed on the spot.
- **When a rule kept in an instruction file goes stale,** nothing happens. The agent follows the line, and wrong code quietly accumulates (Xu & Wu).

E's "four-space indentation" case shows that instructions do have an effect, but indentation is something a formatter does the same way every time. E's authors also suggest reviewing whether the instruction file needs changes in any PR that alters the build or core modules, and **automatically checking** that the commands written in the file match \`package.json\`. In other words, the file itself can be a subject of tests. C's authors point in the same direction when they propose treating instruction files, like Infrastructure as Code, as an engineering artifact with standards and review, which they call **Instructions-as-Code**.

### What remains in the file

Once whatever can be moved into checks has been moved, what remains is what cannot be learned from the code alone.

- **The reasons behind decisions.** Code shows what it does, but not why another approach was not taken.
- **Places that must not be touched.** Code that looks safe to change but should not be changed, for a reason.
- **Procedures needed only for particular tasks.** In B, removing the testing instructions reduced cost from $0.47 to $0.37, with no significant difference in success rate. Perhaps procedures, too, could be written together with when they are needed.
- **Conventions that are being migrated.** As in the \`logging\` counterexample above, a decision the code has not yet caught up with cannot be read from the code. In that case, it may be worth writing it as a rule with a clear scope.

The content that remains seems to work better the more concrete it is. In C, the files in projects whose merge rate rose were longer and more finely divided (a median of 976 words against 569). I read these "longer files" as possibly a proxy for **files that received more care**. Writing out paths, commands, and examples concretely and dividing the content by topic tends to make a file longer.

What about keeping a single source? D's authors recommend keeping \`AGENTS.md\` as the shared source and using tool-specific files as adapters that point to it. In an additional experiment in B, when the repository's other documentation was deleted, LLM-generated files raised the success rate by about 2.7 percentage points on average. This suggests that the effect of a file can be masked when its content overlaps with other documentation. When the same content lives in two places, only one gets updated and the other goes stale.

### Looking at this blog's CLAUDE.md

The \`CLAUDE.md\` in this blog's repository is about 6,000 words, more than ten times E's median of 485 words. It covers topics such as the layer structure, the islands policy, linking rules, and comment security.

Fortunately, some of it has already been moved into checks. Several of the linking, layer, and island rules have become ESLint rules, so \`pnpm lint\` fails when they are broken. A documentation sync script flags the docs for review when the file structure, scripts, or dependencies change. As the docs themselves note, however, that script **sees shape, not behavior.** If what a component does changes while its file name stays the same, the script does not notice. The outdated convention descriptions that caused trouble in the Xu & Wu experiment are exactly of that kind. It also means that many descriptions have not yet been moved into checks.

---

## Some thoughts on what to include and what to leave out

From here on is my interpretation of the papers' results. The papers did not validate this list, and the answer will differ from one repository and team to another. The papers sometimes give different answers to the same question. B found no relationship between file length and success rate, while C found longer files alongside improved merge rates. Neither tells us what the right length is. Please read this as something to think about rather than as the answer.

### What might be worth removing

- **Descriptions that can be learned by reading the code.** Remove them or link to another document such as the README. Any description that remains becomes a wrong command when the code changes. (B, Xu & Wu)
- **Rules that a machine can check.** Move rules such as indentation and import paths into linters, hooks, or scripts. This is more reliable than writing them in the file, and when they go stale, the check fails first. (E)
- **Content that duplicates other files.** If the same content is written separately in \`AGENTS.md\`, \`CLAUDE.md\`, and skill files, consolidate it in one place. (D, Xu & Wu)
- **Notes about finished work and outdated commands.** In a PR that adds lines, also look for lines to delete. (E)

Files generated automatically with \`/init\` would also be worth reviewing against these criteria. In B, developer-written files performed better than LLM-generated ones.

### What might be worth keeping

- **Rules, and the reasons for them.** "Run the tests before committing" is a rule. Write down what is not in the code, such as why the rule exists and which places must not be touched. (Xu & Wu)
- **Procedures with conditions attached.** State whether something is needed "always" or only for particular tasks. (B) For example:

~~~md
- If only document text is edited, check the links only.
- If executable code is edited, run the related tests.
- If shared styles or routes are edited, check the build and the affected screens.
- If a required check could not be run, state it in the completion report along with the reason.
~~~

- **Migration rules with a clear scope.** If a convention is being changed, write something like "New code uses \`logging\`. The existing \`print\` calls are being migrated." The papers did not test this approach.
- **Concrete paths, commands, and examples.** Content tied to a problem actually encountered or a decision the team made can be long. (C)

### What might be worth trying outside the file

- **Put the priority sentence in the user-level file.** Adding the sentence from Xu & Wu to \`~/.claude/CLAUDE.md\` once applies it to every project. In repositories with a convention under migration, however, use it together with the migration rule above.
- **Fix the file using the mismatches the agent reports.** The second half of that sentence makes the agent report mismatches. Receiving those reports reduces the effort of finding outdated lines.
- **Review the instruction file in PRs that change the structure.** This is the Instructions-as-Code that C and E describe.
- **Measure the effect.** Compare the current file, a trimmed file, and no file on two or three representative tasks, and record time, cost, test results, and how much a person had to fix afterward. The measure is not the cost of a single run but **the cost of obtaining one usable result**.

---

## Closing thoughts

To apply what I read to this blog, I could start by putting the priority sentence into my user-level \`CLAUDE.md\`, and when the agent reports a mismatch with the codebase, fix that line first. After that, I could remove, one at a time, the descriptions in the blog's \`CLAUDE.md\` that can be learned by reading the code, and move into checks whatever can be moved. Then I could see whether the file gets shorter, and whether the agent's results change.

---

## References

- [Xu & Wu, "Stale Instruction Files Override the Code in Coding Agents: A One-Sentence Fix"](https://arxiv.org/abs/2610.30571) — arXiv, 2026. The rate at which agents follow an outdated instruction file when it conflicts with the code (90.1%), and an experiment in which one sentence in the user-level file made them follow the code (4.2% → 91.4%)
- [Lulla et al., "On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents"](https://arxiv.org/abs/2601.20404v2) — arXiv, 2026. On 124 small PRs, median run time −28.6% and output tokens −16.6%
- [Gloaguen et al., "Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"](https://arxiv.org/abs/2602.11988v3) — arXiv, 2026. No demonstrated improvement in success rate, cost +20–23%, and an additional experiment without testing instructions
- [Arabat & Sayagh, "Toward Instructions-as-Code: Understanding the Impact of Instruction Files on Agentic Pull Requests"](https://doi.org/10.1145/3793302.3793601) — MSR '26. A comparison of merge rates before and after 148 projects adopted instruction files
- [Galster et al., "Configuring Agentic AI Coding Tools: An Exploratory Study"](https://doi.org/10.1145/3805760.3814887) — AIware '26. Eight ways of configuring agents, and their adoption, across 2,853 GitHub repositories
- [Chatlatanagulchai et al., "Agent READMEs: An Empirical Study of Context Files for Agentic Coding"](https://doi.org/10.1145/3840295) — ACM TOSEM. An analysis of the structure, maintenance, and content of 2,303 context files, and context debt
`
