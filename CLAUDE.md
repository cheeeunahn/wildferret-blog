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

**Routing** (file-based, `src/pages/`):
- `index.astro` → `/`
- `about.astro` → `/about`
- `article/[slug].astro` → `/article/:slug`, via `getStaticPaths` over the `articles` array
- `404.astro` → `dist/404.html`

`src/layouts/Base.astro` is the shared shell: `<head>` (title, favicon, fonts, the pre-paint theme script), header, footer, and a `<slot />`.

## Islands policy

This is the rule that is easiest to break by accident.

- Pages, the layout, and `ArticleCard.astro` are `.astro` and ship **zero** JavaScript.
- There are exactly **two** hydrated islands, and they hydrate differently on purpose:
  - `src/components/ThemeToggle.tsx` — `client:only="react"`, because it reads `document.documentElement` in a `useState` initializer, which has no server equivalent. Its fixed-size wrapper in `Base.astro` reserves layout space so the header does not shift on mount.
  - `src/components/Comments.tsx` — `client:visible` in `article/[slug].astro`. It has no server-hostile code, so the shell prerenders and the React runtime downloads only once a reader scrolls to the bottom of an article. Article pages keep a zero-JS first paint. Do not "simplify" this to `client:load`, which would ship React to every article on load.
- The allowlist for the above lives in `eslint.config.js` (the `allow` option on `local/no-unlisted-island`), not in the rule file.
- `src/components/Diagrams.tsx` components render with **no** `client:*` directive — they are pure static JSX, so Astro server-renders them to HTML with no client JS. **Adding a hook or an event handler to any diagram silently breaks this** and would force a `client:*` directive (and with it a React runtime on article pages).

## Linking

Astro does **not** prefix `<a href>` with the configured `base`, and there is no router `<Link>` to do it.

- Internal route hrefs → `href()` from `src/lib/siteUrl.ts`
- Nav active state → `isActive(Astro.url.pathname, '/about')` from the same module; it strips the base prefix, which a bare `Astro.url.pathname === '/about'` comparison would not
- Base-prefixed pathname → app path (`'/'`-rooted, no trailing slash) → `toAppPath()`, the normalizer `isActive` is built on
- Images and in-content links → `resolveAssetUrl()` from `src/lib/assetUrl.ts`

`href()` passes protocol-relative, `https:`, `mailto:`, and `tel:` URLs through untouched; `resolveAssetUrl()` passes `http(s)://` through.

Never write a bare `href="/about"`, and never hardcode a base path prefix.

## Article System

Articles live entirely in `src/data/`:

- `articleTypes.ts` — `Article` interface (`slug`, `title`, `subtitle`, `date`, `readTime`, `coverImage?`, `loadContent`)
- `article-content/*.ts` — each article exports its content as a template literal string
- `articles.ts` — declares metadata and the `loadContent` dynamic imports (newest first)

**Adding an article:** create a new file in `src/data/article-content/`, export the content string, add a dynamic `loadContent` import in `articles.ts`, and prepend a new entry to the array.

Bodies are read at **build time** in `getStaticPaths`, so a broken `loadContent` fails `pnpm build` rather than degrading at runtime. There is no loading or error state to render.

**Content format** (parsed by `src/lib/articleContent.ts`, rendered by `src/pages/article/[slug].astro`):
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

The block-type dispatch in `[slug].astro` is order-dependent — table detection must stay after list detection.

**Cover images** go in `public/assets/images/`. Reference them in `articles.ts` with a leading slash and no base prefix — `resolveAssetUrl` handles it at render time.

## Diagram System

`src/components/Diagrams.tsx` contains named React diagram components, mapped by id in `src/components/diagramRegistry.ts`. Use `[diagram:id]` in article content to embed one. To add a new diagram: write a named component in `Diagrams.tsx`, add it to the `diagrams` record in `diagramRegistry.ts`, then reference `[diagram:your-id]` in content.

The registry is a plain static map — not `React.lazy` — because diagrams render at build time with no `<Suspense>` boundary and no client runtime. See the Islands policy above.

Current diagrams: `voc-workflow`, `terminal-team`, `peers-architecture`, `tmux-split`, `comparison`.

## Design Tokens

`src/styles/global.css` holds the Tailwind entry (`@import "tailwindcss"`), the Nanum `@font-face` declarations, and an `@theme` block defining a custom ink/paper token scale (e.g. `text-ink-900`, `bg-paper-warm`). Dark mode is a `.dark` class on `<html>` that reassigns the same tokens, which is why almost nothing in the codebase needs a `dark:` variant. Stick to the existing token names — don't introduce arbitrary hex colors or raw Tailwind palette colors.

Entrance motion: `.page-enter` on each page's wrapper plus `.animate-reveal` (and the `.delay-*` scale) on its children. The `.boot-shell` / `.boot-header` keyframes are leftovers from the SPA and are deliberately unused — applying them to the layout chrome would replay the header animation on every navigation.

## Comments

Anonymous, nickname-only comments on article pages, stored in Supabase. Schema and moderation live in `supabase/migrations/0001_blog_user_comments.sql`; apply it in the Supabase SQL editor.

The site is static with no server runtime, so the browser talks to PostgREST directly (`src/lib/supabaseComments.ts`, plain `fetch` — deliberately **not** `@supabase/supabase-js`, which is ~40kB for two REST calls). Two consequences that drive the whole design:

- **The publishable key is public.** It is inlined into the built JS, and anyone can POST to the REST endpoint without going through the form. So nothing in the frontend is a security control. Access is enforced by RLS plus *column-level* grants (`grant insert (article_slug, nickname, body)`), and content by the `moderate_comment()` BEFORE INSERT trigger. `src/lib/moderation.ts` is a client-side subset of that trigger for instant feedback only — it deliberately omits the profanity list, which lives in a table `anon` cannot read.
- **Rejections travel as reason codes, never messages.** The trigger raises with a `hint` (`pii_phone`, `profanity`, `too_fast`, …); the copy lives in `REJECTION_MESSAGES` in `moderation.ts`. Never render a PostgREST `message`/`details` string — that would make the error path an injection channel.

### Stored XSS — the trap in this repo

Comment text is attacker-controlled and stored verbatim. **The moderation trigger is not an XSS filter**: `<script>` passes through it and is stored as text, which is correct, because storage was never the vulnerability. Rendering is.

`article/[slug].astro` renders prose with `set:html={formatInline(...)}`, which emits raw HTML *on purpose* — that is how `**bold**` works, and it is safe only because its input is your own content. Reusing that parser for comments is the obvious-looking move and would be a textbook stored-XSS hole.

- Render comment `body` and `nickname` as JSX children (`{c.body}`) and let React escape them. **This is the actual defense.** Nickname counts too — it looks like metadata, which is why it gets rendered carelessly.
- `local/no-unescaped-user-html` enforces the mechanical half (no `dangerouslySetInnerHTML`, no `formatInline` import in `src/components/`).
- If you ever add markdown to comments, that needs a real sanitizer on the output — not the article parser. If you ever autolink URLs, allowlist `http:`/`https:`; React does not escape a `javascript:` href.

`public/_headers` carries a CSP, but note what it is not: `script-src` must allow `'unsafe-inline'` because Astro emits its island runtime as inline scripts, so the CSP is **not** a backstop against script injection. It still buys `connect-src` (no exfiltration to arbitrary hosts), `object-src`, `base-uri`, and `frame-ancestors`.

### Environment

`PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`) are inlined at **build** time, so they must be set wherever `pnpm build` runs — locally in `.env`, and as build environment variables in Cloudflare. Setting them as Worker runtime secrets does nothing. Use the publishable key, never `service_role`, which bypasses RLS.

## Lint Rules

`pnpm lint` runs ESLint over `src/**/*.{ts,tsx}` **and** `src/**/*.astro`. Alongside the published rule sets, `eslint-rules/` is a repo-local plugin (registered as `local` in `eslint.config.js`) that turns the conventions above into errors:

| Rule | Scope | Enforces |
| --- | --- | --- |
| `local/no-bare-internal-href` | ts, tsx, astro | Linking — no bare `href="/about"` / `src="/assets/…"`, no hardcoded base prefix in any string (this half also reaches markdown links inside `article-content/*.ts`) |
| `local/no-raw-colors` | ts, tsx, astro | Design Tokens — no stock Tailwind palette classes, no hex/`rgb()` in `class`/`style`/`fill`/`stroke` |
| `local/no-unlisted-island` | astro | Islands policy — `client:*` only on `<ThemeToggle>` and `<Comments>` (allowlist is the rule's `allow` option, set in `eslint.config.js`) |
| `local/no-interactive-diagrams` | `Diagrams.tsx` only | Islands policy — no hooks, no `on*` handlers |
| `local/no-unescaped-user-html` | ts, tsx | Comments — no `dangerouslySetInnerHTML`; no importing `formatInline` into `src/components/` |

**Adding a rule:** write `eslint-rules/<name>.js` exporting the standard `{ meta, create }` object (plain ESM, no build step), register it in `eslint-rules/index.js`, enable it in the right block of `eslint.config.js`, and add `RuleTester` cases to `eslint-rules/rules.test.js` — `pnpm test` runs those alongside the parser tests.

Two config details worth knowing before editing `eslint.config.js`:

- The `.astro` block extends `astro.configs['flat/base']`, not `recommended`. `flat/base` supplies the parser and the `<script>` processor without the opinionated rules, which would otherwise fight the deliberately untranspiled pre-paint theme script in `Base.astro`.
- The ts/tsx block carries `ignores: ['**/*.astro/*']`. The Astro processor emits each `<script>` block as a virtual `Base.astro/0_0.ts`, and `src/**/*.ts` matches that path — without the ignore, the React and typescript-eslint rule sets land on that same inline script.
