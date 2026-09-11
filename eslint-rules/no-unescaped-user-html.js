/**
 * Comment bodies and nicknames are attacker-controlled text stored verbatim —
 * the moderation trigger rejects profanity and PII but is not an XSS filter, so
 * `<script>` reaches the database as text. Rendering is the vulnerability, and
 * React's automatic escaping of JSX children is the only thing that stops it.
 *
 * dangerouslySetInnerHTML opts out of exactly that. The article pipeline does
 * emit raw HTML on purpose (formatInline + set:html in article/[slug].astro),
 * which is safe only because its input is the site owner's own content — so the
 * tempting move, reusing that parser for comments, is a stored-XSS hole. This
 * rule makes the mistake unavailable in components rather than a note in a doc.
 *
 * See the Stored XSS section in CLAUDE.md.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid dangerouslySetInnerHTML on user-supplied content',
    },
    messages: {
      dangerous:
        'dangerouslySetInnerHTML bypasses React escaping. Comment text is attacker-controlled and the moderation trigger does not strip HTML — render it as JSX children ({value}) instead. See the Stored XSS section in CLAUDE.md.',
      formatInline:
        'formatInline() emits raw HTML and trusts its input, which is safe only for article content written by the site owner. Never run comment text through it.',
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
      // component that renders user data. Scoped to components — the parser's
      // own module and tests import formatInline legitimately, and so does
      // article/[slug].astro, which is exactly what it exists for.
      ImportDeclaration(node) {
        if (!context.filename.includes('/components/')) return
        if (!String(node.source.value).endsWith('articleContent')) return
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.name === 'formatInline') {
            context.report({ node: spec, messageId: 'formatInline' })
          }
        }
      },
    }
  },
}
