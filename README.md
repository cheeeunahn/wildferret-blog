# wildferret-blog

Hi there, and welcome to my personal blog!
Thanks for stopping by 👋🏻

**Live site:** [blog.wildferret.dev](https://blog.wildferret.dev/)

## Tech stack

| Layer         | Choice                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Astro 7 (static output + one Worker API route, `@astrojs/cloudflare`)   |
| UI            | React 19 islands, TypeScript 5 (strict)                                 |
| Design system | [Astryx](https://github.com/facebook/astryx) (`@astryxdesign/core`)     |
| Styling       | Tailwind CSS 4 (`@tailwindcss/vite`) on Astryx's semantic color tokens  |
| Routing       | File-based (`src/pages/`), one prerendered tree per language, no router |
| Comments      | Supabase, reached only through the Worker's `/api/comments`             |

## Prerequisites

- **Node.js 22.12+**: required by Astro 7 (`engines.node: >=22.12.0`).
- **pnpm 10**: Corepack enables the pinned version automatically with
  `corepack enable`.

## Setup

```bash
pnpm install   # also installs the lefthook git hooks
```

For comments in `pnpm dev`, copy `.dev.vars.example` to `.dev.vars` and fill in
the three Supabase secrets (see the Comments section of [CLAUDE.md](CLAUDE.md)).
Without them the site still runs; the comment section just renders nothing.

## Scripts

| Command                   | Description                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                | Dev server (`astro dev`)                                              |
| `pnpm build`              | Type-check (`astro check`) and production build to `dist/`            |
| `pnpm preview`            | Serve the production build locally, at the configured base path       |
| `pnpm lint`               | ESLint, including the repo's own convention rules (`eslint-rules/`)   |
| `pnpm test`               | Vitest: unit tests, lint-rule tests and script tests                  |
| `pnpm format`             | Prettier over the repo (`format:check` to only check)                 |
| `pnpm translation:status` | List the articles that have no English version yet                    |
| `pnpm translate`          | Write the missing English versions (opens Claude Code)                |
| `pnpm astryx component X` | Astryx component API docs for `X`                                     |
| `pnpm theme:build`        | Rebuild `src/styles/astryx/wildferret.theme.css` after a theme edit   |
| `pnpm sbom`               | Regenerate `docs/sbom/` (CycloneDX SBOM + summary) after a dep change |
| `pnpm mint:api-jwt`       | Mint the Worker's `blog_api` JWT (needs `SUPABASE_JWT_SECRET`)        |
| `pnpm astro`              | The Astro CLI directly                                                |

## Project layout

```
public/
├── _headers                   # Security headers, incl. the CSP
├── assets/images/             # Article covers and other site imagery
├── assets/audio/              # The about hero's ambient sound
└── favicon.svg                # Site icon (must stay at root)
src/
├── layouts/
│   └── Base.astro             # <head>, header, footer, <slot /> — the shared shell
├── pages/                     # File-based routes; each page is a thin wrapper
│   ├── index.astro            # /                (Korean, canonical)
│   ├── about.astro            # /about
│   ├── article/[slug].astro   # /article/:slug
│   ├── [lang]/…               # The same pages under /kr/… and /en/…
│   ├── 404.astro              # One page for every miss, in both languages
│   └── api/comments.ts        # The one on-demand route (Worker code)
├── components/
│   ├── HomeView.astro         # The markup of each page, mounted by its routes
│   ├── AboutView.astro
│   ├── ArticleView.astro
│   ├── ArticleCard.astro      # A post tile on the home grid
│   ├── FerretHero.astro       # The about page's interactive ferret illustration
│   ├── LangSwitcher.astro     # Header language menu (plain links, no JS)
│   ├── CategoryFilter.tsx     # Island: home search + category pills
│   ├── Comments.tsx           # Island: an article's comment thread
│   ├── AiSummary.tsx          # Island: on-device "Summarize with AI"
│   └── ThemeToggle.tsx        # Island: light/dark switch
├── directives/summarizer.ts   # client:summarizer, hydrates AiSummary only where Chrome's AI exists
├── styles/
│   ├── global.css             # Layered imports, webfonts, token aliases
│   └── astryx/                # The Astryx theme (source + built CSS)
├── copy/
│   └── strings.ts             # All UI text, per language
├── client/                    # Browser code that reaches outside the page
│   ├── commentsApi.ts         # Browser → /api/comments
│   └── summarizer.ts          # Chrome built-in AI calls
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
    ├── articleTypes.ts        # `Article` types and the category list
    ├── articles.ts            # Article[] (newest first)
    ├── about.ts               # About-page copy, per language
    └── article-content/       # One file per article body; English in en/ (+ its own README)
docs/
├── adr/                       # Architecture decision records
├── trd/                       # Technical requirements (Astryx migration)
└── sbom/                      # Generated SBOM — do not edit by hand
eslint-rules/                  # Repo-local lint rules (layers, islands, links, XSS)
scripts/                       # Translation status/auto-translate, SBOM, JWT minting
supabase/migrations/           # Comments schema, roles and moderation trigger
```

Pages and components read data through `src/content/service.ts`, never from
`src/data` directly. A lint rule enforces the layer boundaries. See
[ADR 0001](docs/adr/0001-layered-architecture.md).

## Languages

Every page is built three times: Korean at `/` (canonical), the same Korean at
`/kr/…`, and English at `/en/…`. Language lives in the URL, never in client
state. All UI text is in `src/copy/strings.ts`, so a missing translation is a
type error rather than Korean leaking into `/en/`. A post with no English
version is simply left out of the English index.

## Rendering model

Every route is prerendered to a real HTML file at build time, and pages ship no
JavaScript unless something explicitly asks for it. Astryx display components
(`Heading`, `Text`, `ClickableCard`, …) used in `.astro` files render to static
HTML and ship nothing.

There are exactly four hydrated islands, each loaded as late as it can be:

| Island           | Hydration           | Why                                                                   |
| ---------------- | ------------------- | --------------------------------------------------------------------- |
| `ThemeToggle`    | `client:only`       | Reads `document` on first render; its wrapper reserves header space   |
| `CategoryFilter` | `client:load`       | The home toolbar is on screen at once; it only sets `hidden` on cards |
| `Comments`       | `client:visible`    | Loads React only when a reader scrolls to the end of an article       |
| `AiSummary`      | `client:summarizer` | Loads only in browsers that have Chrome's built-in AI                 |

A lint rule rejects `client:*` anywhere else. See the Islands policy in
[CLAUDE.md](CLAUDE.md).

## Design, fonts and theme

The site uses **Astryx's** default colors, typography and components
([ADR 0002](docs/adr/0002-astryx-design-system.md)). The theme in
`src/styles/astryx/wildferretTheme.ts` swaps in the webfont and raises the type
scale's base to 16px. Every page shares one 720px column, and the home page is a
search box, category pills and a two-column grid of cards after Astryx's Library
template ([ADR 0003](docs/adr/0003-library-layout-and-reading-scale.md)).

Use Astryx components and Astryx semantic tokens only: no raw hex values and no
stock Tailwind palette classes. The older token names (`text-ink-900`,
`bg-paper-warm`, …) still work, as aliases of Astryx tokens in `global.css`.

Body text is **Nanum Barun Gothic**, declared with `@font-face` in
`src/styles/global.css` and served from Naver's webfont CDN. **Pretendard**
(loaded via `<link>` from jsDelivr in `Base.astro`) is the fallback that renders
during the swap.

Dark mode follows `color-scheme`: Astryx's tokens are `light-dark()` values, so
almost nothing needs a `dark:` variant. An `is:inline` script in `<head>`
resolves the saved or system preference _before_ first paint, so there is no
light flash. `ThemeToggle` flips the theme and saves the choice to
`localStorage`. Until the reader picks a side, it keeps following the OS.

## Writing articles

Write the post in Korean. Its data lives entirely in `src/data/`:

1. Create `src/data/article-content/my-article.ts` and export the body as a template literal:
   ```ts
   export const myArticleContent = `...`
   ```
2. Add a `loadContent` dynamic import in `src/data/articles.ts`.
3. Prepend an entry to the `articles` array with its metadata (`slug`, `title`,
   `subtitle`, `date`, `readMinutes` as a number, `category`, optional
   `coverImage` / `cardImage`) and the loader.

Bodies are read at build time in `getStaticPaths`, so a broken `loadContent`
fails `pnpm build` instead of degrading in the browser.

**The English version is written for you.** Commit the Korean post and a git
hook adds the translation as a second commit. On push, a GitHub workflow
catches anything the hook missed. Either way a human reviews it in the PR. Text
baked into images is not translated, and later edits to the Korean are not
synced. Re-run `/translate-articles <slug>` when you change a translated post.
See Automatic Translation in [CLAUDE.md](CLAUDE.md).

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

### Images and links

Put images in `public/assets/images/` and reference them in `articles.ts` with a
leading slash and no base prefix (e.g. `/assets/images/my-cover.png`). Every
asset URL is resolved at render time by `resolveAssetUrl()` in
`src/shared/assetUrl.ts`, which prepends the base path for relative URLs and
passes absolute `https://` URLs through unchanged.

Internal _route_ links are a separate concern. Astro does not prefix `<a href>`
with the base path, and a link must also keep the reader in the language they
arrived in. Use `localeHref(locale, '/about')` from `src/shared/i18n.ts` (and
`isActiveInLocale()` for nav highlighting). Never write a bare `href="/about"`,
and never hardcode a base path prefix. A lint rule catches both.

## Deployment

The site is deployed as one Cloudflare Worker at the root path, so
[`astro.config.mjs`](astro.config.mjs) uses `base: '/'` by default. Set the
`BASE_PATH` env var to build for a host that serves the site under a path
prefix. Everything base-aware reads `import.meta.env.BASE_URL`, via
`resolveAssetUrl()` for assets and `localeHref()` / `href()` for internal links.

Astro prerenders one HTML file per page (`dist/client/about/index.html`,
`dist/client/en/article/<slug>/index.html`, …), served as static assets, so deep
links resolve directly and there is no SPA redirect shim to maintain. Unknown
paths get the prerendered `dist/client/404.html`.

The one exception is `/api/comments`, which runs as Worker code
(`dist/server/`, via the `@astrojs/cloudflare` adapter) and talks to Supabase
with runtime secrets. See the Comments section of [CLAUDE.md](CLAUDE.md) for
the secrets and the database cutover order.

## Tests and checks

`pnpm test` covers the article parser (block splitting, fenced code, the safe
inline formatter), the content service, i18n, comment moderation, the comments
API (transport, service, and repository against a mocked PostgREST), the
on-device summarizer, the lint rules, and the scripts. Add parser cases when
extending the supported article syntax.

Git hooks (lefthook) run `eslint --fix` and Prettier on commit, and the
translation check, `pnpm build` and `pnpm test` before a push.

The software bill of materials in [`docs/sbom/`](docs/sbom/README.md) is
generated from the lockfile by `pnpm sbom`. Re-run it in any PR that changes
`pnpm-lock.yaml`.

## Automation

Three GitHub Actions are wired up:

- [`claude-code-review.yml`](.github/workflows/claude-code-review.yml) reviews
  every pull request.
- [`claude.yml`](.github/workflows/claude.yml) responds to `@claude` mentions in
  issues, PRs, and review comments.
- [`translate-articles.yml`](.github/workflows/translate-articles.yml) writes the
  English version of any Korean post pushed without one.
