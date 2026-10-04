# wildferret-blog

Hi there, and welcome to my personal blog!
Thanks for stopping by 👋🏻

**Live site:** [blog.wildferret.dev](https://blog.wildferret.dev/)

## Tech stack

| Layer     | Choice                                            |
| --------- | ------------------------------------------------- |
| Framework | Astro 7 (static output + one Worker API route)    |
| UI        | React 19 islands, TypeScript 5 (strict)           |
| Styling   | Tailwind CSS 4 (`@tailwindcss/vite`)              |
| Routing   | File-based (`src/pages/`) — no client-side router |

## Prerequisites

- **Node.js 22.12+** — required by Astro 7 (`engines.node: >=22.12.0`).
- **pnpm 10** — Corepack enables the pinned version automatically with
  `corepack enable`.

## Setup

```bash
pnpm install
```

## Scripts

| Command        | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `pnpm dev`     | Dev server (`astro dev`)                                        |
| `pnpm build`   | Type-check (`astro check`) and production build to `dist/`      |
| `pnpm preview` | Serve the production build locally, at the configured base path |
| `pnpm lint`    | ESLint                                                          |
| `pnpm test`    | Unit tests for article-content utilities                        |
| `pnpm astro`   | The Astro CLI directly                                          |

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
│   ├── 404.astro
│   └── api/comments.ts        # The one on-demand route (Worker code)
├── components/
│   ├── ArticleCard.astro
│   └── ThemeToggle.tsx        # The only hydrated island (client:only)
├── styles/
│   └── global.css             # Tailwind entry + ink/paper design tokens
├── copy/
│   └── strings.ts             # All UI text, per language
├── client/
│   └── commentsApi.ts         # Browser → /api/comments
├── server/comments/           # Logic, run per request in the Worker
│   ├── http.ts                # /api/comments transport (statuses, size limit)
│   ├── service.ts             # Validation + moderation pre-check
│   └── repository.ts          # The only Supabase caller (as role blog_api)
├── content/                   # Logic, run at build time
│   ├── service.ts             # articlesIn / langsForSlug / localizeArticle / aboutCopy
│   └── parser.ts              # Article-content parser, safe inline formatter
├── shared/                    # Pure helpers, importable from any layer
│   ├── comments.ts            # /api/comments wire type
│   ├── i18n.ts                # Locales and language-aware hrefs
│   ├── moderation.ts          # Comment pre-check + rejection copy
│   ├── assetUrl.ts            # Deployment-safe asset URL resolver
│   └── siteUrl.ts             # href / toAppPath — base-aware routes
└── data/                      # Pure data, no logic
    ├── articleTypes.ts        # `Article` types
    ├── articles.ts            # Article[] (newest first)
    ├── about.ts               # About-page copy
    └── article-content/       # One file per article body (+ its own README)
```

Pages and components read data through `src/content/service.ts`, never from
`src/data` directly — a lint rule enforces the layer boundaries. See
[ADR 0001](docs/adr/0001-layered-architecture.md).

## Rendering model

Every route is prerendered to a real HTML file at build time, and pages ship no
JavaScript unless something explicitly asks for it. Two rules keep it that way:

- **`ThemeToggle.tsx` is the only hydrated island.** It is mounted
  `client:only="react"` because it reads `document.documentElement` in a
  `useState` initializer, which has no server equivalent. Its fixed-size wrapper
  in `Base.astro` reserves layout space so the header does not shift on mount.

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
`is:inline` script in `<head>` resolves the saved or system preference _before_
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

| Syntax                                  | Renders as                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `## Heading` / `### Heading`            | Section headings                                                                         |
| `> text`                                | Blockquote                                                                               |
| `- item`                                | Unordered list (consecutive lines in one block)                                          |
| `1. item`                               | Ordered list                                                                             |
| `\| a \| b \|`                          | Table (consecutive pipe-delimited lines)                                                 |
| `---`                                   | Horizontal divider                                                                       |
| `~~~lang … ~~~`                         | Fenced code block — use `~~~`, not backticks, to avoid escaping inside template literals |
| `![alt](path)`                          | Inline image                                                                             |
| `**bold**`, `` `code` ``, `[text](url)` | Inline formatting                                                                        |

Parsing and safe inline formatting live in `src/content/parser.ts`.

### Images

Put images in `public/assets/images/` and reference them in `articles.ts` with a
leading slash and no base prefix (e.g. `/assets/images/my-cover.png`). Every
asset URL is resolved at render time by `resolveAssetUrl()` in `src/shared/assetUrl.ts`,
which prepends the base path for relative URLs and passes absolute `https://`
URLs through unchanged.

Internal _route_ links are a separate concern: Astro does not prefix `<a href>`
with the base path, so use `href()` from `src/shared/siteUrl.ts` (and `isActive()`
for nav highlighting). Never write a bare `href="/about"`, and never hardcode a
base path prefix.

## Styling

Tailwind classes use a custom ink/paper token scale (`text-ink-900`,
`bg-paper-warm`, …). Stick to the existing token names rather than raw Tailwind
palette colors or arbitrary hex values.

## Deployment

The site is deployed as one Cloudflare Worker at the root path, so
[`astro.config.mjs`](astro.config.mjs) uses `base: '/'` by default. Set the
`BASE_PATH` env var to build for a host that serves the site under a path
prefix. Everything base-aware reads `import.meta.env.BASE_URL`, via
`resolveAssetUrl()` for assets and `href()` for internal links.

Astro prerenders one HTML file per page (`dist/client/about/index.html`,
`dist/client/article/<slug>/index.html`, …), served as static assets, so deep
links resolve directly and there is no SPA redirect shim to maintain. Unknown
paths get the prerendered `dist/client/404.html`.

The one exception is `/api/comments`, which runs as Worker code
(`dist/server/`, via the `@astrojs/cloudflare` adapter) and talks to Supabase
with runtime secrets. See the Comments section of [CLAUDE.md](CLAUDE.md) for
the secrets and the database cutover order.

## Tests

`pnpm test` covers the article parser (block splitting, fenced code, the safe
inline formatter), the content service, i18n, comment moderation, the comments
API (transport, service, and repository against a mocked PostgREST), the lint
rules, and the scripts. Add parser cases when extending the supported article
syntax.

## Automation

Two Claude Code GitHub Actions are wired up:
[`claude-code-review.yml`](.github/workflows/claude-code-review.yml) reviews every
pull request, and [`claude.yml`](.github/workflows/claude.yml) responds to
`@claude` mentions in issues, PRs, and review comments.
