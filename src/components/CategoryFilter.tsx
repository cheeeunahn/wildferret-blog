import { useEffect, useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton'

const ALL = 'all'

/**
 * The home page's category filter — a row of Astryx toggle-button chips, after
 * the Astryx "Card Grid" example, mounted client:load in HomeView.astro (see
 * the islands policy in CLAUDE.md).
 *
 * The cards are static HTML outside this island, so it does not render them.
 * It only writes the chosen category to `data-filter` on `.cat-scope`, and the
 * per-category rules HomeView generates hide the other sections. With no JS
 * the chips render but do nothing, and every post stays visible.
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
    <ToggleButtonGroup
      label={legend}
      type="single"
      value={value}
      // A single-select group reports null when the pressed chip is clicked
      // again. There is always exactly one filter, so that means "All".
      onChange={(next) => setValue(typeof next === 'string' ? next : ALL)}
    >
      <ToggleButton value={ALL} label={allLabel} />
      {categories.map((c) => (
        <ToggleButton key={c} value={c} label={c} />
      ))}
    </ToggleButtonGroup>
  )
}
