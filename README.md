# wildferret-blog

Hi there, and welcome to my personal blog!
Thanks for stopping by 👋🏻

**Live site:** [blog.wildferret.dev](https://blog.wildferret.dev/)

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Astro 7 (static output) |
| UI | React 19 islands, TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Routing | File-based (`src/pages/`) — no client-side router |

## Prerequisites

- **Node.js 22.12+** — required by Astro 7 (`engines.node: >=22.12.0`).
- **pnpm 10** — Corepack enables the pinned version automatically with
  `corepack enable`.

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (`astro dev`) |
| `pnpm build` | Type-check (`astro check`) and production build to `dist/` |
| `pnpm preview` | Serve the production build locally, at the configured base path |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests for article-content utilities |
| `pnpm astro` | The Astro CLI directly |

## Project layout

```
public/
├── assets/images/             # Article covers and other site imagery
└── favicon.svg                # Site icon (must stay at root)
src/
├── layouts/
│   └── Base.astro             # <head>, header, footer, <slot /> — the shared shell
├── pages/                     # File-based routes
│   ├── index.astro            # /
│   ├── about.astro            # /about
│   ├── article/[slug].astro   # /article/:slug — getStaticPaths + content renderer
│   └── 404.astro
├── components/
│   ├── ArticleCard.astro
│   ├── ThemeToggle.tsx        # The only hydrated island (client:only)
│   ├── Diagrams.tsx           # Static React diagrams — server-rendered, zero JS
│   └── diagramRegistry.ts     # id → diagram component map
├── styles/
│   └── global.css             # Tailwind entry + ink/paper design tokens
├── lib/
│   ├── articleContent.ts      # Parser, safe inline formatter
│   ├── assetUrl.ts            # Deployment-safe asset URL resolver
│   └── siteUrl.ts             # href / toAppPath / isActive — base-aware routes
└── data/
    ├── articleTypes.ts        # `Article` interface
    ├── articles.ts            # Article[] (newest first)
    └── article-content/       # One file per article body (+ its own README)
```

## Rendering model

Every route is prerendered to a real HTML file at build time, and pages ship no
JavaScript unless something explicitly asks for it. Two rules keep it that way:

- **`ThemeToggle.tsx` is the only hydrated island.** It is mounted
  `client:only="react"` because it reads `document.documentElement` in a
  `useState` initializer, which has no server equivalent. Its fixed-size wrapper
  in `Base.astro` reserves layout space so the header does not shift on mount.
- **Diagrams carry no `client:*` directive.** They are React components, but
  pure static JSX, so Astro server-renders them to HTML. Adding a hook or an
  event handler to one silently breaks that and would pull a React runtime onto
  every article page.

Pages, `src/layouts/Base.astro`, and `ArticleCard.astro` are `.astro` files and
ship zero JavaScript by construction.

## Fonts and theme

Body text is **Nanum Barun Gothic**, declared with `@font-face` in
`src/styles/global.css` and served from Naver's webfont CDN. It ships only
UltraLight/Light/Regular/Bold, so the `@theme` stack keeps Pretendard as the
fallback that renders during the swap; `--font-sketch` (Gaegu) is the accent
face. Pretendard and Gaegu are loaded via `<link>` in `Base.astro`.

Dark mode is a `.dark` class on `<html>` that reassigns the same ink/paper
tokens — which is why almost nothing in the codebase needs a `dark:` variant. An
`is:inline` script in `<head>` resolves the saved or system preference *before*
first paint, so there is no light flash; `ThemeToggle` only flips the class and
persists the choice to `localStorage`. Until the reader picks a side themselves,
the toggle keeps following OS changes live.

## Writing articles

Articles live entirely in `src/data/`. To add one:

1. Create `src/data/article-content/my-article.ts` and export the body as a template literal:
   ```ts
   export const myArticleContent = `...`
   ```
2. Add a `loadContent` dynamic import in `src/data/articles.ts`.
3. Prepend an entry to the `articles` array with its metadata (`slug`, `title`,
   `subtitle`, `date`, `readTime`, optional `coverImage`) and the loader.

Bodies are read at build time in `getStaticPaths`, so a broken `loadContent`
fails `pnpm build` instead of degrading in the browser.

### Content format

Blocks are separated by blank lines. Supported syntax:

| Syntax | Renders as |
|--------|------------|
| `## Heading` / `### Heading` | Section headings |
| `> text` | Blockquote |
| `- item` | Unordered list (consecutive lines in one block) |
| `1. item` | Ordered list |
| `\| a \| b \|` | Table (consecutive pipe-delimited lines) |
| `---` | Horizontal divider |
| `~~~lang … ~~~` | Fenced code block — use `~~~`, not backticks, to avoid escaping inside template literals |
| `![alt](path)` | Inline image |
| `[diagram:id]` | Embedded React diagram |
| `**bold**`, `` `code` ``, `[text](url)` | Inline formatting |

Parsing and safe inline formatting live in `src/lib/articleContent.ts`.

### Images

Put images in `public/assets/images/` and reference them in `articles.ts` with a
leading slash and no base prefix (e.g. `/assets/images/my-cover.png`). Every
asset URL is resolved at render time by `resolveAssetUrl()` in `src/lib/assetUrl.ts`,
which prepends the base path for relative URLs and passes absolute `https://`
URLs through unchanged.

Internal *route* links are a separate concern: Astro does not prefix `<a href>`
with the base path, so use `href()` from `src/lib/siteUrl.ts` (and `isActive()`
for nav highlighting). Never write a bare `href="/about"`, and never hardcode a
base path prefix.

### Diagrams

`src/components/Diagrams.tsx` holds named React diagram components, mapped by id
in `src/components/diagramRegistry.ts`. Reference one from article content with
`[diagram:id]`. To add a new one, write the component, register it in the
`diagrams` record, then use `[diagram:your-id]`.

They render with no `client:*` directive, so Astro turns them into static HTML
and ships no JavaScript for them. Adding a hook or an event handler to a diagram
breaks that and would require hydrating it.

Current diagrams: `voc-workflow`, `terminal-team`, `peers-architecture`,
`tmux-split`, `comparison`.

## Styling

Tailwind classes use a custom ink/paper token scale (`text-ink-900`,
`bg-paper-warm`, …). Stick to the existing token names rather than raw Tailwind
palette colors or arbitrary hex values.

## Deployment

The site is deployed as a Cloudflare static-assets Worker at the root path, so
[`astro.config.mjs`](astro.config.mjs) uses `base: '/'` by default. Set the
`BASE_PATH` env var to build for a host that serves the site under a path
prefix. Everything base-aware reads `import.meta.env.BASE_URL`, via
`resolveAssetUrl()` for assets and `href()` for internal links.

Astro prerenders one HTML file per route (`dist/about/index.html`,
`dist/article/<slug>/index.html`, …), so deep links resolve directly and there
is no SPA redirect shim to maintain.

[`wrangler.jsonc`](wrangler.jsonc) configures a static-assets-only Worker (no
server entrypoint) that uploads `./dist` with `not_found_handling: "404-page"`,
served by the prerendered `dist/404.html`.

## Tests

`pnpm test` covers block splitting (including fenced code) and the safe inline
formatter. Add cases here when extending the supported article syntax.

## Automation

Two Claude Code GitHub Actions are wired up:
[`claude-code-review.yml`](.github/workflows/claude-code-review.yml) reviews every
pull request, and [`claude.yml`](.github/workflows/claude.yml) responds to
`@claude` mentions in issues, PRs, and review comments.
