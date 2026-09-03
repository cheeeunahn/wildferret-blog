/**
 * global.css defines a custom ink/paper token scale in an @theme block, and dark
 * mode reassigns the same tokens on `.dark` — which is why almost nothing needs a
 * `dark:` variant. A raw hex or a stock Tailwind palette class opts out of that
 * and stays light-mode-only. See the Design Tokens section of CLAUDE.md.
 */

const TOKENS =
  'ink-50…950, paper, paper-warm, surface, surface-hover, accent, accent-soft, accent-strong, copper, thumb-plate'

// The stock palette Tailwind ships. Deliberately not `[a-z]+-\d{3}` — that would
// also swallow ink-500 and any future token whose name ends in a number.
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const UTILITY =
  'bg|text|border|fill|stroke|ring|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder'

// Leading variants (hover:, sm:, dark:) and a trailing opacity (/30) are stripped
// before matching, so `hover:bg-slate-500/30` is caught too.
const PALETTE_CLASS = new RegExp(`^-?(${UTILITY})-(${PALETTE})-\\d{2,3}$`)

const HEX = /#[0-9a-fA-F]{3,8}\b/
const FUNCTIONAL = /\b(rgba?|hsla?|oklch|lab)\s*\(/

const CLASS_ATTRS = new Set(['class', 'classname', 'classlist'])
const COLOR_ATTRS = new Set(['class', 'classname', 'classlist', 'style', 'fill', 'stroke', 'color', 'stopcolor'])

function attrName(node) {
  const name = node.name
  if (!name) return null
  if (name.type === 'JSXNamespacedName') return name.name.name
  return name.name ?? null
}

/** Every static string chunk of an attribute value, with the node to report on. */
function stringChunks(value) {
  if (!value) return []
  if (value.type === 'Literal') {
    return typeof value.value === 'string' ? [{ node: value, text: value.value }] : []
  }
  if (value.type === 'JSXExpressionContainer') return stringChunks(value.expression)
  if (value.type === 'TemplateLiteral') {
    return value.quasis.map((q) => ({ node: q, text: q.value.raw }))
  }
  if (value.type === 'Literal' || value.type === 'JSXText') {
    return [{ node: value, text: String(value.value) }]
  }
  return []
}

function bareClass(cls) {
  const withoutVariants = cls.slice(cls.lastIndexOf(':') + 1)
  const slash = withoutVariants.indexOf('/')
  return slash === -1 ? withoutVariants : withoutVariants.slice(0, slash)
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Use the ink/paper design tokens instead of raw colors' },
    messages: {
      palette:
        'Raw Tailwind palette class "{{cls}}". Use a design token from global.css — ' + TOKENS + '.',
      literal:
        'Raw color value "{{value}}". Colors are defined once in the @theme block of global.css so dark mode can reassign them — use a token: ' +
        TOKENS +
        '.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        const name = attrName(node)
        if (!name) return
        const key = name.toLowerCase()
        if (!COLOR_ATTRS.has(key)) return

        for (const { node: chunk, text } of stringChunks(node.value)) {
          if (CLASS_ATTRS.has(key)) {
            for (const cls of text.split(/\s+/)) {
              if (cls && PALETTE_CLASS.test(bareClass(cls))) {
                context.report({ node: chunk, messageId: 'palette', data: { cls } })
              }
            }
          }

          const raw = text.match(HEX) ?? text.match(FUNCTIONAL)
          if (raw) {
            context.report({ node: chunk, messageId: 'literal', data: { value: raw[0] } })
          }
        }
      },
    }
  },
}
