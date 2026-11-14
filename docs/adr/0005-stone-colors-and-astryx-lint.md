# ADR 0005: Stone colors with an indigo accent, and "Astryx only" enforced by lint

- Status: Proposed (on `fix/scroll-and-ui-tweaks`, PR #64)
- Date: 2026-11-14
- Supersedes: [ADR 0002](0002-astryx-design-system.md) decision 1 (Astryx's default colors) and the review-only half of decision 7 ("Astryx only" checked in review).

## Context

ADR 0002 adopted Astryx's default color system and retired `local/no-raw-colors`, leaving "Astryx only" (Astryx components, tokens and colors, nothing raw) as a review rule. Two things changed:

- **The default palette read as generic.** Astryx ships themed palettes; its "stone" theme is a warm neutral set that suits a reading site. But stone takes its accent from its own near-black neutral, so links, the selected tab, focus rings and checks disappeared into the text and the site read as monochrome.
- **Review missed drift.** An audit against Astryx found hand-built markup and Tailwind type utilities (`text-sm`, `text-[15px]`, `font-semibold`, `leading-*`) that review had let through, including inline code and links styled by hand in the article parser.

## Decision

1. **Colors are Astryx's stone theme, light and dark.** Its color tokens, stone-tinted shadows and code syntax palette are copied from `astryx theme add stone` into `src/styles/astryx/stoneColors.ts` and spread into the `wildferret` theme. Only the colors: stone's fonts, type scale, motion, radii, icons and component shapes are not taken.
2. **One override of our own: a muted indigo accent.** `indigoAccentTokens` (same file) sets the accent family, and stone's neutral selected/hover/pressed fills, to an indigo built the way stone builds its hues: OKLCH hue 281, halfway between stone's blue and purple ramps, at low chroma. `#4d4f81` in light mode (6.9:1 on the page), `#b6bae7` in dark (10.1:1). The home cards' category label takes the accent.
3. **"Astryx only" moves from review into lint, where a check can see it.**
   - `local/astryx-colors-only` rejects stock Tailwind palette classes, raw colors in arbitrary class values and raw color strings. `stoneColors.ts` is the only file it skips, because that is where the tokens get their values.
   - `local/astryx-type-only` rejects Tailwind type size, weight, line-height and letter-spacing utilities. A size the scale lacks becomes a custom `Text` type in the theme instead (decided in ADR 0006).
   - Component choice (an Astryx component where one exists) stays a review rule; a linter cannot tell which component fits.
4. **Motion and radii use Astryx tokens.** A bare `transition-*` takes `--duration-fast` and `--ease-standard`; the entrance animations use Astryx's slow and medium durations; corners use `--radius-inner|element|container`.

## Consequences

- \+ The site has a recognizable palette in both modes, still entirely Astryx tokens and still switched by `light-dark()`.
- \+ Accents are visible again and stay above WCAG AA.
- \+ Drift that review missed now fails `pnpm lint` and the pre-commit hook.
- \+ Changing the palette is one file and `pnpm theme:build`.
- − The colors are a copy, not a dependency: an Astryx release that retunes stone will not reach the site until `stoneColors.ts` is re-copied.
- − The indigo is our own choice on top of stone, so it is ours to keep consistent if stone's ramps change.
- − Two more repo-local lint rules to maintain, each with false-positive cases to watch (an in-page `#add` anchor looks like a hex color; the rules skip id and URL attributes for that reason).

## Alternatives considered

- **Keep Astryx's defaults:** rejected; the user wanted a warmer, less generic palette.
- **Adopt the whole stone theme (fonts, scale, radii, pill buttons):** rejected; it would replace the NanumSquare Neo font, the 16px reading scale (ADR 0003) and the site's shapes.
- **Stone as shipped, with its ink accent:** tried, and rejected as too monochrome.
- **A stronger indigo, or one of stone's own blue or purple ramps:** stone's ramps are nearly gray (OKLCH chroma about 0.03) and did not read as color; a higher chroma pulled the site away from stone's restraint.
- **Keep "Astryx only" as a review rule:** rejected; the audit showed review missing it.
