/**
 * Diagrams.tsx components render with no client:* directive — they are pure
 * static JSX, so Astro server-renders them to HTML with no client JS. A hook or
 * an event handler silently breaks that and would force a client:* directive
 * (and with it a React runtime on every article page). See the Islands policy
 * in CLAUDE.md.
 */

const HOOK = /^use[A-Z]/
const HANDLER = /^on[A-Z]/

function attrName(node) {
  const name = node.name
  if (!name) return null
  if (name.type === 'JSXNamespacedName') return name.name.name
  return name.name ?? null
}

/** `useState(...)` or `React.useState(...)` → 'useState'. */
function calleeHookName(callee) {
  if (callee.type === 'Identifier') return callee.name
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    return callee.property.name
  }
  return null
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep diagram components static: no hooks, no event handlers',
    },
    messages: {
      hook: '{{name}}() makes this diagram stateful. Diagrams must render at build time with zero client JS — a hook forces a client:* directive and a React runtime onto every article page.',
      handler:
        '{{name}} is an event handler. Diagrams must render at build time with zero client JS — a handler needs hydration, which these pages do not ship.',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        const name = calleeHookName(node.callee)
        if (name && HOOK.test(name)) {
          context.report({ node, messageId: 'hook', data: { name } })
        }
      },

      JSXAttribute(node) {
        const name = attrName(node)
        if (name && HANDLER.test(name)) {
          context.report({ node, messageId: 'handler', data: { name } })
        }
      },
    }
  },
}
