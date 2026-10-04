/**
 * Keeps the presentation / logic / data layers separate. See the Layers
 * section of CLAUDE.md and docs/adr/0001-layered-architecture.md.
 *
 * Configured as a list of zones: a file matching `target` may not import
 * anything under `from`. Only relative specifiers are checked — the repo has
 * no path aliases, so every in-repo import is relative and every bare
 * specifier is a package.
 *
 * Targets are directory prefixes (`src/pages`) or globs (`src/components/*.tsx`),
 * relative to the repo root. The zones themselves live in eslint.config.js.
 */

import path from 'node:path'

function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*')}$`)
}

function matches(rel, pattern) {
  if (pattern.includes('*')) return globToRegExp(pattern).test(rel)
  return rel === pattern || rel.startsWith(`${pattern}/`)
}

/** Repo-relative POSIX path, whether ESLint hands us an absolute or relative filename. */
function repoRelative(filename) {
  const posix = filename.split(path.sep).join('/')
  if (posix.startsWith('src/')) return posix
  const i = posix.lastIndexOf('/src/')
  return i === -1 ? null : posix.slice(i + 1)
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Forbid imports that cross a layer boundary' },
    messages: {
      crossLayer: '{{file}} may not import {{target}} — {{reason}} See the Layers section of CLAUDE.md.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          zones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                target: { type: 'array', items: { type: 'string' }, minItems: 1 },
                from: { type: 'array', items: { type: 'string' }, minItems: 1 },
                reason: { type: 'string' },
              },
              required: ['target', 'from', 'reason'],
              additionalProperties: false,
            },
          },
        },
        required: ['zones'],
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const file = repoRelative(context.filename)
    if (!file) return {}

    const zones = context.options[0].zones.filter((z) => z.target.some((t) => matches(file, t)))
    if (zones.length === 0) return {}

    function check(node, source) {
      const spec = source?.value
      if (typeof spec !== 'string' || !spec.startsWith('.')) return
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec))

      for (const zone of zones) {
        const hit = zone.from.find((f) => matches(resolved, f))
        if (hit) {
          context.report({ node, messageId: 'crossLayer', data: { file, target: hit, reason: zone.reason } })
          return
        }
      }
    }

    return {
      ImportDeclaration: (node) => check(node, node.source),
      ExportNamedDeclaration: (node) => check(node, node.source),
      ExportAllDeclaration: (node) => check(node, node.source),
      ImportExpression: (node) => check(node, node.source),
    }
  },
}
