# ADR 0003: Library-style post list, one page width, reading-size type

- Status: Proposed (on `feat/libraryx-home`)
- Date: 2026-11-01
- Builds on: [ADR 0002](0002-astryx-design-system.md) (partly supersedes decisions 2 and 5, and resolves its open reading-size question)
- Requirements: [`docs/trd/astryx-design-system.md`](../trd/astryx-design-system.md)
- Partly superseded by [ADR 0006](0006-reading-layout-revisions.md): the list is ruled rows without read time (decision 3), the column is 768px (decision 5), and prose line height is a theme `Text` type rather than `leading-[1.75]` (decision 6).

## Context

After ADR 0002 the home page was a 720px column: the ferret hero, a sticky bar with a "Posts" heading and an Astryx `SegmentedControl`, then a vertical stack of horizontal cards (thumbnail left, text right).

- The list did not look like Astryx's own reference layouts. Astryx's **Library** template (`/playground?template=library`) is the closest match to a post index: a titled header, a full-width search, category pills, a divider, then a grid of image-topped cards.
- Astryx's type scale starts at **14px** (base 14, ratio 1.2), sized for dense app UI. ADR 0002 kept it. In practice article paragraphs rendered at 14px while lists and quotes beside them rendered at 16px, and card titles were the same 14px as their summaries.
- Only three posts are published, one per category.

## Decision

1. **The home list follows the Library template.** It drops the template's titled header, because the active "글 / Posts" nav tab already names the page. It opens with a full-width `TextInput` search with a clear button, then a `ToggleButtonGroup` of category pills, then a rule and a single-column list of wide cards. The search box and pills stay sticky under the header, with the existing shadow-on-stick script.
2. **One list, not per-category sections.** Library groups its cards into a section per category. With three posts spread over three categories, that would be three sections holding one card each. Instead the category is printed on each card and the pills narrow the single list. Sections can return once categories hold several posts.
3. **Cards are wide rows.** `ArticleCard` puts the artwork on the left in a square plate (96px, 144px from `sm`), contained with a small inset on a white plate (`bg-thumb-plate`), and category, title (`Heading level={3}`), a two-line summary, and date · read time on the right, with the date pinned to the row's foot. The covers are square line art, and cropping them to fill the frame cut off their edges, so they are contained rather than cropped. A post without artwork gets a muted placeholder plate. One card per row gives each title the full page column; an earlier two-column grid of image-topped cards left each card about 324px wide. Each card is an Astryx `ClickableCard`, whose own `<a href>` is visually hidden and navigates through a React `onClick` that never ships to a static card. `ArticleCard` therefore stretches that anchor over the whole card (`[&>a]:inset-0!` and friends), which makes the card a real link with no JS.
4. **The filter island hides cards with `hidden`.** `CategoryFilter` holds the query and the category. On each change it sets `hidden` on every `[data-cat]` card that fails either check, and toggles the "no matches" line. Matching compares the lower-cased, NFC-normalized query with each card's `data-search` (title + summary). The query is never written into a selector or into markup. The generated per-category CSS rules from ADR 0002 are gone. Without JS the controls do nothing and every post shows, as before.
5. **Every page uses one 720px column.** Header, footer, home, article, about and 404 all share the same edges, so nothing shifts sideways between pages. That includes article body text, which keeps a comfortable line length at this width. The home list is therefore one wide card per row, not Library's three-column grid: at 720px a third column would squeeze each card to about 208px, and even two left titles cramped. The about page's ferret hero is 376px tall at `sm` and up, so its 16:9 source still fills the narrower box with little cropping. (This decision first set a 1040px column. It was narrowed to 720px before the ADR was accepted, for line length.)
6. **The type scale's base is 16px.** `wildferretTheme.ts` sets `typography.scale: { base: 16, ratio: 1.2 }`, so every Astryx size grows together: body 16, headings 19 / 23 / 28, supporting text 13. Article paragraphs, list items and quotes also get `line-height: 1.75` (`leading-[1.75]` in `ArticleView.astro`). It is the one place we override Astryx's leading.
7. **The large text input is 44px tall.** At a 16px base, Astryx's `lg` text input (36px, 4px vertical padding) still crowds its text. The theme overrides `text-input` `size:lg` to 44px with 12px side padding. The search box is the only large input; the comment form keeps the default size.
8. **The ferret hero lives at the foot of the about page.** It is extracted into `FerretHero.astro` (markup and its `is:inline` idle/sound script, unchanged), and its copy moved from `strings.home.*` to `strings.hero.*`. The home page now opens on the post list. The about page's round avatar is removed, with its `profileAlt` copy and image file.
9. **Mobile.** The pill row keeps natural widths and scrolls sideways (scrollbar hidden) instead of squeezing labels. The header logo steps down to `text-base` below `sm`, and the nav is `whitespace-nowrap`, so a 320px header stays on one line.

## Consequences

- \+ The home page reads as an Astryx layout rather than a hand-built one, and search is new.
- \+ The logo and nav stay in the same place on every page.
- \+ Reading size is settled: 16px text on a 28px line for prose, and card titles stand above their summaries.
- \+ Sizes change in one place (the theme's scale), not per component.
- − The home page loads more JS. The island is now 1.8 KB, but the Astryx chunk it shares with Comments grew from 23.6 KB to 38.9 KB gzipped, because `TextInput` and `ToggleButton` now come with it. That is about +12 KB net on `/`.
- \+ Article lines stay at a comfortable length at 720px, with the same edges on every page.
- − The home list holds one card per row rather than the template's three, so it runs longer as posts are added.
- − On phones the sticky toolbar plus the header take about 170px while scrolling.
- − The theme now overrides one component (`text-input` `size:lg`). An Astryx upgrade that renames that variant would silently drop the override; re-check the search box after upgrades.

## Alternatives considered

- **Per-category sections, as in Library:** deferred (decision 2); too sparse with one post per category.
- **Everything at 1040px:** matches the template's three-column grid, but article lines run to 70+ Korean characters, past a comfortable measure. This was the first version of decision 5, and was dropped for line length.
- **Wide chrome, 720px reading column:** the header, footer and home at 1040px, with article text kept at 720px for line length. Rejected in favor of identical edges on every page.
- **Per-component size overrides** (e.g. `Text type="large"` for prose): rejected; a base change keeps the ramp consistent and is one line.
- **Padding the search box with a utility class:** rejected in favor of Astryx's theme component override, which is the supported hook.
