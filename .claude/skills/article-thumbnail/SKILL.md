---
name: article-thumbnail
description: Draw an article's card thumbnail with the Codex agent, in the blog's black-marker doodle style, and wire it into articles.ts. Use when adding a new article, when an article has no cardImage, when the card-thumbnails test fails, or when asked to make, redraw or re-roll a post's thumbnail.
argument-hint: <slug> [what to draw]
allowed-tools: Bash(.claude/skills/article-thumbnail/generate.sh:*), Read, Edit
---

# Article thumbnail

Every article needs a card thumbnail (`cardImage` is a required field, and
`src/content/service.test.ts` fails without the file). They all share one look:
**hand-drawn black marker doodle on white, one centered motif, no text** — see
the references below. Codex draws them; this skill picks the subject, runs it,
checks the result, and wires it in.

Style references (also passed to Codex as images):

- `public/assets/images/mgs-2026-play-hall-card.webp` — conference room + screen
- `public/assets/images/ai-git-101-for-designers-card.webp` — presentation easel
- `public/assets/images/synthetic-user-reading-card.webp` — scattered light bulbs

## Steps

1. **Find the article.** `$ARGUMENTS` starts with the slug. Read its entry in
   `src/data/articles.ts` and skim `src/data/article-content/<slug>.ts`.

2. **Pick the subject** unless the user gave one. One concrete object or tiny
   scene that stands for the post — the thing someone would doodle in a margin.
   Write it as one English sentence of objects, not concepts ("a notebook with
   a magnifying glass over it and a few sparkles", not "insight"). Avoid
   anything that needs text to read, and avoid repeating a motif an existing
   card already uses (screens with charts are taken twice).

3. **Run it** (takes a minute or two):

   ```bash
   .claude/skills/article-thumbnail/generate.sh <slug> "<subject>"
   ```

   It calls `codex exec` with the references attached, then converts the PNG to
   a 640×640 WebP at `public/assets/images/<slug>-card.webp`. On failure, read
   the `codex.log` path it prints.

4. **Look at it.** Read the WebP and compare it with one reference. Re-run
   (same command overwrites) if it has any of: color or gray shading, text or
   letters, a cropped or off-center motif, a busy scene, a thin/vector look
   instead of marker strokes. After two failed tries, show the user and ask.

5. **Wire it in.** Set `cardImage: '/assets/images/<slug>-card.webp'` on the
   entry in `articles.ts` (leading slash, no base prefix).

6. **Verify:** `pnpm vitest run src/content/service.test.ts`.

Show the user the final image and the subject you used. Do not commit unless
asked.
