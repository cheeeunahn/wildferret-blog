export const researchWikiForLlmContentEn = `

I often need to revisit the user research accumulated over the past eighteen months: usability tests, in-depth interviews, concept tests, surveys, and weekly voice-of-customer (VOC) analyses. When I opened the folder, I found a jumble of PDFs, slide decks, text transcripts, Markdown files, and Confluence pages. Some individual studies ran to dozens of pages.

![Illustration of a person holding a single sheet of paper, looking lost in front of a desk piled high with research documents](/assets/images/research-wiki-for-llm-scattered-files.webp "Files of every format and length, stacked up in one folder exactly as they landed (AI-generated)")

There was too much material to read through in full, yet it was also too large to feed wholesale into a large language model (LLM). I therefore decided to organise it into a wiki that an LLM could read quickly and easily.

---

## Open Knowledge Format and the LLM Wiki

My highly capable team lead recently introduced me to two document formats designed specifically for LLMs.

The first is Google's **[Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)**. The idea is to define a format rather than build yet another service for storing knowledge. Each Markdown file represents one concept. YAML front matter controls only a minimum set of metadata, while authors decide everything else. Document type is the sole required field. File paths create the hierarchy, and Markdown links form the graph. Without a vector database or software development kit (SDK), people and agents can read the same files.

The second is Andrej Karpathy's **[LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** note. Instead of retrieving chunks from the original material for every question, an LLM continually revises the wiki. When new material arrives, it reads it, updates existing pages, maintains cross-references, and flags any contradictions it finds.

---

## Document architecture

I began by defining the hierarchy. The original research data occupies an immutable layer and is never altered. Above it sits the organised wiki layer, with a schema document at the top defining its structure and rules.

A **source** is a single summary page for one original study. An **entity** is something examined by the research, such as a service or feature. A **concept** is a recurring pattern that appears across multiple studies. The pages are connected with ordinary Markdown links.

Every page begins with YAML front matter. The document type is restricted to one of fourteen values, while all other fields are optional. The body structure is also fixed: a table containing the research method, sample size, and timing; a list of key findings; and links to related pages, in that order. With this structure, each page serves as a single chunk in its own right.

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


Every quotation includes the research method and sample size, and each concept page states how many pieces of evidence support that concept.

Each VOC quotation includes the original response identifier, making it possible to trace any statement back to the source.

A pattern supported by only one piece of evidence is not registered as a concept. Once something is elevated to a concept page, both the next person and the next agent to read it may accept it as something "we know." I leave it on the source page for the time being and promote it to a standalone concept only when a later study confirms it again.

---

I update the research wiki whenever new material becomes available. I no longer spend more than thirty minutes rummaging through Slack, Google Docs, Confluence, and other tools for a single research insight, thinking, "I am sure we looked into that last year."

`
