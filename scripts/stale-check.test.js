import { describe, it, expect } from 'vitest'
import { reviewable, changedLines, parseReply } from './stale-check.mjs'

describe('reviewable', () => {
  it('keeps code, config and workflow files', () => {
    const files = [
      'src/shared/i18n.ts',
      'src/components/ArticleView.astro',
      'src/components/AiSummary.tsx',
      'src/styles/global.css',
      'scripts/auto-translate.mjs',
      'eslint-rules/index.js',
      '.github/workflows/sync-docs.yml',
      'lefthook.yml',
      'wrangler.jsonc',
    ]
    expect(reviewable(files)).toEqual(files)
  })

  it('skips content, generated files and docs, so the hooks’ own commits never call Claude', () => {
    expect(
      reviewable([
        'src/data/articles.ts',
        'src/data/article-content/new-post.ts',
        'src/data/article-content/en/new-post.ts',
        'src/styles/astryx/wildferret.theme.css',
        'docs/sbom/sbom.cdx.json',
        'docs/docs-sync.snapshot.json',
        'pnpm-lock.yaml',
        'README.md',
        'CLAUDE.md',
        'public/assets/images/cards/new-post.webp',
      ]),
    ).toEqual([])
  })
})

describe('changedLines', () => {
  it('sums added and deleted lines', () => {
    expect(changedLines('10\t2\tsrc/a.ts\n0\t7\tsrc/b.ts\n')).toBe(19)
  })

  it('counts a binary file as nothing', () => {
    expect(changedLines('-\t-\tpublic/x.png\n3\t1\tsrc/a.ts')).toBe(4)
  })

  it('is 0 for an empty diff', () => {
    expect(changedLines('')).toBe(0)
  })
})

describe('parseReply', () => {
  const finding = {
    file: 'src/a.ts',
    line: 3,
    kind: 'stale-comment',
    summary: 'Says 20px; the code uses 16px.',
    fix: 'Say 16px.',
  }
  const reply = (fields) =>
    JSON.stringify({ type: 'result', subtype: 'success', is_error: false, ...fields })

  it('returns the structured findings', () => {
    expect(parseReply(reply({ structured_output: { findings: [finding] } }))).toEqual([finding])
    expect(parseReply(reply({ structured_output: { findings: [] } }))).toEqual([])
  })

  it('returns null for anything it cannot trust, so the commit goes through unchecked', () => {
    expect(parseReply('')).toBeNull()
    expect(parseReply('not json')).toBeNull()
    expect(parseReply(reply({ is_error: true, structured_output: { findings: [] } }))).toBeNull()
    expect(parseReply(reply({ subtype: 'error_max_turns' }))).toBeNull()
    expect(parseReply(reply({ result: 'Nothing stale.' }))).toBeNull()
  })
})
