import { describe, it, expect } from 'vitest'
import {
  BLOCK_NOTE,
  diffFingerprints,
  fingerprint,
  islandAllowlist,
  islandDirectives,
  parseCommandLines,
  parseIslandRows,
  parseScriptRows,
  parseTreeNotes,
  readBlock,
  regenerate,
  renderCommandLines,
  renderIslandsTable,
  renderScriptsTable,
  renderTree,
  replaceBlock,
  status,
} from './docs-sync.mjs'
import { plan } from './auto-sync-docs.mjs'

const block = (name, body) => `<!-- docs:${name}:start -->\n${body}\n<!-- docs:${name}:end -->`

describe('blocks', () => {
  it('reads and replaces the text between markers, leaving the rest alone', () => {
    const doc = `# Title\n\n${block('x', 'old')}\n\nafter\n`
    expect(readBlock(doc, 'x').trim()).toBe('old')
    const next = replaceBlock(doc, 'x', 'new')
    expect(next).toBe(`# Title\n\n${block('x', `${BLOCK_NOTE}\nnew`)}\n\nafter\n`)
    expect(readBlock(next, 'x')).toContain('new')
  })

  it('reports a missing block as null, and refuses to replace one', () => {
    expect(readBlock('no markers', 'x')).toBeNull()
    expect(() => replaceBlock('no markers', 'x', 'y')).toThrow()
  })
})

describe('project tree', () => {
  const roots = [
    { root: 'src', exclude: [/\.test\.ts$/], collapse: ['src/data/article-content'] },
    { root: 'scripts', collapse: ['scripts'] },
  ]
  const files = [
    'src/pages/api/comments.ts',
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/layouts/Base.astro',
    'src/shared/i18n.ts',
    'src/shared/i18n.test.ts',
    'src/data/article-content/post.ts',
    'src/data/article-content/en/post.ts',
    'src/data/articles.ts',
    'scripts/a.mjs',
  ]

  it('lists dirs before files, folds single-child dirs, collapses and excludes', () => {
    const { body } = renderTree(files, new Map(), roots)
    expect(body).toBe(
      [
        '```',
        'src/',
        '├── data/',
        '│   ├── article-content/',
        '│   └── articles.ts',
        '├── layouts/Base.astro',
        '├── pages/',
        '│   ├── api/comments.ts',
        '│   ├── about.astro',
        '│   └── index.astro',
        '└── shared/i18n.ts',
        'scripts/',
        '```',
      ].join('\n'),
    )
  })

  it('keeps notes by path across a rebuild, and flags only leaves without one', () => {
    const notes = new Map([
      ['src/layouts/Base.astro', 'The shell'],
      ['src/data/article-content', 'Bodies'],
      ['scripts', 'Tooling'],
    ])
    const first = renderTree(files, notes, roots)
    // Notes align one column past the longest line.
    expect(first.body).toContain('├── layouts/Base.astro    # The shell')
    expect(first.body).toContain('│   ├── article-content/  # Bodies')
    // Directories that only group children (src/, pages/) need no note.
    expect(first.unnoted).toEqual([
      'src/data/articles.ts',
      'src/pages/api/comments.ts',
      'src/pages/about.astro',
      'src/pages/index.astro',
      'src/shared/i18n.ts',
    ])
    // Reading the rendered tree back yields the same notes: a rebuild is stable.
    const reread = parseTreeNotes(first.body)
    expect(Object.fromEntries(reread)).toEqual(Object.fromEntries(notes))
    expect(renderTree(files, reread, roots).body).toBe(first.body)
  })

  it('drops the note of a file that is gone, and adds a new file unnoted', () => {
    const notes = new Map([['src/shared/i18n.ts', 'Locales']])
    const moved = files.map((f) => (f === 'src/shared/i18n.ts' ? 'src/shared/lang.ts' : f))
    const { body, unnoted } = renderTree(moved, notes, roots)
    expect(body).not.toContain('Locales')
    expect(unnoted).toContain('src/shared/lang.ts')
  })

  it('reads a note written against an old `name/…` spelling', () => {
    const notes = parseTreeNotes(
      ['src/', '└── pages/', '    └── [lang]/…   # Other languages'].join('\n'),
    )
    expect(notes.get('src/pages/[lang]')).toBe('Other languages')
  })
})

describe('scripts', () => {
  const table = [
    '| Command | Description |',
    '| --- | --- |',
    '| `pnpm dev` | Dev server |',
    '| `pnpm astryx component X` | Component docs |',
    '| `pnpm gone` | Removed script |',
  ].join('\n')

  it('keeps descriptions and usage, follows package.json order, hides prepare', () => {
    const rows = parseScriptRows(table)
    const { body, unnoted } = renderScriptsTable(['astryx', 'dev', 'prepare', 'fresh'], rows)
    expect(body.split('\n').slice(2)).toEqual([
      '| `pnpm astryx component X` | Component docs |',
      '| `pnpm dev` | Dev server |',
      '| `pnpm fresh` |  |',
    ])
    expect(unnoted).toEqual(['fresh'])
  })

  it('does the same for the CLAUDE.md command list, aligning the comments', () => {
    const rows = parseCommandLines(
      ['```bash', 'pnpm dev    # dev server', 'pnpm astryx component <Name>  # docs', '```'].join(
        '\n',
      ),
    )
    expect(rows.get('astryx')).toEqual({ usage: 'component <Name>', description: 'docs' })
    const { body, unnoted } = renderCommandLines(['dev', 'astryx', 'new'], rows)
    expect(body).toBe(
      [
        '```bash',
        'pnpm dev                      # dev server',
        'pnpm astryx component <Name>  # docs',
        'pnpm new',
        '```',
      ].join('\n'),
    )
    expect(unnoted).toEqual(['new'])
  })
})

describe('islands', () => {
  const eslint = `rules: { 'local/no-unlisted-island': ['error', { allow: ['ThemeToggle', 'Comments'] }] }`

  it('reads the allowlist from eslint.config.js', () => {
    expect(islandAllowlist(eslint)).toEqual(['ThemeToggle', 'Comments'])
    expect(islandAllowlist('nothing here')).toBeNull()
  })

  it('finds each island’s directive, across lines and files', () => {
    const astro = [
      '<ThemeToggle\n  client:only="react"\n  toLight={a}\n/>',
      '<Comments client:visible slug={s} />',
    ]
    const found = islandDirectives(['ThemeToggle', 'Comments', 'Unused'], astro)
    expect(Object.fromEntries(found)).toEqual({
      ThemeToggle: ['client:only'],
      Comments: ['client:visible'],
      Unused: [],
    })
  })

  it('keeps the why per island and flags a new one', () => {
    const whys = parseIslandRows(
      '| Island | Hydration | Why |\n| --- | --- | --- |\n| `Comments` | `client:load` | Loads late |',
    )
    const directives = new Map([
      ['Comments', ['client:visible']],
      ['Fresh', []],
    ])
    const { body, unnoted } = renderIslandsTable(directives, whys)
    expect(body).toContain('| `Comments` | `client:visible` | Loads late |')
    expect(body).toContain('| `Fresh` | (not mounted) |  |')
    expect(unnoted).toEqual(['Fresh'])
  })
})

describe('fingerprint', () => {
  const repo = {
    files: [
      'src/a.ts',
      'src/data/article-content/post.ts',
      'public/assets/images/x.webp',
      'README.md',
    ],
    pkg: {
      scripts: { dev: 'x', build: 'y' },
      dependencies: { react: '1' },
      devDependencies: { vitest: '1' },
    },
    islands: new Map([['Comments', ['client:visible']]]),
    hostSources: ['<link href="https://cdn.jsdelivr.net/x">', 'font-src https://CDN.jsdelivr.net'],
  }

  it('records only structure, sorted and de-duplicated', () => {
    expect(fingerprint(repo)).toEqual({
      files: ['src/a.ts'], // article bodies, assets and the docs themselves are ignored
      scripts: ['build', 'dev'],
      dependencies: ['react', 'vitest'],
      islands: ['Comments client:visible'],
      hosts: ['cdn.jsdelivr.net'],
    })
  })

  it('diffs two fingerprints into added/removed, omitting unchanged lists', () => {
    const before = fingerprint(repo)
    const after = { ...before, files: ['src/b.ts'], scripts: [...before.scripts, 'sbom'] }
    expect(diffFingerprints(before, after)).toEqual({
      files: { added: ['src/b.ts'], removed: ['src/a.ts'] },
      scripts: { added: ['sbom'], removed: [] },
    })
    expect(diffFingerprints(before, before)).toEqual({})
  })

  it('treats a missing snapshot as everything added', () => {
    expect(diffFingerprints(null, { files: ['a'] })).toEqual({
      files: { added: ['a'], removed: [] },
    })
  })
})

describe('status', () => {
  const identity = async (text) => text
  const repoWith = (docs, snapshot) => ({
    files: ['scripts/a.mjs'],
    pkg: { scripts: { dev: 'x' } },
    islands: new Map(),
    hostSources: [],
    docs,
    snapshot,
  })
  const readme = (rows) =>
    `${block('scripts', rows)}\n${block('layout', '')}\n${block('islands', '')}\n`
  const claude = block('commands', '```bash\npnpm dev  # dev server\n```')

  it('reports a missing block as a problem rather than throwing', () => {
    const { problems } = regenerate(repoWith({ 'README.md': '', 'CLAUDE.md': claude }, null))
    expect(problems).toContain('README.md has no docs:scripts block')
  })

  it('is clean once the docs are rebuilt and the shape accepted', async () => {
    const draft = repoWith(
      { 'README.md': readme('| `pnpm dev` | Dev server |'), 'CLAUDE.md': claude },
      null,
    )
    const first = await status(draft, identity)
    expect(first.stale.length).toBeGreaterThan(0)
    expect(plan(first)).toBe('review') // no snapshot yet: everything is a change

    const rebuilt = { ...draft, docs: first.formatted }
    const accepted = { ...rebuilt, snapshot: fingerprint(rebuilt) }
    const second = await status(accepted, identity)
    expect(second.stale).toEqual([])
    expect(second.changes).toEqual({})
    // The tree root `scripts/` and the island list are unnoted in this toy repo.
    expect(plan({ ...second, unnoted: [] })).toBe('none')
    expect(plan({ ...second, unnoted: [], stale: ['README.md'] })).toBe('rebuild')
  })
})
