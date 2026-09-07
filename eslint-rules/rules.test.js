import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import * as astroParser from 'astro-eslint-parser'
import { describe, it } from 'vitest'

import noBareInternalHref from './no-bare-internal-href.js'
import noInteractiveDiagrams from './no-interactive-diagrams.js'
import noRawColors from './no-raw-colors.js'
import noUnescapedUserHtml from './no-unescaped-user-html.js'
import noUnlistedIsland from './no-unlisted-island.js'

// RuleTester drives mocha-style globals; vitest supplies compatible ones.
RuleTester.describe = describe
RuleTester.it = it

/** Rules run against .tsx (Diagrams.tsx, ThemeToggle.tsx). */
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
const astroCase = (code, errors) => ({ filename: 'src/pages/x.astro', code, ...(errors ? { errors } : {}) })

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
      code: "export const content = `See [the post](/wildferret-blog/article/x).`",
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

tsx.run('no-interactive-diagrams', noInteractiveDiagrams, {
  valid: [
    // The real shape of every current diagram: static JSX, currentColor SVGs.
    'const D = () => <svg className="text-ink-500"><line stroke="currentColor" /></svg>',
    'const D = () => <div>{steps.map((s) => <span key={s.n}>{s.title}</span>)}</div>',
    'const user = getUser()',
  ],
  invalid: [
    {
      code: 'const D = () => { const [n] = useState(0); return <div>{n}</div> }',
      errors: [{ messageId: 'hook', data: { name: 'useState' } }],
    },
    {
      code: 'const D = () => { React.useEffect(() => {}); return <div /> }',
      errors: [{ messageId: 'hook' }],
    },
    {
      code: 'const D = () => <button onClick={go}>x</button>',
      errors: [{ messageId: 'handler', data: { name: 'onClick' } }],
    },
  ],
})

astro.run('no-unlisted-island', noUnlistedIsland, {
  valid: [
    astroCase('<ThemeToggle client:only="react" />'),
    astroCase('<Diagram />'),
    astroCase('<div class="animate-reveal"><Diagram /></div>'),
  ],
  invalid: [
    astroCase('<Diagram client:load />', [{ messageId: 'unlisted' }]),
    astroCase('<ArticleCard client:visible />', [{ messageId: 'unlisted' }]),
  ],
})

astro.run('no-unlisted-island (with the Comments island allowed)', noUnlistedIsland, {
  valid: [{ ...astroCase('<Comments client:visible articleSlug={s} />'), options: [{ allow: ['ThemeToggle', 'Comments'] }] }],
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
    { code: 'const C = ({ c }) => <span title={c.nickname}>{c.nickname}</span>', filename: 'src/components/Comments.tsx' },
    // The parser's own module and tests import it legitimately; only
    // components are barred.
    { code: "import { formatInline } from './articleContent'", filename: 'src/lib/articleContent.test.ts' },
    { code: "import { splitContentIntoBlocks } from '../lib/articleContent'", filename: 'src/components/Comments.tsx' },
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
      code: "import { formatInline } from '../lib/articleContent'",
      filename: 'src/components/Comments.tsx',
      errors: [{ messageId: 'formatInline' }],
    },
  ],
})

tsx.run('no-raw-colors (tsx)', noRawColors, {
  valid: [
    'const a = <div className="bg-paper-warm/30 border border-ink-100" />',
    'const a = <span className="text-[12px] text-ink-600" />',
    'const a = <line stroke="currentColor" fill="none" />',
    // ink-500 must survive: a bare `[a-z]+-\\d{3}` check would eat it.
    'const a = <svg className="text-ink-500 shrink-0 mx-1" />',
    'const a = <div className="grid grid-cols-2 gap-3" />',
  ],
  invalid: [
    {
      code: 'const a = <div className="text-slate-500" />',
      errors: [{ messageId: 'palette', data: { cls: 'text-slate-500' } }],
    },
    {
      // Variants and an opacity suffix are stripped before matching.
      code: 'const a = <div className="hover:bg-blue-600/30" />',
      errors: [{ messageId: 'palette' }],
    },
    {
      code: 'const a = <div className={`p-2 ${x} border-red-200`} />',
      errors: [{ messageId: 'palette' }],
    },
    {
      code: 'const a = <rect fill="#1d2023" />',
      errors: [{ messageId: 'literal', data: { value: '#1d2023' } }],
    },
    {
      code: 'const a = <div style="color: rgb(0 0 0)" />',
      errors: [{ messageId: 'literal' }],
    },
  ],
})

astro.run('no-raw-colors (astro)', noRawColors, {
  valid: [astroCase('<div class="bg-surface text-ink-900" />')],
  invalid: [astroCase('<div class="bg-zinc-800" />', [{ messageId: 'palette' }])],
})
