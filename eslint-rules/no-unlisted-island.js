/**
 * ThemeToggle is the only component allowed to hydrate. Everything else —
 * diagrams included — is server-rendered to static HTML. A stray client:*
 * directive ships a React runtime to the page that carries it. See the Islands
 * policy in CLAUDE.md.
 *
 * The diagram call site in article/[slug].astro renders `<Diagram />` from
 * getDiagram(), so provenance cannot be traced through imports. Allowlisting the
 * one legitimate island is both simpler and stricter.
 */

const DEFAULT_ALLOW = ['ThemeToggle']

function elementName(openingElement) {
  const name = openingElement?.name
  if (!name) return null
  if (name.type === 'JSXIdentifier') return name.name
  if (name.type === 'JSXMemberExpression') return null
  return null
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Allow client:* hydration directives only on listed components' },
    messages: {
      unlisted:
        '{{directive}} on <{{component}}> adds a client-side React runtime to this page. Only {{allowed}} may hydrate — see the Islands policy in CLAUDE.md.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: { type: 'array', items: { type: 'string' }, uniqueItems: true },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const allow = new Set(context.options[0]?.allow ?? DEFAULT_ALLOW)

    return {
      JSXAttribute(node) {
        const name = node.name
        if (name?.type !== 'JSXNamespacedName') return
        if (name.namespace.name !== 'client') return

        const component = elementName(node.parent)
        if (component && allow.has(component)) return

        context.report({
          node,
          messageId: 'unlisted',
          data: {
            directive: `client:${name.name.name}`,
            component: component ?? 'element',
            allowed: [...allow].map((c) => `<${c}>`).join(', '),
          },
        })
      },
    }
  },
}
