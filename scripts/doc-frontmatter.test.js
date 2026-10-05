import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { check, governedFiles, kindOf, readFrontmatter } from './doc-frontmatter.mjs'

const doc = (fm, h1 = 'ADR 0009: Thing') => `---\n${fm}\n---\n\n# ${h1}\n\nBody.\n`
const good = "title: 'ADR 0009: Thing'\nstatus: Accepted\ndate: 2026-10-06"

describe('kindOf', () => {
  it('governs docs and skills only', () => {
    expect(kindOf('docs/adr/0001-x.md')).toBe('doc')
    expect(kindOf('.claude/skills/article-thumbnail/SKILL.md')).toBe('skill')
    expect(kindOf('README.md')).toBeNull()
    expect(kindOf('CLAUDE.md')).toBeNull()
    expect(kindOf('.github/pull_request_template.md')).toBeNull()
  })
})

describe('readFrontmatter', () => {
  it('reads quoted and bare scalars, and returns the body after the block', () => {
    const fm = readFrontmatter(doc(good))
    expect(fm.fields).toEqual({ title: 'ADR 0009: Thing', status: 'Accepted', date: '2026-10-06' })
    expect(fm.body.trimStart().startsWith('# ADR 0009')).toBe(true)
  })

  it('is null when the file does not open with ---', () => {
    expect(readFrontmatter('# Title\n\n---\n')).toBeNull()
  })
})

describe('check', () => {
  it('passes a complete doc', () => {
    expect(check('docs/adr/0009-thing.md', doc(good))).toEqual([])
  })

  it('rejects a doc with no frontmatter', () => {
    expect(check('docs/adr/0009-thing.md', '# ADR 0009: Thing\n')).toEqual([
      'missing frontmatter (the file must open with a --- block)',
    ])
  })

  it('reports each missing doc field', () => {
    expect(check('docs/x.md', doc('title: ADR 0009: Thing'))).toEqual([
      'missing `status`',
      'missing `date`',
    ])
  })

  it('rejects an unknown status, a bad date, and a title that drifted from the H1', () => {
    const problems = check(
      'docs/x.md',
      doc('title: Old name\nstatus: Done\ndate: 2026.10.06', 'New name'),
    )
    expect(problems).toHaveLength(3)
  })

  it('requires name = folder and a description on skills', () => {
    expect(check('.claude/skills/foo/SKILL.md', '---\nname: foo\n---\n')).toEqual([
      'missing `description`',
    ])
    expect(check('.claude/skills/foo/SKILL.md', '---\nname: bar\ndescription: d\n---\n')).toEqual([
      '`name` must be the folder name "foo"',
    ])
  })

  it('ignores exempt files', () => {
    expect(check('README.md', '# wildferret-blog\n')).toEqual([])
  })
})

describe('repo docs', () => {
  it.each(governedFiles())('%s has valid frontmatter', (rel) => {
    expect(check(rel, readFileSync(rel, 'utf8'))).toEqual([])
  })
})
