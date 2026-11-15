# ADR 0007: Article text at 15px on a 1.9 line height

- Status: Proposed (on `fix/article-readability`)
- Date: 2026-11-15
- Supersedes: the prose reading size in [ADR 0003](0003-library-layout-and-reading-scale.md) (decision 6 and its consequence "16px text on a 28px line for prose"), and the `prose` values in [ADR 0006](0006-reading-layout-revisions.md) decision 4 (body size, 1.75 line height).

## Context

Articles read as dense. NanumSquareNeo is wide and fills its em box, so 16px paragraphs on a 28px line (1.75) left 12px between lines, and a paragraph read as one block.

Measuring every block in the article body showed two more problems:

- **Wrapped list items sat on 24px lines.** Each item's text is a block of its own, sized from Astryx's `--text-body-leading` (1.5), not inherited from the list. The `markdown-list` line height from ADR 0006 reached the list but never the text inside it.
- **Lists only partly follow the list's own size.** Markdown's item text, links, bold text and inline code read `--text-body-size` and `--text-code-size` instead of inheriting, so a font size set on the list alone left them at 16px.

## Decision

1. **Article prose is 15px on a 1.9 line height (28.5px).** The values live once, as `PROSE` in `wildferretTheme.ts`, and the `prose` `Text` type takes them. Paragraphs, quotes and the AI summary's sentences use it. The scale's base stays 16px, so headings, the home page, the about page and every control are unchanged.
2. **Article lists match the paragraphs.** The `markdown-list` override sets the prose size and line height on the list, and redefines `--text-body-size`, `--text-body-leading` and `--text-code-size` for everything inside it.
3. **Tables and code blocks take the prose size.** Overrides on `table-cell`, `table-header-cell` and `code-block` bring them to 15px, so no block reads larger than the paragraphs around it. They keep their denser 1.5 line height.

## Consequences

- \+ About 13.5px between lines instead of 12px, at nearly the same line pitch, so an article is about as long as before.
- \+ A wrapped list item now has the same line spacing as a paragraph.
- \+ The reading size changes in one place.
- − Article text is a step below the 16px body size used everywhere else on the site.
- − A 720px line holds about 7% more characters than at 16px.
- − The list override depends on Markdown reading those three token names, and the table and code overrides on Astryx's class names. An Astryx upgrade that renames any of them would silently bring back 16px text or 1.5 lines in that block. Check an article's lists, tables and code blocks after upgrades.

## Alternatives considered

- **Lowering the scale's base to 15px:** rejected. It would shrink every heading, the nav and the home list, which were not the problem. ADR 0006 rejected site-wide smaller fonts for the same reason.
- **15px on a 2.0 line height (30px):** tried in the browser. At this size it looked almost no different from 1.9, and it lengthens every article.
- **Setting `--text-body-size` on the `<article>` element:** one declaration would cover every block, but it is a per-component type override outside the theme, which ADRs 0003 and 0006 rule out.
- **A font size on the list alone:** tried; Markdown's links, bold text and inline code stayed at 16px.
