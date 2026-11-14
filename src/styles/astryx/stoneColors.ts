/**
 * The colors of Astryx's shipped "stone" theme (https://astryx.atmeta.com/themes?theme=stone),
 * copied from `pnpm exec astryx theme add stone` (@astryxdesign/cli 0.6.5): its
 * light and dark color tokens, its stone-tinted shadows and its code syntax
 * palette. Only the colors: stone's fonts, type scale, motion, radii, icons and
 * component shapes are not taken. wildferretTheme.ts spreads these in.
 *
 * Each token is a [light, dark] pair; Astryx compiles it to light-dark(), so the
 * site's theme toggle switches between them. These are the one place raw color
 * values belong (local/astryx-colors-only skips this file alone). To change a
 * color, change it here, then `pnpm theme:build`.
 */
import { defineSyntaxTheme } from '@astryxdesign/core/theme'
import type { TokenName, TokenValue } from '@astryxdesign/core/theme'

export const stoneSyntax = defineSyntaxTheme({
  name: 'astryx-stone',
  tokens: {
    keyword: ['#645a72', '#b2a7c1'], // Purple T40 / T70
    string: ['#4e6357', '#9bb19a'], // Teal T40 / Green T70
    comment: ['#5e5e5e', '#ababb0'], // Stone Neutral T40 / T70
    number: ['#755752', '#bea792'], // Red T40 / Orange T70
    function: ['#506072', '#99adc6'], // Blue T40 / T70
    type: ['#645a72', '#b2a7c1'], // Purple T40 / T70
    variable: ['#5e5e5e', '#ababb0'], // Stone Neutral T40 / T70
    operator: ['#5e5e5e', '#ababb0'], // Stone Neutral T40 / T70
    constant: ['#755752', '#bea792'], // Red T40 / Orange T70
    tag: ['#775751', '#c7a39d'], // Red T40 / T70
    attribute: ['#79693f', '#b6aa90'], // Yellow T45 / T70
    property: ['#4e6357', '#94b2a0'], // Teal T40 / T70
    punctuation: ['#5e5e5e', '#ababb0'], // Stone Neutral T40 / T70
    background: ['#f3f3f5', '#171719'],
  },
})

export const stoneColorTokens: Partial<Record<TokenName, TokenValue>> = {
  // Core semantic — all neutrals H=291
  // Stone 900 T=16 C=1.4, Stone 500 T=55 C=4, Stone 300 T=86 C=1.6, Stone 100 T=96 C=1
  '--color-accent': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15
  '--color-accent-muted': ['#25252a14', '#f3f3f520'], // light: Stone Neutral T15 · 8% / dark: T96 · 12.5%
  '--color-neutral': ['#25252a0f', '#f3f3f51a'], // light: Stone Neutral T15 · 6% / dark: T96 · 10%
  '--color-background-surface': ['#ffffff', '#1b1b1f'], // dark: Stone Neutral T10
  '--color-background-body': ['#f3f3f5', '#111015'], // dark: Stone Neutral T5
  '--color-overlay': ['#25252a80', '#28282acc'], // light: Stone Neutral T15 · 50% / dark: 80%
  '--color-overlay-hover': ['#25252a0d', '#f3f3f50d'], // light: Stone Neutral T15 · 5% / dark: T96 · 5%
  '--color-overlay-pressed': ['#25252a1a', '#f3f3f51a'], // light: Stone Neutral T15 · 10% / dark: T96 · 10%
  '--color-background-muted': ['#e2e2e8', '#3b3b3f'], // light: Stone Neutral T90

  // Text — H=291
  '--color-text-primary': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15
  // T40/T70 keeps normal secondary text above AA on every stone surface,
  // including the muted and tinted fills that components pair it with.
  '--color-text-secondary': ['#5e5e63', '#ababb0'], // Stone Neutral T40 / T70
  '--color-text-disabled': ['#d7d7da', '#5e5e61'], // T86 C=1.6 / T40 C=2
  '--color-text-accent': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15
  '--color-on-dark': '#FFFFFF',
  '--color-on-light': ['#25252a', '#28282a'], // light: Stone Neutral T15
  '--color-on-accent': ['#ffffff', '#25252a'], // dark: Stone Neutral T15
  // Text on top of matching status surface (badge fill, banner content).
  '--color-on-success': ['#374c36', '#d0e9ce'], // Green T30 / T90
  '--color-on-error': ['#58413e', '#f9dcd7'], // Red T30 / T90
  '--color-on-warning': ['#524622', '#f4e1b7'], // Yellow T30 / T90

  // Icon — H=291
  '--color-icon-accent': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15
  '--color-icon-primary': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15
  '--color-icon-secondary': ['#83838a', '#9d9da3'], // T55 C=4 / T65 C=3
  '--color-icon-disabled': ['#d7d7da', '#5e5e61'], // T86 C=1.6 / T40 C=2

  // Surface variants — H=291
  '--color-background-card': ['#FFFFFF', '#242325'], // T14
  '--color-background-popover': ['#ffffff', '#25252a'], // dark: Stone Neutral T15
  '--color-background-inverted': ['#25252a', '#f3f3f5'], // light: Stone Neutral T15

  // Status / Sentiment — T50 from palette for icons/borders (visible color)
  '--color-success': ['#374c36', '#b4cdb2'], // Green T30 / T80
  '--color-success-muted': ['#d0e9ce', '#b4cdb2'], // Green T90 / T80
  '--color-error': ['#58413e', '#dcc0bc'], // Red T30 / T80
  '--color-error-muted': ['#f9dcd7', '#dcc0bc'], // Red T90 / T80
  '--color-warning': ['#524622', '#d7c59c'], // Yellow T30 / T80
  '--color-warning-muted': ['#f4e1b7', '#d7c59c'], // Yellow T90 / T80

  // Border — H=291
  '--color-border': ['#e2e2e8', '#f3f3f51a'], // light: Stone Neutral T90 / dark: T96 · 10%
  '--color-border-emphasized': ['#83838a', '#5e5e61'], // T55 C=4 / T40 C=2

  // Effects — H=291
  '--color-skeleton': ['#d4d4da', '#5e5e64'], // T85 / T40 from H=291 C=3
  '--color-shadow': ['#25252a1a', '#0000004d'], // light: Stone Neutral T15 · 10% / dark: 30%
  '--color-tint-hover': ['black', 'white'],

  // Categorical hues
  //   Light: T90 solid bg + T30 text (pastel surface, dark text)
  //   Dark:  T35 solid bg + T90 text — snaps to canonical palette stops
  //          per theming-infra.mdc §7. T90 dark text is the SAME hex as
  //          the light-mode bg pastel — clean palette symmetry, ~6–9:1
  //          contrast on the T35 surface across all hues (passes AA Body).
  // Borders: light T85 / dark T25 — one step inward from surface in both
  //          modes, matching the light-mode T90/T85 spacing.

  // Categorical — Blue H=265 C=10
  '--color-background-blue': ['#d7e4f5', '#485362'], // light T90 / dark T35
  '--color-border-blue': ['#c9d6e7', '#313c4a'], // light T85 / dark T25
  '--color-icon-blue': ['#3c4856', '#d7e4f5'], // light T30 / dark T90
  '--color-text-blue': ['#3c4856', '#d7e4f5'],

  // Categorical — Cyan H=190 C=10
  '--color-background-cyan': ['#cce8e5', '#3e5755'],
  '--color-border-cyan': ['#bedad7', '#28403e'],
  '--color-icon-cyan': ['#334b49', '#cce8e5'],
  '--color-text-cyan': ['#334b49', '#cce8e5'],

  // Categorical — Gray (pure neutral, C=0). Same T35/T25/T90 pattern from
  // the neutral H=291 C=3 ramp.
  '--color-background-gray': ['#e2e2e8', '#525257'], // light: Stone Neutral T90
  '--color-border-gray': ['#d4d4da', '#3b3b3f'], // light: Stone Neutral T85
  '--color-icon-gray': ['#46464b', '#e2e2e8'], // light: Stone Neutral T30
  '--color-text-gray': ['#46464b', '#e2e2e8'], // light: Stone Neutral T30

  // Categorical — Green H=142 C=17
  '--color-background-green': ['#d0e9ce', '#425841'],
  '--color-border-green': ['#c2dbc0', '#2b402b'],
  '--color-icon-green': ['#374c36', '#d0e9ce'],
  '--color-text-green': ['#374c36', '#d0e9ce'],

  // Categorical — Orange H=70 C=22
  '--color-background-orange': ['#ffdcbb', '#684d32'],
  '--color-border-orange': ['#f1ceae', '#4f361c'],
  '--color-icon-orange': ['#5b4227', '#ffdcbb'],
  '--color-text-orange': ['#5b4227', '#ffdcbb'],

  // Categorical — Pink H=340 C=9
  '--color-background-pink': ['#f0dde8', '#5e4e57'],
  '--color-border-pink': ['#e2cfda', '#463740'],
  '--color-icon-pink': ['#52424c', '#f0dde8'],
  '--color-text-pink': ['#52424c', '#f0dde8'],

  // Categorical — Purple H=307 C=11
  '--color-background-purple': ['#e8dff3', '#564f60'],
  '--color-border-purple': ['#d9d1e5', '#3f3949'],
  '--color-icon-purple': ['#4b4454', '#e8dff3'],
  '--color-text-purple': ['#4b4454', '#e8dff3'],

  // Categorical — Red H=33 C=11
  '--color-background-red': ['#f9dcd7', '#644d49'],
  '--color-border-red': ['#ebcec9', '#4c3633'],
  '--color-icon-red': ['#58413e', '#f9dcd7'],
  '--color-text-red': ['#58413e', '#f9dcd7'],

  // Categorical — Teal H=158 C=9
  '--color-background-teal': ['#d4e7dc', '#46564d'],
  '--color-border-teal': ['#c6d9ce', '#303f36'],
  '--color-icon-teal': ['#3b4a41', '#d4e7dc'],
  '--color-text-teal': ['#3b4a41', '#d4e7dc'],

  // Categorical — Yellow H=90 C=23
  '--color-background-yellow': ['#f4e1b7', '#5e512d'],
  '--color-border-yellow': ['#e5d3a9', '#463a18'],
  '--color-icon-yellow': ['#524622', '#f4e1b7'],
  '--color-text-yellow': ['#524622', '#f4e1b7'],

  // Shadows, tinted with stone's neutral.
  '--shadow-low': '0 2px 4px #28282A0D, 0 4px 8px #28282A1A',
  '--shadow-med': '0 2px 4px #28282A0D, 0 4px 12px #28282A1A',
  '--shadow-high': '0 4px 6px #28282A1A, 0 12px 24px #28282A26',
  '--shadow-inset-hover': 'inset 0px 0px 0px 2px #28282A30',
  '--shadow-inset-selected': 'inset 0px 0px 0px 2px #28282A50',
  '--shadow-inset-success': 'inset 0px 0px 0px 2px #83838a30',
  '--shadow-inset-warning': 'inset 0px 0px 0px 2px #83838a30',
  '--shadow-inset-error': 'inset 0px 0px 0px 2px #83838a30',
}
