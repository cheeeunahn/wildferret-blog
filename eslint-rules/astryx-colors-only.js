/**
 * Every color on the site comes from an Astryx semantic token, either directly
 * (`var(--color-text-primary)`) or through the Tailwind aliases in global.css
 * (`text-ink-900`, `bg-paper`, …). Astryx defines those tokens with
 * `light-dark()`, so they follow the theme toggle; a raw value or a stock
 * Tailwind palette class does not, and silently breaks dark mode.
 *
 * This rule makes that half of "Astryx only" a lint error instead of a review
 * note. It flags, in class strings and any other string or template text:
 *   - stock palette classes (`bg-white`, `text-gray-500`, `hover:border-red-200`)
 *   - arbitrary color values in a class (`bg-[#fff]`, `text-[rgb(0_0_0)]`)
 * and any string that is itself a color (`'#ffffff'`, `'rgb(0 0 0)'`), which
 * is how a raw color reaches a `style` object.
 *
 * CSS is not linted by ESLint: the two deliberate raw colors in global.css
 * (the fireflies' glow and --color-thumb-plate) are documented there.
 * src/styles/astryx/stoneColors.ts (where the tokens get their values), article
 * bodies and tests are skipped. See Design Tokens in CLAUDE.md.
 */

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const PROPS =
  'text|bg|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|from|via|to|divide|shadow|decoration|accent|caret|placeholder|inset-shadow'

// A class token: optional variants (`hover:`, `dark:`, `sm:`), the property,
// then a stock palette color or white/black (with an optional `/opacity`).
const PALETTE_CLASS = new RegExp(
  `(?:^|[\\s"'\`])(?:[\\w-]+:)*(?:${PROPS})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?:\\/\\d+)?(?=$|[\\s"'\`])`,
)
// An arbitrary value holding a raw color: `bg-[#fff]`, `text-[rgb(…)]`.
const ARBITRARY_COLOR = /-\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl|oklch|oklab|lab|lch)a?\()/
// A string that is nothing but a color.
const COLOR_VALUE = /^\s*(?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl|oklch|oklab|lab|lch)a?\([^)]*\))\s*$/

// `href="#add"` is an in-page anchor, not the color #add: attributes that hold
// an id or a URL never carry a color value.
const ID_OR_URL_ATTR = /^(?:href|src|id|for|name|aria-[\w-]+|data-[\w-]+)$/
const holdsIdOrUrl = (node) => {
  const attr = node.parent
  return attr?.type === 'JSXAttribute' && ID_OR_URL_ATTR.test(String(attr.name?.name ?? ''))
}

// stoneColors.ts is where the tokens get their raw values, so raw colors belong
// there, and only there: the rest of the theme folder is checked like any file.
const skipped = (filename) =>
  filename.includes('/article-content/') ||
  filename.endsWith('/styles/astryx/stoneColors.ts') ||
  /\.test\.[jt]sx?$/.test(filename)

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Colors come from Astryx tokens (or their aliases), never raw values or stock Tailwind palette classes',
    },
    messages: {
      palette:
        'Stock Tailwind palette class "{{match}}" does not follow the theme. Use an Astryx token alias (text-ink-900, bg-paper, border-ink-100, …). See Design Tokens in CLAUDE.md.',
      arbitrary:
        'Raw color in an arbitrary class value ("{{match}}"). Use an Astryx token alias, or bg-(--color-…) for an Astryx token with no alias. See Design Tokens in CLAUDE.md.',
      value:
        'Raw color value "{{match}}". Use var(--color-…) from Astryx instead. See Design Tokens in CLAUDE.md.',
    },
    schema: [],
  },

  create(context) {
    if (skipped(context.filename)) return {}

    const check = (node, text) => {
      if (typeof text !== 'string' || !text) return
      const palette = text.match(PALETTE_CLASS)
      if (palette) {
        context.report({
          node,
          messageId: 'palette',
          data: { match: palette[0].trim().replace(/^["'`]/, '') },
        })
        return
      }
      const arbitrary = text.match(ARBITRARY_COLOR)
      if (arbitrary) {
        context.report({ node, messageId: 'arbitrary', data: { match: arbitrary[0] } })
        return
      }
      if (COLOR_VALUE.test(text) && !holdsIdOrUrl(node))
        context.report({ node, messageId: 'value', data: { match: text.trim() } })
    }

    return {
      Literal(node) {
        check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw)
      },
    }
  },
}
