# ADR 0002: Adopt Astryx as the design system, rendered statically

- Status: Proposed (spike on `feat/astryx-design-system`)
- Date: 2026-10-05
- Requirements: [`docs/trd/astryx-design-system.md`](../trd/astryx-design-system.md)

## Context

Before this change the design system was entirely home-grown:

- Tailwind CSS 4, with a custom `@theme` ink/paper/accent token scale in `src/styles/global.css`.
- Dark mode was an `html.dark` class that reassigned the same tokens. The pre-paint script in `src/layouts/Base.astro` and the `ThemeToggle.tsx` island also set `color-scheme` on `<html>`.
- `local/no-raw-colors` kept every color on those tokens.
- Every control and text style was hand-built with utilities.
- Only two islands hydrate (ThemeToggle, Comments). Every page otherwise ships zero JS.

The palette was not working well, and maintaining a bespoke system costs more than it returns for a one-person blog.

[Astryx](https://github.com/facebook/astryx) (MIT, `@astryxdesign/core` 0.6.5, beta) is Meta's open-sourced design system. What we verified in its source and published package:

1. **React 19 + StyleX, shipped pre-built.** Consumers import `reset.css`, `astryx.css` and a theme's CSS. There is no build plugin, PostCSS or Babel step. Peer dependencies are `react`, `react-dom` (already installed) and `@stylexjs/stylex`.
2. **The `<Theme>` provider is optional for a built theme.** With a built theme it injects no CSS. It only syncs `data-theme` and `data-astryx-theme` onto `<html>`, and a static page can set both attributes itself.
3. **Dark mode is `light-dark()` driven by `color-scheme`.** Every default color token is a `light-dark()` pair. `reset.css` maps `html[data-theme]` to `color-scheme`, which our pre-paint script and toggle already set.
4. **Default tokens live on `:root`.** `astryx.css` declares them inside `@layer astryx-base`. One name, `--color-accent`, was also ours.
5. **A theme's CSS is scoped.** It applies inside `@scope ([data-astryx-theme="<name>"])` and sets `h1`–`h6`/`p` typography there.
6. **Astro can render any of it statically.** A React component with no `client:*` directive is rendered to HTML at build time, and no JS ships for it. That holds even for components marked `'use client'` (an RSC marker Astro ignores). It holds as long as nothing depends on an event handler, so display components work and interactive ones render dead.
7. **Interactive components cost real JS.** Importing even one control pulls in a shared chunk. `IconButton` alone brought ~31 KB gzipped, which is why the theme toggle stays a native button.
8. **Built-in strings are localized.** Astryx ships a `ko-KR` catalog for its own component text (counters, status announcements), loaded through `InternationalizationProvider`.

## Decision

Proposed. It becomes Accepted or Rejected on the exit criteria below.

1. **Astryx's default color system, site-wide.** We drop the ink/paper palette. The old token names stay, as aliases of Astryx semantic tokens (`--color-ink-900: var(--color-text-primary)`, `--color-paper: var(--color-background-body)`, …), so existing utilities and CSS keep working while every color is Astryx's. `--color-accent` is declared only as a Tailwind `@theme reference inline` key, so it resolves straight to Astryx's token without a self-referencing cycle. The `html.dark` palette block is deleted, because `light-dark()` handles mode.
2. **One custom theme, for the font only.** `wildferret` (`src/styles/astryx/wildferretTheme.ts`, built by `pnpm theme:build`) sets NanumBarunGothic as Astryx's body and heading family and sets no colors.
3. **The theme covers the whole page.** `data-astryx-theme="wildferret"` sits on `<html>` in `Base.astro`. Astryx typography applies everywhere, article prose included.
4. **Astryx components wherever something only displays.** That covers `Heading`, `Text`, `Card`, `Badge`, `Blockquote`, `Divider`, `Table` and `CodeBlock` across the article, home, about and footer, all rendered statically with no `client:*`. Article prose renders each parsed block through the matching component. Lists stay native `<ul>`/`<ol>`, because Astryx `List` is a UI list with string labels, not prose.
5. **New JS for interactivity only where it earns it.** The category filter is an Astryx `SegmentedControl` in a third island, `CategoryFilter` (`client:load`, home page only). It sets `data-filter` on the list container, and generated CSS rules hide non-matching cards, which stay static HTML; with no JS, all posts show. The React runtime was already on the page for ThemeToggle, so the added cost is Astryx's chunk. The hero and carousel stay CSS-only (radios + `:has()`), restyled with Astryx tokens. Features that need a handler are switched off rather than shipped dead: CodeBlock's copy button and Text's truncation tooltip. The theme toggle stays a native button (Context 7).
6. **Interactive Astryx inside existing islands only.** The Comments island uses `TextInput`, `TextArea` (with its own error `status`), `Button`, `Heading` and `Text`, wrapped in `InternationalizationProvider` with the `ko-KR` catalog. Our own copy stays in `src/copy/strings.ts`.
7. **Disable, don't delete, `local/no-raw-colors`.** The rule file and its tests stay, so it comes back with one config line.

## Consequences

- \+ One documented design system with accessible components. Colors, type and controls are Astryx's, not ours to maintain.
- \+ Dark mode comes from Astryx's `light-dark()` tokens through the existing toggle. No palette is duplicated per mode.
- \+ Article and about pages ship the same JS as before. The home page adds one island (the filter).
- − Every page loads Astryx's CSS: the stylesheet goes from 8.7 KB to ~39 KB gzipped.
- − The Comments island grows from 2.7 KB to ~50 KB gzipped (StyleX runtime, controls, `ko-KR` catalog). It is `client:visible`, so only readers who scroll to it pay.
- − The home page loads ~29 KB gzipped more JS for the filter (5.1 KB island + 23.6 KB Astryx chunk shared with Comments), and the filter no longer works without JS.
- − Astryx's default body size is 14px, against the old 17px article prose. Long-form reading is denser.
- − The eleven-step ink scale collapses onto four Astryx roles, so some former contrast steps now coincide.
- − Beta dependency: 0.x versions with codemods between them (`astryx upgrade`). Versions are pinned exactly.
- − Color discipline is not lint-enforced while the rule is off.

## Exit criteria

Accept if all of the following hold; otherwise reject and revert the branch.

- `pnpm lint`, `pnpm test` and `pnpm build` pass.
- No page gains a module script; the islands are ThemeToggle, Comments and CategoryFilter.
- The category filter hydrates on load and filters the list.
- Comments hydrate, post and show rejections on `/`, `/kr/` and `/en/`.
- Light/dark follow the toggle and the OS with no flash.
- The article reading size is settled: either keep 14px, or raise it with the theme's type scale (open question 1).

## Alternatives considered

- **Map the ink/paper palette onto Astryx with a custom theme:** tried first in this spike and dropped. It kept a palette we no longer wanted and needed a drift test to keep two copies of it in sync.
- **Keep Astryx scoped to a few surfaces:** dropped once the palette went, because two typographic systems side by side read worse than one.
- **Hydrate the other interactive components** (`Carousel`, `TopNav`, `IconButton` toggle): rejected. The carousel and nav already work without JS, and `IconButton` would put ~31 KB on every page for one button. The filter was the exception: it is the home page's main control, and React was already loaded there.
- **Keep the filter as CSS radios:** zero JS and it worked, but it was the one hand-built control left on the home page, styled to imitate Astryx rather than being Astryx.
- **Headless primitives (Radix/shadcn-style) + Tailwind:** a component kit, not a design system, so tokens, type and docs would stay ours.
- **Swizzle only the needed components** (`astryx swizzle`): owns the source and could drop the global stylesheet, but loses upgrades. Kept as the fallback if the CSS weight becomes the blocker.
