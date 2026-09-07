# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # dev server (astro dev)
pnpm build     # astro check + astro build → dist/
pnpm preview   # serve dist/ locally (at the configured base path)
pnpm lint      # ESLint
pnpm test      # unit tests for the article-content parser
pnpm astro     # the Astro CLI directly
```

One test file: `src/lib/articleContent.test.ts`, run by vitest via `vitest.config.ts`. No single-file build commands.

Astro 7 requires **Node 22.12+**; pnpm 10 is pinned via `packageManager`.

## Architecture

**Stack:** Astro 7 (static output), React 19 islands, TypeScript 5 (strict), Tailwind CSS 4 (`@tailwindcss/vite`)

Every route is prerendered to a real HTML file at build time. There is no client-side router.

**Deployment:** a root-path Cloudflare static worker. `astro.config.mjs` uses `base: '/'`, overridable via the `BASE_PATH` env var for a path-prefixed host. `wrangler.jsonc` uploads `./dist` with `not_found_handling: "404-page"`, served by the prerendered `dist/404.html`.

**Routing** (file-based, `src/pages/`). Every page exists in three prerendered trees — see Languages below:
- `index.astro` → `/` · `about.astro` → `/about` · `article/[slug].astro` → `/article/:slug` (Korean, canonical)
- `[lang]/index.astro`, `[lang]/about.astro`, `[lang]/article/[slug].astro` → the same pages under `/kr/…` and `/en/…`
- `404.astro` → `dist/404.html` — one file serves every miss, `/en/` included, so it answers in **both** languages

The page files are thin: each resolves a `Locale`, then renders a view component (`HomeView`, `AboutView`, `ArticleView` in `src/components/`) that holds the actual markup. The markup lives in exactly one place — edit the view, not one of the two routes that mount it.

`src/layouts/Base.astro` is the shared shell: `<head>` (title, favicon, fonts, canonical + `hreflang` alternates, the pre-paint theme script), header, footer, and a `<slot />`. It takes a required `locale` prop.

## Islands policy

This is the rule that is easiest to break by accident.

- Pages, the layout, and `ArticleCard.astro` are `.astro` and ship **zero** JavaScript.
- `src/components/ThemeToggle.tsx` is the **only** hydrated island. It is mounted `client:only="react"` because it reads `document.documentElement` in a `useState` initializer, which has no server equivalent. Its fixed-size wrapper in `Base.astro` reserves layout space so the header does not shift on mount.
- `src/components/Diagrams.tsx` components render with **no** `client:*` directive — they are pure static JSX, so Astro server-renders them to HTML with no client JS. **Adding a hook or an event handler to any diagram silently breaks this** and would force a `client:*` directive (and with it a React runtime on article pages).

## Linking

Astro does **not** prefix `<a href>` with the configured `base`, and there is no router `<Link>` to do it.

- Internal route hrefs in a template → **`localeHref(locale, '/about')`** from `src/lib/i18n.ts`. It applies the language prefix *and* the base prefix, so a reader who arrived under `/en` stays under `/en`. A bare `href()` here would silently drop them back into the Korean tree.
- Nav active state → `isActiveInLocale(Astro.url.pathname, '/about')` from the same module; it strips both the base and the language segment
- Language-free page identity (`/en/about` → `/about`) → `toLangFreePath()`, the normalizer `isActiveInLocale` is built on
- `href()` / `toAppPath()` from `src/lib/siteUrl.ts` are the base-prefix-only layer underneath `localeHref`. Use them directly only when a link must ignore language (the canonical URL, the switcher's own targets).
- Images and in-content links → `resolveAssetUrl()` from `src/lib/assetUrl.ts`

`href()` passes protocol-relative, `https:`, `mailto:`, and `tel:` URLs through untouched; `resolveAssetUrl()` passes `http(s)://` through.

Never write a bare `href="/about"`, and never hardcode a base path prefix.

## Languages

Three prerendered trees, all built from the same view components:

| URL | Language | Role |
| --- | --- | --- |
| `/`, `/about`, `/article/:slug` | Korean | canonical — `<link rel="canonical">` points here |
| `/kr/…` | Korean | explicit-prefix alias, canonicalised onto `/` |
| `/en/…` | English | canonical for itself |

Language lives in the **URL**, never in client state — every page is a static file, so there is nothing to read a preference from at request time. A `Locale` is therefore a `{ lang, prefix }` pair, not just a language: `''` and `'/kr'` are the same language at different URLs, and links have to stay in the prefix the reader arrived through.

`src/lib/i18n.ts` owns the URL side (`localeHref`, `toLangFreePath`, `switchLangHref`, `canonicalPath`) and is covered by `src/lib/i18n.test.ts`. Note the two spellings of Korean: `LANG_SEGMENTS` maps it to the reader-facing `kr` used in URLs, `HTML_LANGS` to the standards-facing `ko` used in `<html lang>` and `hreflang`.

**All chrome text lives in `src/lib/strings.ts`**, keyed by language behind the `Strings` interface, and about-page copy in `src/data/about.ts`. Never put a user-visible literal in a template — a missing key is a type error, but a hardcoded Korean string is a silent leak into `/en/`. The one `is:inline` script that needs translated text (the hero's sound toggle) reads it off `data-*` attributes rather than being templated, so the script stays static.

The header switcher (`src/components/LangSwitcher.astro`) is plain links, no island. It always targets an explicit prefix, so `/en/about ↔ /kr/about` round-trips.

**Adding a language:** add it to `LANGS` + `LANG_SEGMENTS` + `HTML_LANGS` in `i18n.ts`, then add its column to `strings.ts` and `about.ts`. TypeScript will point at every remaining hole; the routes and the switcher pick it up with no further edits.

## Article System

Articles live entirely in `src/data/`:

- `articleTypes.ts` — `Article` (`slug`, `title`, `subtitle`, `date`, `readMinutes`, `category`, `coverImage?`, `cardImage?`, `loadContent`, `translations?`) plus `localizeArticle()`
- `article-content/*.ts` — each article exports its Korean content as a template literal string; `article-content/en/*.ts` holds the English versions
- `articles.ts` — declares metadata and the `loadContent` dynamic imports (newest first), and exposes `articlesIn(lang)` / `articleIn(slug, lang)` / `langsForSlug(slug)`

`readMinutes` is a **number**, formatted per language (`12분 읽기` / `12 min read`). Never store a unit string like `'12분'` in the data.

**Adding an article:** create a new file in `src/data/article-content/`, export the content string, add a dynamic `loadContent` import in `articles.ts`, and prepend a new entry to the array.

**Translating an article:** add `src/data/article-content/en/<slug>.ts` exporting `<name>ContentEn`, then add a `translations.en` block (`title`, `subtitle`, `loadContent`) to that article's entry. The base fields stay Korean. A post with no `translations.en` is simply **left out** of the English index and gets no `/en/article/:slug` route — untranslated Korean is never served at an English URL, and the switcher on such a post falls back to the `/en` home rather than a 404.

Bodies are read at **build time** in `getStaticPaths`, so a broken `loadContent` fails `pnpm build` rather than degrading at runtime. There is no loading or error state to render.

**Content format** (parsed by `src/lib/articleContent.ts`, rendered by `src/components/ArticleView.astro`):
- Blocks are separated by blank lines (`\n\n`)
- `## Heading`, `### Heading` — section headings
- `> text` — blockquote
- `- item` — unordered list (consecutive `- ` lines in one block)
- `1. item` — ordered list
- `| a | b |` — table (consecutive pipe-delimited lines)
- `---` — horizontal divider
- `~~~lang … ~~~` — fenced code block (use `~~~` not backticks to avoid escaping issues in template literals)
- `![alt](path)` — inline image (path is resolved via `resolveAssetUrl`)
- `[diagram:id]` — renders a React component from `Diagrams.tsx` (see below)
- Inline: `**bold**`, `` `code` ``, `[text](url)`

The block-type dispatch in `ArticleView.astro` is order-dependent — table detection must stay after list detection.

**Cover images** go in `public/assets/images/`. Reference them in `articles.ts` with a leading slash and no base prefix — `resolveAssetUrl` handles it at render time.

## Diagram System

`src/components/Diagrams.tsx` contains named React diagram components, mapped by id in `src/components/diagramRegistry.ts`. Use `[diagram:id]` in article content to embed one. To add a new diagram: write a named component in `Diagrams.tsx`, add it to the `diagrams` record in `diagramRegistry.ts`, then reference `[diagram:your-id]` in content.

The registry is a plain static map — not `React.lazy` — because diagrams render at build time with no `<Suspense>` boundary and no client runtime. See the Islands policy above.

Current diagrams: `voc-workflow`, `terminal-team`, `peers-architecture`, `tmux-split`, `comparison`.

## Design Tokens

`src/styles/global.css` holds the Tailwind entry (`@import "tailwindcss"`), the Nanum `@font-face` declarations, and an `@theme` block defining a custom ink/paper token scale (e.g. `text-ink-900`, `bg-paper-warm`). Dark mode is a `.dark` class on `<html>` that reassigns the same tokens, which is why almost nothing in the codebase needs a `dark:` variant. Stick to the existing token names — don't introduce arbitrary hex colors or raw Tailwind palette colors.

Entrance motion: `.page-enter` on each page's wrapper plus `.animate-reveal` (and the `.delay-*` scale) on its children. The `.boot-shell` / `.boot-header` keyframes are leftovers from the SPA and are deliberately unused — applying them to the layout chrome would replay the header animation on every navigation.

## Lint Rules

`pnpm lint` runs ESLint over `src/**/*.{ts,tsx}` **and** `src/**/*.astro`. Alongside the published rule sets, `eslint-rules/` is a repo-local plugin (registered as `local` in `eslint.config.js`) that turns the three conventions above into errors:

| Rule | Scope | Enforces |
| --- | --- | --- |
| `local/no-bare-internal-href` | ts, tsx, astro | Linking — no bare `href="/about"` / `src="/assets/…"`, no hardcoded base prefix in any string (this half also reaches markdown links inside `article-content/*.ts`) |
| `local/no-raw-colors` | ts, tsx, astro | Design Tokens — no stock Tailwind palette classes, no hex/`rgb()` in `class`/`style`/`fill`/`stroke` |
| `local/no-unlisted-island` | astro | Islands policy — `client:*` only on `<ThemeToggle>` (allowlist is the rule's `allow` option) |
| `local/no-interactive-diagrams` | `Diagrams.tsx` only | Islands policy — no hooks, no `on*` handlers |

**Adding a rule:** write `eslint-rules/<name>.js` exporting the standard `{ meta, create }` object (plain ESM, no build step), register it in `eslint-rules/index.js`, enable it in the right block of `eslint.config.js`, and add `RuleTester` cases to `eslint-rules/rules.test.js` — `pnpm test` runs those alongside the parser tests.

Two config details worth knowing before editing `eslint.config.js`:

- The `.astro` block extends `astro.configs['flat/base']`, not `recommended`. `flat/base` supplies the parser and the `<script>` processor without the opinionated rules, which would otherwise fight the deliberately untranspiled pre-paint theme script in `Base.astro`.
- The ts/tsx block carries `ignores: ['**/*.astro/*']`. The Astro processor emits each `<script>` block as a virtual `Base.astro/0_0.ts`, and `src/**/*.ts` matches that path — without the ignore, the React and typescript-eslint rule sets land on that same inline script.
