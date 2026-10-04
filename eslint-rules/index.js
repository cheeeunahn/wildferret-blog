// Repo-local ESLint rules enforcing the conventions written up in CLAUDE.md.
// Wired into eslint.config.js as the `local` plugin.
import noBareInternalHref from './no-bare-internal-href.js'
import noCrossLayerImport from './no-cross-layer-import.js'
import noUnescapedUserHtml from './no-unescaped-user-html.js'
import noUnlistedIsland from './no-unlisted-island.js'

export default {
  meta: { name: 'eslint-plugin-local', version: '0.1.0' },
  rules: {
    'no-bare-internal-href': noBareInternalHref,
    'no-cross-layer-import': noCrossLayerImport,
    'no-unescaped-user-html': noUnescapedUserHtml,
    'no-unlisted-island': noUnlistedIsland,
  },
}
