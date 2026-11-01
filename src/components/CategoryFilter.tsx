import { useEffect, useState } from 'react'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'

const ALL = 'all'

/**
 * The home page's category filter — an Astryx SegmentedControl, mounted
 * client:load in HomeView.astro (the third island; see CLAUDE.md).
 *
 * The cards are static HTML outside this island, so it does not render them.
 * It only writes the chosen category to `data-filter` on `.cat-scope`, and the
 * per-category rules HomeView generates hide the cards that do not match. With
 * no JS the control renders but does nothing, and every post stays visible.
 */
export default function CategoryFilter({
  categories,
  allLabel,
  legend,
}: {
  categories: string[]
  allLabel: string
  legend: string
}) {
  const [value, setValue] = useState(ALL)

  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('.cat-scope')
    if (!scope) return
    if (value === ALL) delete scope.dataset.filter
    else scope.dataset.filter = value
  }, [value])

  return (
    <SegmentedControl label={legend} value={value} onChange={setValue}>
      <SegmentedControlItem value={ALL} label={allLabel} />
      {categories.map((c) => (
        <SegmentedControlItem key={c} value={c} label={c} />
      ))}
    </SegmentedControl>
  )
}
