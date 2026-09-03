// Repo-local ESLint rules enforcing the conventions written up in CLAUDE.md.
// Wired into eslint.config.js as the `local` plugin.
import noBareInternalHref from './no-bare-internal-href.js'
import noInteractiveDiagrams from './no-interactive-diagrams.js'
import noRawColors from './no-raw-colors.js'
import noUnlistedIsland from './no-unlisted-island.js'

export default {
  meta: { name: 'eslint-plugin-local', version: '0.1.0' },
  rules: {
    'no-bare-internal-href': noBareInternalHref,
    'no-interactive-diagrams': noInteractiveDiagrams,
    'no-raw-colors': noRawColors,
    'no-unlisted-island': noUnlistedIsland,
  },
}
