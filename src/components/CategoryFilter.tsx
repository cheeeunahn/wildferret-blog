import { useEffect, useRef, useState } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton'

const ALL = 'all'

/** Lower-cased, NFC-normalized, so 한글 typed in either form still matches. */
const normalize = (s: string) => s.normalize('NFC').toLowerCase().trim()

/**
 * The home page's search box and category pills, mounted client:load in
 * HomeView.astro (the third island; see CLAUDE.md).
 *
 * The cards are static HTML outside this island, so it does not render them.
 * It only sets `hidden` on the cards that fail the query or the category, and
 * toggles the "no matches" line. With no JS the controls render but do nothing, and
 * every post stays visible.
 *
 * The query is never written into a selector or into markup — it is only
 * compared against each card's `data-search` text — so reader input has no
 * path into CSS or HTML.
 *
 * A sighted reader sees the grid change; a screen-reader user, whose focus
 * stays in the search box or on a pill, would hear nothing. So the island
 * also owns a polite live region with the result count. It is rendered from
 * the start (a region that is itself un-hidden is announced unreliably) and
 * only its text changes. The effect writes that text directly, as it writes
 * `hidden` on the cards: React renders the region empty and never touches it
 * again, so state here would only cost a second render per keystroke. `resultLabels[n - 1]` is the label for n posts:
 * precomputed by HomeView, because a function cannot cross into an island as
 * a prop.
 */
export default function CategoryFilter({
  categories,
  allLabel,
  legend,
  searchLabel,
  searchPlaceholder,
  noMatches,
  resultLabels,
}: {
  categories: string[]
  allLabel: string
  legend: string
  searchLabel: string
  searchPlaceholder: string
  noMatches: string
  resultLabels: string[]
}) {
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState('')
  // Empty until the reader first filters, so nothing is announced on load.
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('.cat-scope')
    if (!scope) return
    const q = normalize(query)
    // Once the reader has filtered, a card coming back replays its entrance
    // animation; global.css drops the load-time stagger under this flag so it
    // does not sit blank for half a second first.
    if (category !== ALL || q !== '') scope.dataset.filtered = ''
    let visible = 0

    scope.querySelectorAll<HTMLElement>('[data-cat]').forEach((card) => {
      const matches =
        (category === ALL || card.dataset.cat === category) &&
        (q === '' || normalize(card.dataset.search ?? '').includes(q))
      card.hidden = !matches
      if (matches) visible++
    })

    const empty = scope.querySelector<HTMLElement>('.cat-empty')
    if (empty) empty.hidden = visible > 0

    // Once filtered, keep announcing — including the full count when the
    // reader clears the search or goes back to "all".
    if ('filtered' in scope.dataset && statusRef.current) {
      statusRef.current.textContent = visible === 0 ? noMatches : (resultLabels[visible - 1] ?? '')
    }
  }, [category, query, noMatches, resultLabels])

  return (
    // gap-3, tighter than the 20px around the toolbar: the search and the
    // pills read as one control rather than two stacked rows.
    <div className="flex flex-col gap-3">
      <TextInput
        label={searchLabel}
        isLabelHidden
        placeholder={searchPlaceholder}
        // lg rather than the default md: at the site's 16px base, md's 32px
        // box leaves the text no room above and below.
        size="lg"
        startIcon="search"
        value={query}
        onChange={setQuery}
        hasClear
        width="100%"
      />
      {/* The pills keep their natural width (w-max) and the row scrolls
          sideways when it outgrows a narrow phone, rather than the group
          squeezing each label until it is cut off. A scrollbar under four
          short labels is clutter, and touch scrolling does not need one. */}
      <div className="-mx-6 px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-max">
          <ToggleButtonGroup
            label={legend}
            value={category}
            // A single-select group reports null when the pressed pill is clicked
            // again; treat that as "back to all" rather than an empty filter.
            onChange={(v) => setCategory(typeof v === 'string' ? v : ALL)}
            size="sm"
          >
            <ToggleButton value={ALL} label={allLabel} />
            {categories.map((c) => (
              <ToggleButton key={c} value={c} label={c} />
            ))}
          </ToggleButtonGroup>
        </div>
      </div>
      <p ref={statusRef} role="status" className="sr-only" />
    </div>
  )
}
