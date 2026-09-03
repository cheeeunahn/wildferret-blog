import js from '@eslint/js'
import globals from 'globals'
import astro from 'eslint-plugin-astro'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import local from './eslint-rules/index.js'

// The `local` plugin turns the conventions written up in CLAUDE.md — Linking,
// the Islands policy, Design Tokens — into lint errors. See eslint-rules/.
const localRules = {
  'local/no-bare-internal-href': 'error',
  'local/no-raw-colors': 'error',
}

export default defineConfig([
  globalIgnores(['dist', '.astro']),
  {
    // .astro templates are type-checked by `astro check`, not typescript-eslint.
    // Scoping to src/ also keeps the React rules off astro.config.mjs /
    // vitest.config.ts.
    files: ['src/**/*.{ts,tsx}'],
    // The astro processor emits each <script> block as a virtual `Foo.astro/0_0.ts`,
    // which `src/**/*.ts` would otherwise match — pulling the React and
    // typescript-eslint rule sets onto the deliberately untranspiled pre-paint
    // theme script in Base.astro.
    ignores: ['**/*.astro/*'],
    plugins: { local },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: localRules,
  },
  {
    // href=, client:*, and class= all live in the templates, so the local rules
    // are near-dead without this block. The React rule sets stay off — .astro
    // components are not React components.
    files: ['src/**/*.astro'],
    plugins: { local },
    // flat/base wires up the .astro parser and processor without astro's opinionated
    // rule set, whose no-var / no-empty would fight the deliberately untranspiled
    // pre-paint theme script in Base.astro.
    extends: [astro.configs['flat/base']],
    rules: {
      ...localRules,
      'local/no-unlisted-island': 'error',
    },
  },
  {
    // Diagrams render at build time with no client:* directive. A hook or an
    // event handler here would force one, and with it a React runtime on every
    // article page.
    files: ['src/components/Diagrams.tsx'],
    plugins: { local },
    rules: { 'local/no-interactive-diagrams': 'error' },
  },
])
