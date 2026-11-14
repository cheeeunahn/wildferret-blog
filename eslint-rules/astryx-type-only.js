/**
 * Type size, weight, line height and letter spacing come from Astryx: a
 * `Text` or `Heading` type (body, large, supporting, the theme's own prose and
 * compact, …) or Astryx's own components. A Tailwind typography utility on top
 * of that bypasses the type scale the theme sets, so a size change in the theme
 * no longer reaches that text.
 *
 * This rule makes that half of "Astryx only" a lint error. It flags, in class
 * strings and any other string or template text:
 *   - font sizes: `text-xs` … `text-9xl`, `text-[15px]`
 *   - font weights: `font-thin` … `font-black`
 *   - line heights: `leading-*`
 *   - letter spacing: `tracking-*`
 * Color and alignment utilities (`text-ink-900`, `text-center`, `text-pretty`)
 * and the font family (`font-body`) are not typography in this sense and pass.
 * A size the scale lacks belongs in the theme as a custom Text type
 * (`components.text` in wildferretTheme.ts). Article bodies and tests are
 * skipped. See Design Tokens in CLAUDE.md.
 */

const TYPE_CLASS = new RegExp(
  '(?:^|[\\s"\'`])(?:[\\w-]+:)*(' +
    'text-(?:xs|sm|base|lg|xl|[2-9]xl)|text-\\[[^\\]]+\\]' +
    '|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)' +
    '|leading-[\\w.\\[\\]()-]+' +
    '|tracking-[\\w.\\[\\]()-]+' +
    ')!?(?=$|[\\s"\'`])',
)

const skipped = (filename) =>
  filename.includes('/article-content/') || /\.test\.[jt]sx?$/.test(filename)

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Typography comes from Astryx Text/Heading types and the theme, not Tailwind typography utilities',
    },
    messages: {
      utility:
        'Tailwind typography utility "{{match}}" bypasses the Astryx type scale. Use a Text or Heading type (or weight), or add a custom Text type to the theme. See Design Tokens in CLAUDE.md.',
    },
    schema: [],
  },

  create(context) {
    if (skipped(context.filename)) return {}

    const check = (node, text) => {
      if (typeof text !== 'string' || !text) return
      const hit = text.match(TYPE_CLASS)
      if (hit) context.report({ node, messageId: 'utility', data: { match: hit[1] } })
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
