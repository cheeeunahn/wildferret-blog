export const aiGit101ForDesignersContentEn = `
## Rationale and learning objectives

Following the introduction of the Figma MCP, designers in the organisation raised recurring questions about its operation, failure modes, and use of tokens. Without a basic conceptual model of the system, they could use it under normal conditions but had little basis for diagnosing failures.

A thirty-minute introductory session was therefore organised to establish a shared technical vocabulary and a practical framework for troubleshooting.

![An Excalidraw whiteboard shared during the session, with handwritten examples: "Where is the cat? → In the box", "What is the capital of France? → Paris", "Where is my Figma file? → 80% Desktop, 10% Documents"](/assets/images/ai-git-101-session-whiteboard.webp "Examples were developed on a shared whiteboard during the session")

The session had three learning objectives:

1. Reduce uncertainty about AI systems
2. Explain why some prompts work better than others
3. Describe what happens when a designer uses the Figma MCP

---

## Conceptual overview

### Anthropomorphic interpretations of AI

Conversational systems can appear to possess a self, but their conceptual foundations are not new.

In 1950, [Alan Turing](https://doi.org/10.1093/mind/LIX.236.433) proposed what became known as the Turing test: a method for considering whether a machine could produce human-like conversational responses. Early conversational programs relied largely on predefined rules and pattern matching.

Today's generative AI is substantially more capable, but it likewise produces outputs through computation rather than intention or selfhood.

### Conditions underlying recent adoption

Progress was uneven for decades, constrained in part by limited computing capacity, available data, and storage.

By the 2010s, the volume of digital text and images had increased considerably, while advances in GPU computing made large-scale model training more practical.

In 2017, [Vaswani et al.](https://arxiv.org/abs/1706.03762) introduced the Transformer architecture, which made it possible to process language sequences more efficiently and at greater scale.

OpenAI released ChatGPT in 2022, making conversational use of large language models widely accessible. Its appearance was not an abrupt invention but the public culmination of several decades of research and engineering.

### Probabilistic token generation

Large language models generate text by estimating a probability distribution over the next token, repeatedly, in light of the preceding context.

For a prompt such as “What is the capital of France?”, “Paris” receives a high probability because of patterns learned during training.

For a simplified prompt such as “Where is the cat?”, the model might assign probabilities resembling the following:

- In the box: 80%
- Up a tree: 10%
- In the room: 5%
- Other: 5%

The model then samples or selects from this distribution. The percentages are illustrative, not measurements of an actual model response.

![Illustration of an AI receiving a question and computing the probability of what comes next — "in the box 80%, up a tree 10%, in the room 5%, other 5%" — then giving the highest one as its answer](/assets/images/ai-git-101-next-token-prediction.webp "A simplified illustration of next-token prediction (AI-generated)")

These predictions can be effective because contemporary models are trained on very large datasets and learn complex statistical relationships. “Autocomplete” is an imperfect but useful introductory analogy; it should not be taken to imply that the underlying computation is simple.

### Context narrows the problem

Relevant context can narrow the range of plausible responses and improve the model's ability to complete a task.

If an agent is asked, “Where is my Figma file?”, it may need to search broadly. Adding “It is probably on the Desktop” narrows the search scope and may reduce both tool use and token consumption. Context does not automatically reduce token use, however: irrelevant or excessive context can increase it.

Files such as \`memory.md\` and \`CLAUDE.md\` can supply persistent instructions or project context before an agent begins work. Well-designed context often improves relevance, although its effect on token use depends on its length and on the task.

### Distinction between Claude and Claude Code

The distinction is important because the two products have different capabilities.

**Claude** (claude.ai) is a browser-based conversational interface used for tasks such as writing and document analysis. In an ordinary browser session, it does not directly control the local terminal or file system.

**Claude Code** is an agentic development tool that runs in the terminal and can act within a configured environment.

- Execute terminal commands
- Access and modify files within its configured permissions
- Generate structured data such as JSON
- Call external tools through MCP

In the configuration discussed during the session, the Figma MCP was used through Claude Code rather than the standard claude.ai interface.

### Functional role of the Figma MCP

The model does not manipulate Figma by itself. MCP (Model Context Protocol) provides a standard interface through which an agent can invoke external tools.

> Claude Code ↔ MCP ↔ Figma

For an instruction such as “change the blue button to white”, the interaction can be summarised as follows:

1. **Command** — Claude Code receives the user's natural-language instruction
2. **Tool call** — Claude Code selects an available tool and constructs structured arguments for it
3. **Execution** — the MCP server passes the request to the relevant Figma integration, subject to the tool's permissions and capabilities
4. **Feedback** — the tool result returns to Claude Code, which reports the outcome to the user

![A four-panel illustration — Command, Translate, Dispatch, Feedback. The user says "change the blue button to white", Claude Code translates it into JSON, MCP passes it to Figma where the button colour changes, and a "done" response returns to the user](/assets/images/ai-git-101-figma-mcp-flow.webp "A simplified representation of instruction, tool invocation, execution, and feedback (AI-generated)")

### Distinction between MCP integrations and Skills

MCP defines how an AI application exchanges context and tool calls with external systems such as Figma.

A Skill (\`SKILL.md\`) is instead a set of instructions that guides the agent's work. The two can be used together: a Skill may instruct the agent to use an MCP integration under specified conditions.

Because Skill instructions occupy context, they should contain only information relevant to the task.

### Practical implications for designers

**01. Use autocomplete as a provisional analogy.** Treating a language model as a sophisticated prediction system can produce more realistic expectations than treating it as an autonomous mind, provided that the analogy is not mistaken for a complete technical account.

**02. Provide context, define the target, and decompose the task.** Durable context may be recorded in a Markdown file; individual requests should specify their scope and divide large assignments into discrete units.

**03. Limit the scope of each request.** A request to generate more than ten screens, for example, may consume the available context or output budget before the agent invokes the Figma tool.

---

## Implications for practice

Setup procedures should be based on current official documentation because configuration details change over time. An AI assistant may help locate and summarise those materials, but its account should be checked against the primary source.

The session used the following statement as a concise reminder that model performance remains conditional on task definition and context:

> AI is not an omniscient system; its performance depends substantially on the quality and relevance of the context provided.

Understanding the mechanism makes failures easier to diagnose: insufficient context is one possible cause, alongside permissions, tool availability, ambiguous instructions, and integration errors. The session was intended to provide that diagnostic foundation.

---

## References

- [Turing, A. M. (1950). “Computing Machinery and Intelligence.” *Mind*, 59(236), 433–460.](https://doi.org/10.1093/mind/LIX.236.433)
- [Vaswani, A., et al. (2017). “Attention Is All You Need.” *Advances in Neural Information Processing Systems*, 30.](https://arxiv.org/abs/1706.03762)`
