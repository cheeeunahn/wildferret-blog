import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import * as astroParser from 'astro-eslint-parser'
import { describe, it } from 'vitest'

import noBareInternalHref from './no-bare-internal-href.js'
import noCrossLayerImport from './no-cross-layer-import.js'
import { layerZones } from './layer-zones.js'
import noUnescapedUserHtml from './no-unescaped-user-html.js'
import noUnlistedIsland from './no-unlisted-island.js'

// RuleTester drives mocha-style globals; vitest supplies compatible ones.
RuleTester.describe = describe
RuleTester.it = it

/** Rules run against .tsx (ThemeToggle.tsx, Comments.tsx). */
const tsx = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

/** Rules run against .astro templates, where most violations would live. */
const astro = new RuleTester({
  languageOptions: {
    parser: astroParser,
    parserOptions: { parser: tsParser },
  },
})

// astro-eslint-parser only takes the .astro path from the filename.
const astroCase = (code, errors) => ({
  filename: 'src/pages/x.astro',
  code,
  ...(errors ? { errors } : {}),
})

tsx.run('no-bare-internal-href (tsx)', noBareInternalHref, {
  valid: [
    "const a = <a href={href('/about')}>x</a>",
    'const a = <a href="https://example.com">x</a>',
    'const a = <a href="mailto:someone@example.com">x</a>',
    'const a = <a href="//cdn.example.com/x.css">x</a>',
    'const a = <a href="#top">x</a>',
    "const a = <img src={resolveAssetUrl('/favicon.svg')} />",
  ],
  invalid: [
    { code: 'const a = <a href="/about">x</a>', errors: [{ messageId: 'bareHref' }] },
    { code: 'const a = <img src="/assets/images/a.png" />', errors: [{ messageId: 'bareHref' }] },
    {
      // The article-content files are plain .ts strings, so this half of the rule
      // is the only one that reaches a markdown [text](url) link.
      code: 'export const content = `See [the post](/wildferret-blog/article/x).`',
      errors: [{ messageId: 'hardcodedBase' }],
    },
    {
      code: "const src = '/wildferret-blog/assets/a.png'",
      errors: [{ messageId: 'hardcodedBase' }],
    },
  ],
})

astro.run('no-bare-internal-href (astro)', noBareInternalHref, {
  valid: [astroCase('<a href={href("/about")}>x</a>'), astroCase('<a href="https://x.com">x</a>')],
  invalid: [astroCase('<a href="/about">x</a>', [{ messageId: 'bareHref' }])],
})

astro.run('no-unlisted-island', noUnlistedIsland, {
  valid: [
    astroCase('<ThemeToggle client:only="react" />'),
    astroCase('<ArticleCard />'),
    astroCase('<div class="animate-reveal"><ArticleCard /></div>'),
  ],
  invalid: [
    astroCase('<LangSwitcher client:load />', [{ messageId: 'unlisted' }]),
    astroCase('<ArticleCard client:visible />', [{ messageId: 'unlisted' }]),
  ],
})

astro.run('no-unlisted-island (with the Comments island allowed)', noUnlistedIsland, {
  valid: [
    {
      ...astroCase('<Comments client:visible articleSlug={s} />'),
      options: [{ allow: ['ThemeToggle', 'Comments'] }],
    },
  ],
  invalid: [
    // The allowlist is per-component, so opening it for Comments must not open
    // it for anything else.
    {
      ...astroCase('<ArticleCard client:visible />', [{ messageId: 'unlisted' }]),
      options: [{ allow: ['ThemeToggle', 'Comments'] }],
    },
    // ...and Comments is only an island because the config says so.
    astroCase('<Comments client:visible />', [{ messageId: 'unlisted' }]),
  ],
})

tsx.run('no-unescaped-user-html', noUnescapedUserHtml, {
  valid: [
    // React escapes JSX children — this is the actual defense against stored XSS.
    { code: 'const C = ({ c }) => <p>{c.body}</p>', filename: 'src/components/Comments.tsx' },
    {
      code: 'const C = ({ c }) => <span title={c.nickname}>{c.nickname}</span>',
      filename: 'src/components/Comments.tsx',
    },
    // The parser's own module and tests import it legitimately; only
    // components are barred.
    {
      code: "import { formatInline } from './parser'",
      filename: 'src/content/parser.test.ts',
    },
    {
      code: "import { splitContentIntoBlocks } from '../content/parser'",
      filename: 'src/components/Comments.tsx',
    },
  ],
  invalid: [
    {
      code: 'const C = ({ c }) => <p dangerouslySetInnerHTML={{ __html: c.body }} />',
      filename: 'src/components/Comments.tsx',
      errors: [{ messageId: 'dangerous' }],
    },
    {
      // The tempting shortcut: reuse the article parser, which emits raw HTML
      // because it trusts its input.
      code: "import { formatInline } from '../content/parser'",
      filename: 'src/components/Comments.tsx',
      errors: [{ messageId: 'formatInline' }],
    },
  ],
})

// Run against the real zone map, so a loosened zone fails here rather than
// passing against a test-only copy.
const layers = [{ zones: layerZones }]
const layerCase = (filename, code, errors) => ({
  filename,
  code,
  options: layers,
  ...(errors ? { errors } : {}),
})
const crossLayer = [{ messageId: 'crossLayer' }]

tsx.run('no-cross-layer-import (ts/tsx)', noCrossLayerImport, {
  valid: [
    // Every layer may use the shared helpers.
    layerCase('src/components/Comments.tsx', "import { checkComment } from '../shared/moderation'"),
    layerCase('src/content/service.ts', "import { articles } from '../data/articles'"),
    layerCase('src/data/about.ts', "import type { Lang } from '../shared/i18n'"),
    // Same-layer imports, including data's own dynamic article imports.
    layerCase('src/data/articles.ts', "const c = () => import('./article-content/x')"),
    layerCase('src/components/Comments.tsx', "import { A } from './Other'"),
    // Packages are not layers.
    layerCase('src/shared/i18n.ts', "import { describe } from 'vitest'"),
    // Absolute filenames, as ESLint passes them for real.
    layerCase('/repo/src/content/service.ts', "import { about } from '../data/about'"),
  ],
  invalid: [
    // An island bundling build-time content would ship it to the browser.
    layerCase(
      'src/components/Comments.tsx',
      "import { articlesIn } from '../content/service'",
      crossLayer,
    ),
    layerCase(
      'src/client/supabaseComments.ts',
      "import { articles } from '../data/articles'",
      crossLayer,
    ),
    // Type-only imports still couple the layers.
    layerCase(
      'src/components/HomeView.ts',
      "import type { Article } from '../data/articleTypes'",
      crossLayer,
    ),
    layerCase('src/content/service.ts', "import { t } from '../copy/strings'", crossLayer),
    layerCase('src/data/about.ts', "import { aboutCopy } from '../content/service'", crossLayer),
    layerCase('src/shared/i18n.ts', "import { t } from '../copy/strings'", crossLayer),
    // Re-exports and dynamic imports cross the boundary just the same.
    layerCase('src/copy/strings.ts', "export { articles } from '../data/articles'", crossLayer),
    layerCase('src/copy/strings.ts', "export * from '../data/articles'", crossLayer),
    layerCase(
      'src/components/Comments.tsx',
      "const m = () => import('../content/service')",
      crossLayer,
    ),
    layerCase(
      '/repo/src/shared/assetUrl.ts',
      "import { articles } from '../data/articles'",
      crossLayer,
    ),
  ],
})

astro.run('no-cross-layer-import (astro)', noCrossLayerImport, {
  valid: [
    layerCase(
      'src/pages/x.astro',
      "---\nimport { articlesIn } from '../content/service'\n---\n<p />",
    ),
  ],
  invalid: [
    layerCase(
      'src/pages/x.astro',
      "---\nimport { articles } from '../data/articles'\n---\n<p />",
      crossLayer,
    ),
  ],
})
