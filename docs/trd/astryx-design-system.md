# TRD: Astryx design system

- Status: Draft (spike implemented on `feat/astryx-design-system`)
- Date: 2026-10-05
- Decision record: [ADR 0002](../adr/0002-astryx-design-system.md)

## Background

The blog's design system was Tailwind 4 plus a hand-maintained ink/paper palette and hand-built components. It is being replaced by [Astryx](https://github.com/facebook/astryx) (`@astryxdesign/core` 0.6.5, beta, React 19 + StyleX, pre-built CSS). Astryx brings its default colors, its typography and its components, and keeps the site's rendering model: static HTML plus a few islands. ADR 0002 records the decision. This document says what the change must deliver, how it is built, and how it is checked.

## Goals

- Use Astryx's default color system site-wide, with dark mode from its `light-dark()` tokens.
- Use NanumBarunGothic as Astryx's body and heading font.
- Render every display element (headings, text, cards, badges, quotes, dividers, tables, code) with Astryx components, article prose included.
- Use Astryx controls in the comment form, with Astryx's own i18n for its built-in strings.
- Keep zero-JS pages where they were: one new island (the home page's category filter) and no new JS elsewhere.
- Retire `local/no-raw-colors`, which enforced the old palette; the site uses Astryx colors, tokens and components only.

## Non-goals

- No change to routing, the three language trees, or `src/shared/i18n.ts`.
- No hydrated replacements for the hero greeting and the carousel; they stay CSS-only.
- No deploy from the spike branch.

## Requirements

### Functional

| ID  | Requirement                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Comments load, post, and show rejection messages on `/`, `/kr/` and `/en/`, as before.                                                            |
| F2  | Colors follow the theme toggle and, with no stored choice, the OS `prefers-color-scheme`.                                                         |
| F3  | Every page's colors come from Astryx's default tokens; no ink/paper hex values remain.                                                            |
| F4  | Body and heading text use NanumBarunGothic, in and outside Astryx components.                                                                     |
| F5  | Article blocks render through Astryx: Heading, Text, Blockquote, Divider, Table, CodeBlock.                                                       |
| F6  | Astryx's built-in component text renders in Korean on `/` and `/kr/` and in English on `/en/`.                                                    |
| F7  | The hero and carousel keep working without JS. The category filter is an Astryx `SegmentedControl`; without JS it degrades to showing every post. |

### Non-functional

| ID  | Requirement                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| N1  | No page gains a module script; the islands are ThemeToggle (`client:only`), Comments (`client:visible`) and CategoryFilter (`client:load`, home only). |
| N2  | No theme flash: `data-theme` and `color-scheme` are set by the existing pre-paint script.                                                              |
| N3  | Stored-XSS rule holds: comment `nickname`/`body` render only as JSX children; `local/no-unescaped-user-html` stays on.                                 |
| N4  | CSP in `public/_headers` is unchanged. Astryx is bundled; no third-party origins.                                                                      |
| N5  | Astryx versions are pinned exactly (no `^`), because 0.x releases can break.                                                                           |
| N6  | `pnpm lint`, `pnpm test` and `pnpm build` pass.                                                                                                        |

## Technical design

### 1. Dependencies

`@astryxdesign/core` and `@stylexjs/stylex` (runtime), `@astryxdesign/cli` (dev), all pinned exactly. Two scripts:

- `pnpm astryx …`: the Astryx CLI. Look up a component's API with `pnpm astryx component <Name>` rather than guessing.
- `pnpm theme:build`: compiles `src/styles/astryx/wildferretTheme.ts` to `wildferret.theme.css` (+ `.js`/`.d.ts`) beside it. The output is committed, so `pnpm build` needs no extra step. `pnpm astryx theme build <file> --check` verifies the committed output is current.

The packages' install scripts only print a hint to run `astryx init` and are left unapproved.

### 2. CSS (`src/styles/global.css`)

```css
@layer reset, base, astryx-base, theme, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import './astryx/wildferret.theme.css';
@import 'tailwindcss/utilities.css' layer(utilities);
```

Tailwind preflight (`base`) sits before `astryx-base`, so element resets never override Astryx's component styles. Astryx's `tailwind-theme.css` bridge is not imported, because its utility names (`bg-surface`, …) would shadow ours.

**Colors.** The `@theme` block keeps the old token names as aliases of Astryx's semantic tokens, so templates and CSS did not have to change:

| Old token                       | Astryx token                                       |
| ------------------------------- | -------------------------------------------------- |
| `ink-950`, `ink-900`, `ink-800` | `--color-text-primary`                             |
| `ink-700`, `ink-600`, `ink-500` | `--color-text-secondary`                           |
| `ink-400`                       | `--color-text-disabled`                            |
| `ink-300`, `ink-200`            | `--color-border-emphasized`                        |
| `ink-100`                       | `--color-border`                                   |
| `ink-50`, `paper-warm`          | `--color-background-muted`                         |
| `paper`                         | `--color-background-body`                          |
| `surface` / `surface-hover`     | `--color-background-surface` / `-popover`          |
| `accent-strong` / `accent-soft` | `--color-text-accent` / `--color-accent-muted`     |
| `copper`                        | `--color-text-orange`                              |
| `thumb-plate`                   | `#ffffff` (the artwork's own white, in both modes) |

`--color-accent` is Astryx's own name, so it cannot be aliased (`var(--color-accent)` would be a cycle). It is declared in `@theme reference inline`, which gives Tailwind the `*-accent` utilities without emitting a variable, so they resolve to Astryx's value. The `html.dark` palette block is gone. The remaining `html.dark` rules are non-palette: image glare, grain, card hover.

Decorative colors (hero glow, sound-toggle overlay, card shadows) stay literal; they are not palette.

### 3. Theme (`src/styles/astryx/wildferretTheme.ts`)

`defineTheme({ name: 'wildferret', typography: { body, heading } })`. The font is NanumBarunGothic, with the rest of `--font-body` as fallbacks. There are no color tokens, so every color is Astryx's default. The `@font-face` declarations stay in `global.css`. NanumBarunGothic has only Regular and Bold, so Astryx's 500/600 weights render as 400/700.

### 4. Theme scope and dark mode

`<html data-astryx-theme="wildferret">` is set statically in `Base.astro`, so the theme, including its `h1`–`h6`/`p` typography, applies to the whole page and to anything Astryx portals. The pre-paint script and `ThemeToggle.tsx` set `data-theme` next to the existing `classList.dark` and `style.colorScheme`. `light-dark()` follows `color-scheme`.

### 5. Static components

Astryx components in `.astro` files carry no `client:*`, so they render to HTML at build time with no JS. Rules for using them:

- **React props, not Astro's.** Use `className` and an object `style` (`{ animationDelay }`), not `class` and a CSS string.
- **Paragraphs.** `Text` defaults to `display="inline"`. Every `<Text as="p">` sets `display="block"`, or consecutive paragraphs run together.
- **Turn off what needs JS:** `CodeBlock hasCopyButton={false}`, `Text maxLines hasTruncateTooltip={false}`.
- **Inline HTML.** Author HTML from `formatInline` goes in as `<Fragment set:html>` children. `Table` takes cell renderers instead, so `ArticleView.astro` builds them in its frontmatter with `createElement('span', { dangerouslySetInnerHTML })`. That is author content only; reader text must never take this path.

Where each component is used:

- `ArticleView`: Heading, Text, Blockquote, Divider (`---` as `label="· · ·"`), Table, CodeBlock, and a muted Card for the summary.
- `ArticleCard`: Card, Heading, Text, Badge, Divider.
- `AboutView`: Heading, Text, HStack (avatar beside the heading), Badge (one per interest). Its column is 720px, matching the header and footer.
- `HomeView`: Text, and an HStack header row for the list (Heading on the left, the CategoryFilter island on the right). The hero no longer sits on a tonal band: Astryx's muted background is translucent and the band vanished in dark mode, leaving an empty gap.
- `Base` footer: Text.

Lists stay native `<ul>`/`<ol>` with `Text` items. The hero and carousel stay CSS radios.

### 5a. Category filter island

`src/components/CategoryFilter.tsx` renders an Astryx `SegmentedControl` ("All" plus each category in use), mounted `client:load` inside the sticky `.cat-bar` in `HomeView.astro`. It does not render the cards. On change, it sets `data-filter` on `.cat-scope` (or removes it for "All"). `HomeView.astro` generates one rule per category: `.cat-scope[data-filter="X"] [data-cat]:not([data-cat="X"]) { display: none }`. Category names are our own data. Without JS the control renders but does nothing, and every post stays visible. The island is on the `local/no-unlisted-island` allowlist. The old radio pills and their CSS are gone; the sticky bar and its shadow script are unchanged.

`.prose-blog` keeps only block spacing and Korean `word-break: keep-all`. Its unlayered type and color rules were removed, because they would beat Astryx's layered styles.

### 6. Comments island

The form uses `TextInput` and `TextArea`, both with hidden labels. The nickname is capped in `onChange` because `TextInput` has no `maxLength`. `TextArea`'s `maxLength` shows a counter, and `checkComment()` still enforces the limit. Rejections show as the TextArea's `status={{ type: 'error' }}`. The submit `Button` uses `isLoading`, and the heading and text are `Heading`/`Text`. `nickname`/`body` render as JSX children (N3).

### 7. Built-in component text

`InternationalizationProvider` wraps the Comments tree with `locale` from `lang` (`ko` → `ko-KR`, `en` → `en`) and the static `ko-KR` catalog. Our own copy still comes from `strings`. Override a shipped Korean string with the provider's `overrides`, not by forking the catalog. Static components only need a provider if they render built-in text, and none in use do.

### 8. Theme toggle

The toggle stays a native `<button>`. `IconButton` would put Astryx's shared button chunk (~31 KB gzipped) on every page, since this island loads everywhere.

### 9. Lint

`local/no-raw-colors` is retired: the rule, its tests and its config line are deleted. Colors come only from Astryx tokens (or the aliases in `global.css`), and that is checked in review.

## Measurements

Gzipped sizes, from the build before Astryx (`main`) and this branch:

| Asset                 | Before                | After                                  |
| --------------------- | --------------------- | -------------------------------------- |
| Global stylesheet     | 8.7 KB                | 39.2 KB                                |
| Comments island chunk | 2.7 KB                | 26.3 KB + 23.6 KB shared chunk         |
| CategoryFilter chunk  | —                     | 5.1 KB + the same 23.6 KB shared chunk |
| ThemeToggle chunk     | 0.9 KB                | 0.9 KB                                 |
| React client runtime  | 57.3 KB               | 56.5 KB                                |
| Module scripts on `/` | 0                     | 0                                      |
| Islands on `/`        | ThemeToggle           | ThemeToggle, CategoryFilter            |
| Islands on an article | ThemeToggle, Comments | ThemeToggle, Comments                  |

The same three article pages are built before and after.

## Verification

| Check                   | Status                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lint, tests, build      | Pass                                                                                                                                                               |
| Category filter         | Pass: hydrates on load, selecting Research leaves only Research posts, aria-checked follows                                                                        |
| Zero-JS pages           | Pass: no page gained a module script                                                                                                                               |
| Default colors, light   | Pass: text `#0A1317`, page `#F1F4F7`, accent `#0064E0`                                                                                                             |
| Default colors, dark    | Pass: text `#DFE2E5`, page `#111112`, card `#1F1F22`                                                                                                               |
| Font                    | Pass: NanumBarunGothic on Astryx headings, text and badges                                                                                                         |
| Article blocks          | Pass: headings, text, quotes, dividers and a table (with inline formatting) render; CodeBlock checked by server-rendering one, since no published article has code |
| Comments                | Not yet verified: the form renders, but hydration was not confirmed in a foreground tab, and posting needs `.dev.vars`                                             |
| `/en/` built-in strings | Not yet verified in the browser                                                                                                                                    |

## Risks and mitigations

| Risk                                                             | Mitigation                                                                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 14px default body text is small for long-form reading            | Raise `typography.scale.base` in the theme, or use `Text type="large"` for article paragraphs (open question 1) |
| `astryx.css` (~30 KB gzipped) loads on every page                | Measured above; swizzle the few components used and drop the global sheet if it becomes the blocker             |
| Beta API churn between 0.x releases                              | Exact pins; upgrade deliberately with `astryx upgrade --apply`, then `pnpm theme:build`                         |
| A static component quietly gains a click-only feature on upgrade | Review the rendered page after upgrades; only display components are used outside islands                       |
| Color discipline drifts with `no-raw-colors` retired             | "Astryx only" is written into CLAUDE.md (Design Tokens) and checked in review                                   |

## Open questions

1. **Reading size:** keep Astryx's 14px body, or raise it for article prose? **Resolved:** keep Astryx's default.
2. **Alias retirement:** rename `ink-*`/`paper` utilities in templates to Astryx role names (or adopt the Tailwind bridge under non-clashing names) and delete the alias block?
3. **`no-raw-colors`:** re-enable it rewritten for Astryx token names, or retire it? **Resolved:** retired; Astryx colors, tokens and components only.
