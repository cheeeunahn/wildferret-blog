/**
 * Astro does not prefix `<a href>` with the configured `base`, and there is no
 * router <Link> to do it. Route hrefs must go through href() from
 * src/lib/siteUrl.ts; images and in-content links through resolveAssetUrl()
 * from src/lib/assetUrl.ts. See the Linking section of CLAUDE.md.
 */

// The pass-through set encoded in href(): protocol-relative, any scheme://,
// mailto:, tel:. Kept in the same shape as the source helper so the two stay
// legible against each other.
const PASSES_THROUGH = /^([a-z][a-z0-9+.-]*:)?\/\//i
const MAILTO_OR_TEL = /^(mailto|tel):/i

const URL_ATTRS = new Set(['href', 'src', 'srcset', 'poster', 'action'])

// astro.config.mjs defaults `base` to '/' and lets BASE_PATH override it, so no
// path prefix may be baked into a URL string. Listed here are the prefixes that
// have actually been deployed, since those are the ones that get pasted back in
// from a stale link or an old article draft.
const DEFAULT_BASE_PATHS = ['/wildferret-blog/']

function attrName(node) {
  const name = node.name
  if (!name) return null
  if (name.type === 'JSXNamespacedName') return name.name.name
  return name.name ?? null
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require href()/resolveAssetUrl() for internal URLs and forbid a hardcoded base path',
    },
    messages: {
      bareHref:
        'Bare internal path "{{path}}". Route hrefs go through href() from src/lib/siteUrl.ts; asset paths through resolveAssetUrl() from src/lib/assetUrl.ts.',
      hardcodedBase:
        'Hardcoded base path "{{base}}". The base is configurable (astro.config.mjs / BASE_PATH) — let href() or resolveAssetUrl() apply it.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          basePaths: { type: 'array', items: { type: 'string' }, uniqueItems: true },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const basePaths = context.options[0]?.basePaths ?? DEFAULT_BASE_PATHS

    function checkBase(node, raw) {
      if (typeof raw !== 'string') return
      const hit = basePaths.find((base) => raw.includes(base))
      if (hit) context.report({ node, messageId: 'hardcodedBase', data: { base: hit } })
    }

    return {
      JSXAttribute(node) {
        const name = attrName(node)
        if (!name || !URL_ATTRS.has(name.toLowerCase())) return

        const value = node.value
        if (!value || value.type !== 'Literal' || typeof value.value !== 'string') return

        const path = value.value
        if (!path.startsWith('/')) return
        if (PASSES_THROUGH.test(path) || MAILTO_OR_TEL.test(path)) return

        context.report({ node: value, messageId: 'bareHref', data: { path } })
      },

      Literal(node) {
        if (typeof node.value === 'string') checkBase(node, node.value)
      },

      TemplateElement(node) {
        checkBase(node, node.value?.raw)
      },
    }
  },
}
