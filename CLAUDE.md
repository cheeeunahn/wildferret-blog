# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server
npm run build     # tsc -b + vite build → dist/
npm run lint      # ESLint
npm run preview   # serve dist/ locally
```

No test suite. No single-file build commands.

## Architecture

**Stack:** Vite 8, React 19, TypeScript 5 (strict), Tailwind CSS 4 (`@tailwindcss/vite`), React Router 7

**Deployment:** GitHub Pages at `cheeeunahn.github.io/wildferret-blog`. `vite.config.ts` sets `base: '/wildferret-blog/'`. The `BrowserRouter` uses `import.meta.env.BASE_URL` as its basename. All asset URLs must go through `resolveAssetUrl()` in `ArticlePage.tsx` (not raw `/` paths) — it prepends the base URL for relative paths and passes through absolute `https://` URLs unchanged.

**Routing** (`src/App.tsx`): Three routes under a shared `Layout` — `/` (HomePage), `/article/:slug` (ArticlePage), `/about` (AboutPage).

## Article System

Articles live entirely in `src/data/`:

- `articleTypes.ts` — `Article` interface (`slug`, `title`, `subtitle`, `date`, `category`, `readTime`, `coverImage?`, `content`)
- `article-content/*.ts` — each article exports its content as a template literal string
- `articles.ts` — imports content files and assembles the `Article[]` array (newest first)

**Adding an article:** create a new file in `src/data/article-content/`, export the content string, import it in `articles.ts`, and prepend a new entry to the array.

**Content format** (parsed in `ArticlePage.tsx` by `splitContentIntoBlocks`):
- Blocks are separated by blank lines (`\n\n`)
- `## Heading`, `### Heading` — section headings
- `> text` — blockquote
- `- item` — unordered list (consecutive `- ` lines in one block)
- `1. item` — ordered list
- `---` — horizontal divider
- `~~~lang … ~~~` — fenced code block (use `~~~` not backticks to avoid escaping issues in template literals)
- `![alt](path)` — inline image (path is resolved via `resolveAssetUrl`)
- `[diagram:id]` — renders a React component from `Diagrams.tsx` (see below)
- Inline: `**bold**`, `` `code` ``, `[text](url)`

**Cover images** go in `public/`. Reference them in `articles.ts` as `/filename.png` (leading slash, no base prefix — `resolveAssetUrl` handles it at render time).

## Diagram System

`src/components/Diagrams.tsx` contains named React diagram components registered in a `diagrams` map. Use `[diagram:id]` in article content to embed one. To add a new diagram: write a named component, add it to the `diagrams` record at the bottom of the file, then reference `[diagram:your-id]` in content.

Current diagrams: `voc-workflow`, `terminal-team`, `peers-architecture`, `tmux-split`, `comparison`.

## Design Tokens

Tailwind classes use a custom ink/paper token scale (e.g. `text-ink-900`, `bg-paper-warm`). Stick to the existing token names — don't introduce arbitrary hex colors or raw Tailwind palette colors.
