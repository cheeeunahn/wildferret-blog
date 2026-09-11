export const researchWikiForLlmContentEn = `

Over the past eighteen months, our user-research archive had grown to include usability tests, in-depth interviews, concept tests, surveys, and weekly voice-of-customer (VOC) analyses. The material was distributed across PDFs, slide decks, transcripts, Markdown files, and Confluence pages; a single study could span dozens of pages.

![Illustration of a person holding a single sheet of paper, looking lost in front of a desk piled high with research documents](/assets/images/research-wiki-for-llm-scattered-files.webp "Files of every format and length, stacked up in one folder exactly as they landed (AI-generated)")

The archive was difficult to review manually and too large to provide to an LLM in full. It was therefore reorganised as a wiki designed for efficient human and machine reading.

---

## Conceptual foundations: Open Knowledge Format and the LLM Wiki

The design draws on two proposed formats for LLM-based knowledge systems.

The first is Google's **[Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)**. Its premise is that shared conventions can be more useful than another knowledge-management service. Each Markdown file represents one concept; YAML frontmatter supplies minimal metadata, with document type as the only required field. File paths encode the hierarchy, and Markdown links form the graph. The format requires neither a vector database nor an SDK, so people and agents can read the same files.

The second is Andrej Karpathy's **[LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** proposal. Rather than retrieving fragments from the source material for every query, an LLM maintains the wiki itself: it incorporates new material, updates existing pages, preserves cross-references, and flags contradictions.

---

## Document architecture

The system has three layers. Original research remains in an immutable source layer. A curated wiki sits above it, while a schema document defines the wiki's structure and maintenance rules.

**Sources** provide one summary page for each original study. **Entities** denote the subjects of research, such as a service or feature. **Concepts** capture patterns that recur across multiple studies. Ordinary Markdown links connect the pages.

Each page begins with YAML frontmatter. The document type is restricted to one of fourteen values; all other fields are optional. The body follows a fixed structure: a table recording the method, sample size, and fieldwork date; a list of key findings; and links to related pages. Consequently, each page can function as a self-contained retrieval unit.

The architecture can be represented as follows.

~~~
[ THREE LAYERS ]

   SCHEMA — defines structure, naming, and the ingest procedure
      :        (people and agents revise it together)
      :  rules
      v
   WIKI — people read it, agents write it
      ^
      :  ingest — read the original, split it across the three axes below
      :
   SOURCE MATERIAL — immutable. Never edited.


[ THE THREE AXES OF THE WIKI ]

   SOURCE — one summary page per original study
   ENTITY — what the research is about (service, feature, brand)
   CONCEPT — a pattern that recurs across studies
              records how many studies support it
              never promoted on a single piece of evidence

   +-- The three reference each other with markdown links. Those links ARE
       the graph. No vector DB, no embeddings. The file path is the
       concept's identity.


[ THE FORMAT OF A SINGLE PAGE ]

   ---
   type       <- document type, constrained to 14 values (required)
   title / description / tags / timestamp / resource
   ---
   ## Study details — method · sample size · fieldwork date · source link
   ## Key findings — a numbered list
   ## Related pages — links out to entities and concepts

   +-- Because the format is uniform, one page is one chunk
~~~


Every quotation is accompanied by the research method and sample size, and each concept page records the number of studies that support the concept.

Each VOC quotation includes the identifier of the original response, enabling statements to be traced to their source.

A pattern observed in only one study is not registered as a concept. Because readers and agents may interpret a concept page as established knowledge, a single observation remains on its source page until a subsequent study corroborates it.

---

The wiki is updated whenever new research becomes available. In practice, this has substantially reduced the time required to locate earlier findings across Slack, Google Docs, and Confluence.

`
