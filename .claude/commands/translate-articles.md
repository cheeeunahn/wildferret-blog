---
description: Write the English version of every Korean article that does not have one yet, and wire it into articles.ts.
allowed-tools: Bash(pnpm:*), Bash(node scripts/translation-status.mjs:*), Bash(git status:*), Bash(git diff:*), Read, Write, Edit, Grep, Glob
---

Translate the Korean articles that have no English version yet into English, and
wire each one into `src/data/articles.ts` so it gets an `/en/article/:slug`
route.

## 1. Find the targets

Run:

```bash
node scripts/translation-status.mjs --json
```

`pending[]` is your work list — each entry gives the slug, the Korean source
file, and the English file path to create. If `pending` is empty and `problems`
is empty, there is nothing to do: say so and stop without touching any file.

Fix anything in `problems[]` even when `pending` is empty — those are broken
references that fail `pnpm build`.

$ARGUMENTS may name specific slugs. If it does, translate only those, and ignore
the rest of `pending`.

## 2. Write the English content file

For a post with slug `my-post`, read `src/data/article-content/my-post.ts` in
full, then create `src/data/article-content/en/my-post.ts`:

```ts
export const myPostContentEn = `
...
`
```

The export name is the Korean export name with an `En` suffix — `myPostContent`
→ `myPostContentEn`. `scripts/translation-status.mjs` checks this against the
import in `articles.ts`, and a mismatch fails the build.

**Register.** The English articles are deliberately more formal than the
Korean: full sentences, no contractions in body prose, technical terms spelled
out on first use with the abbreviation in parentheses. Read an existing pair —
`research-wiki-for-llm.ts` against `en/research-wiki-for-llm.ts` — and match
that voice. Translate the meaning, not the word order; a Korean sentence that
runs on is better rendered as two English ones.

**What must survive the translation untouched:**

- Image paths in `![alt](/assets/images/...)` — translate the alt text and the
  `"caption"` after the path, never the path itself. Keep the `(AI-generated)`
  marker on AI-generated images.
- `[diagram:id]` tags — copy the tag exactly. Note in your summary that the
  diagram's own labels are hardcoded Korean in `src/components/Diagrams.tsx`
  and are not language-aware, so a translated article carrying one needs a
  follow-up.
- Fenced code blocks — they use `~~~`, not backticks, because the content is a
  template literal. Translate comments inside the code; leave the code itself
  alone.
- Link URLs. Translate the link text. If a linked source is Korean-language,
  keep the link and let the title read as the English rendering of its title,
  the way the existing English articles do.
- The block structure: same headings, same lists, same tables, same `---`
  dividers, same order. The English version is a translation, not a rewrite.

**Escaping.** The content is a template literal, so any literal backtick or
`${` in the body must be escaped (`` \` ``, `\${`). Check the Korean source for
these and carry the escaping over.

## 3. Wire it into articles.ts

Add a `translations` block to that article's existing entry, after
`loadContent`, leaving every Korean field as it is:

```ts
    translations: {
      en: {
        title: '...',
        subtitle: '...',
        loadContent: () => import('./article-content/en/my-post').then(({ myPostContentEn }) => myPostContentEn),
      },
    },
```

`slug`, `date`, `readMinutes`, `category`, and the images are shared across
languages — never duplicate them into the block. `readMinutes` stays the
Korean number; it is formatted per language at render time.

The title and subtitle are translated too, and they are headline copy rather
than prose — make them read as an English blog title, not as a literal gloss of
the Korean.

## 4. Verify

```bash
node scripts/translation-status.mjs   # the slug should have moved to translated
pnpm lint
pnpm test
pnpm build
```

`pnpm build` is the real check: content is loaded at build time in
`getStaticPaths`, so a bad import or a broken template literal fails here rather
than in the browser. All four must pass before you report the work done.

Note that `local/no-bare-internal-href` reaches into article content, so an
in-content link written as `/about` is a lint error — the Korean source will
already be in the right shape, so this only bites if you rewrite a link.

## 5. Report

List each slug you translated, and call out anything that needs a human:
diagrams with Korean labels, a passage whose meaning you were unsure of, or a
Korean-language link that an English reader cannot follow.
