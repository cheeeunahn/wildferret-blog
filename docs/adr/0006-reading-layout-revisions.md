# ADR 0006: Revisions to the reading layout

- Status: Proposed (on `fix/scroll-and-ui-tweaks`, PR #64)
- Date: 2026-11-14
- Supersedes: [ADR 0003](0003-library-layout-and-reading-scale.md) decision 3 (cards: boxed, with date · read time), the 720px width in decision 5, and the `leading-[1.75]` override in decision 6.

## Context

After ADR 0003 the home page felt heavy: boxed cards with 144px artwork, generous padding, and a page that scrolled even when four posts should have fit. The read time on cards and article headers was not wanted. The 720px column was narrower than typical Korean tech blogs. And the one type override ADR 0003 allowed, `leading-[1.75]` on prose, was a per-component utility, which ADR 0005 now rejects in lint.

## Decision

1. **The home list is a ruled list, not boxed cards.** Each row is a `ClickableCard` with the `transparent` variant and a rule beneath it, so the rules stay right when the filter hides rows. Hover still fills the row, bled 12px past the content. Artwork is 112px from `sm` (was 144px), with less padding, and the list's bottom padding is 24px, so four posts fit a 1440×900 window without scrolling.
2. **No read time.** Cards and article headers show the date only. The `readMinutes` field and its strings are removed, so a new post does not need one.
3. **Every page shares one 768px column** (was 720px), Velog's post width and a common one for Korean tech blogs. ADR 0003's reason for a single column, identical edges on every page, stands. The about page's ferret picture grows to 400px tall at `sm`, so the wider frame does not crop more of it.
4. **Off-scale type lives in the theme as custom `Text` types.** `wildferretTheme.ts` defines `prose` (body size, 1.75 line height, replacing `leading-[1.75]`) and `compact` (15px, the about page's rows), typed in `textTypes.d.ts`. Article lists render through Astryx's `Markdown`, given the same line height by the theme's `markdown-list` override.
5. **The search toolbar sits directly under the header from the start** (`top-[65px]`, no gap above), so it never slides while the page scrolls.

## Consequences

- \+ The home page is lighter, and fits a laptop screen without scrolling.
- \+ Every type size and line height comes from the theme; nothing per component.
- \+ Lines in an article stay comfortable at 768px (720px of text).
- − A posted article no longer tells readers how long it is.
- − The wider column changes every page's edges at once; the next width change must do the same.
- − Custom `Text` types need their typing added by hand to `textTypes.d.ts`, since `astryx theme build` writes only their CSS.

## Alternatives considered

- **Smaller fonts across the site to lighten the home page:** rejected; the type sizes were ordinary, and the weight came from thumbnails and padding.
- **A wider column only on the home page:** rejected; ADR 0003's identical edges on every page are kept.
- **Keeping `leading-[1.75]` as the single exception:** rejected in favor of a theme type, so lint can forbid type utilities without exceptions.
