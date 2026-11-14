/**
 * Text the site owner did not write (today: the AI summary, which is model
 * output) must reach the page through React's automatic escaping of JSX
 * children. That escaping is the only thing between such text and live markup.
 *
 * dangerouslySetInnerHTML opts out of exactly that. The article pipeline does
 * emit raw HTML on purpose (formatInline + set:html in ArticleView.astro), which
 * is safe only because its input is the site owner's own content, so reusing
 * that parser to format untrusted text would be an injection hole. This rule
 * makes the mistake unavailable in components rather than a note in a doc.
 *
 * See the AI Summary section in CLAUDE.md.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep untrusted text, such as model output, behind React escaping',
    },
    messages: {
      dangerous:
        'dangerouslySetInnerHTML bypasses React escaping. Untrusted text such as model output must render as JSX children ({value}) instead. See the AI Summary section in CLAUDE.md.',
      formatInline:
        'formatInline() emits raw HTML and trusts its input, which is safe only for article content written by the site owner. Never run untrusted text (such as model output) through it.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.type === 'JSXIdentifier' && node.name.name === 'dangerouslySetInnerHTML') {
          context.report({ node, messageId: 'dangerous' })
        }
      },

      // The second half of the trap: importing the article parser into a
      // component that renders untrusted text. Scoped to components — the parser's
      // own module and tests import formatInline legitimately, and so does
      // ArticleView.astro (not linted by this rule), which is what it exists for.
      ImportDeclaration(node) {
        if (!context.filename.includes('/components/')) return
        if (!String(node.source.value).endsWith('content/parser')) return
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.name === 'formatInline') {
            context.report({ node: spec, messageId: 'formatInline' })
          }
        }
      },
    }
  },
}
