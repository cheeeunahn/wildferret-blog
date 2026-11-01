import type { SVGProps } from 'react'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'

// Astryx has no speaker glyphs, so these are passed to its Icon as components.
const SoundOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="m16 9 5 6" />
    <path d="m21 9-5 6" />
  </svg>
)

const SoundOn = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)

interface Props {
  labelOn: string
  labelOff: string
}

/**
 * The hero's ambient-sound toggle. Rendered by FerretHero.astro WITHOUT a
 * client:* directive, so it is static HTML and ships no JS — it is not an
 * island. The behaviour is FerretHero's is:inline script, which flips
 * aria-pressed and swaps aria-label from the data-label-* attributes (the
 * script is untranslated by design, so it reads the page's language off the
 * DOM). aria-pressed is the single source of truth: the icon swap and the lit
 * colour are `aria-pressed:` utilities, so nothing can drift out of sync.
 *
 * Not Astryx's ToggleButton: that one styles its pressed state from React
 * state, which a static render never updates.
 */
export default function HeroSoundButton({ labelOn, labelOff }: Props) {
  return (
    <IconButton
      label={labelOn}
      variant="secondary"
      elevation="low"
      aria-pressed="false"
      data-label-on={labelOn}
      data-label-off={labelOff}
      // z-3 puts it over the hero's step labels (z-2), so clicking it never
      // advances the greeting.
      className="hero-sound group absolute right-3 bottom-3 z-3 aria-pressed:text-(color:--color-text-yellow) aria-pressed:border-(color:--color-border-yellow)"
      icon={
        <>
          <Icon icon={SoundOff} className="group-aria-pressed:hidden" />
          <Icon icon={SoundOn} className="hidden group-aria-pressed:inline-flex" />
        </>
      }
    />
  )
}
