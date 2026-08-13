# wildferret-blog

Hi there, and welcome to my personal blog!
Thanks for stopping by 👋🏻

**Live site:** [blog.wildferret.dev](https://blog.wildferret.dev/)

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19, TypeScript 5 (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Routing | React Router 7 |

## Prerequisites

- **Node.js 20+**
- **pnpm 10** — Corepack enables the pinned version automatically with
  `corepack enable`.

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Vite) |
| `pnpm build` | Type-check (`tsc -b`) and production build to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | ESLint |

There is no test suite.

## Project layout

```
public/
├── assets/images/             # Article covers and other site imagery
├── presentations/             # Standalone HTML presentation pages
├── 404.html                   # GitHub Pages SPA redirect shim (must stay at root)
└── favicon.svg                # Site icon (must stay at root)
src/
├── App.tsx                    # Routes: / , /article/:slug , /about
├── main.tsx
├── index.css                  # Tailwind entry + ink/paper design tokens
├── components/
│   ├── Layout.tsx             # Shared shell for all routes
│   ├── ArticleCard.tsx
│   └── Diagrams.tsx           # Named diagram components + registry
├── pages/
│   ├── HomePage.tsx
│   ├── ArticlePage.tsx        # Content parser + renderer
│   └── AboutPage.tsx
└── data/
    ├── articleTypes.ts        # `Article` interface
    ├── articles.ts            # Article[] (newest first)
    └── article-content/       # One file per article body
```

## Writing articles

Articles live entirely in `src/data/`. To add one:

1. Create `src/data/article-content/my-article.ts` and export the body as a template literal:
   ```ts
   export const myArticleContent = `...`
   ```
2. Import it in `src/data/articles.ts`.
3. Prepend an entry to the `articles` array with its metadata (`slug`, `title`,
   `subtitle`, `date`, `category`, `readTime`, optional `coverImage`) and
   `content: myArticleContent`.

### Content format

Blocks are separated by blank lines. Supported syntax:

| Syntax | Renders as |
|--------|------------|
| `## Heading` / `### Heading` | Section headings |
| `> text` | Blockquote |
| `- item` | Unordered list (consecutive lines in one block) |
| `1. item` | Ordered list |
| `---` | Horizontal divider |
| `~~~lang … ~~~` | Fenced code block — use `~~~`, not backticks, to avoid escaping inside template literals |
| `![alt](path)` | Inline image |
| `[diagram:id]` | Embedded React diagram |
| `**bold**`, `` `code` ``, `[text](url)` | Inline formatting |

Parsing lives in `splitContentIntoBlocks` in `src/pages/ArticlePage.tsx`.

### Images

Put images in `public/assets/images/` and reference them in `articles.ts` with a
leading slash and no base prefix (e.g. `/assets/images/my-cover.png`). Every
asset URL is resolved at render time by `resolveAssetUrl()` in `ArticlePage.tsx`,
which prepends the base path for relative URLs and passes absolute `https://`
URLs through unchanged. Standalone HTML pages belong under
`public/presentations/<slug>/index.html` and are linked using that directory
URL (for example, `/presentations/ai-git-101/`).
Never hardcode a `/wildferret-blog/` prefix.

### Diagrams

`src/components/Diagrams.tsx` holds named React diagram components registered in
a `diagrams` map. Reference one from article content with `[diagram:id]`. To add
a new one, write the component, register it in the `diagrams` record at the
bottom of the file, then use `[diagram:your-id]`.

Current diagrams: `voc-workflow`, `terminal-team`, `peers-architecture`,
`tmux-split`, `comparison`.

## Styling

Tailwind classes use a custom ink/paper token scale (`text-ink-900`,
`bg-paper-warm`, …). Stick to the existing token names rather than raw Tailwind
palette colors or arbitrary hex values.

## Deployment

The site is served from two places with different path prefixes, so
[`vite.config.ts`](vite.config.ts) picks `base` from the environment:

| Target | Base path | How it's set |
|--------|-----------|--------------|
| GitHub Pages | `/wildferret-blog/` | `BASE_PATH` env var (also the local default) |
| Cloudflare Worker | `/` | `WORKERS_CI` / `CF_PAGES` set by Cloudflare's build env |

`BASE_PATH` overrides both when set explicitly. `BrowserRouter` uses
`import.meta.env.BASE_URL` as its basename.

**GitHub Pages** — no longer deployed automatically. To publish there, build
with `BASE_PATH=/wildferret-blog/ pnpm build` and upload `dist/` yourself.
`public/404.html` is the SPA redirect shim Pages needs for deep links.

**Cloudflare** — [`wrangler.jsonc`](wrangler.jsonc) configures a static-assets-only
Worker (no server entrypoint) that uploads `./dist` with
`not_found_handling: "single-page-application"` so React Router handles
`/article/:slug`.

## Automation

Two Claude Code GitHub Actions are wired up:
[`claude-code-review.yml`](.github/workflows/claude-code-review.yml) reviews every
pull request, and [`claude.yml`](.github/workflows/claude.yml) responds to
`@claude` mentions in issues, PRs, and review comments.
