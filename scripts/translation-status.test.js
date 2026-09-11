import { describe, it, expect } from 'vitest'
import { scan } from './translation-status.mjs'

/** Build a fake repo: articles.ts source plus the set of files that exist. */
function fixture(articlesSource, files = {}) {
  const read = (rel) => {
    if (rel === 'src/data/articles.ts') return articlesSource
    if (rel in files) return files[rel]
    throw new Error(`unexpected read: ${rel}`)
  }
  return scan(read, (rel) => rel in files || rel === 'src/data/articles.ts')
}

const KO = 'src/data/article-content'

const entry = (slug, translations = '') => `
  {
    slug: '${slug}',
    title: '제목',
    subtitle: '부제',
    date: '2026.01.01',
    readMinutes: 5,
    category: 'Personal',
    loadContent: () => import('./article-content/${slug}').then(({ x }) => x),${translations}
  },`

const enBlock = (slug, exportName) => `
    translations: {
      en: {
        title: 'Title',
        subtitle: 'Subtitle',
        loadContent: () => import('./article-content/en/${slug}').then(({ ${exportName} }) => ${exportName}),
      },
    },`

describe('translation status scan', () => {
  it('reports an article with no translations block as pending', () => {
    const result = fixture(entry('fresh-post'), { [`${KO}/fresh-post.ts`]: '' })
    expect(result.pending.map((p) => p.slug)).toEqual(['fresh-post'])
    expect(result.pending[0].enFile).toBe(`${KO}/en/fresh-post.ts`)
    expect(result.problems).toEqual([])
  })

  it('reports a wired-up translation as translated', () => {
    const result = fixture(entry('done', enBlock('done', 'doneContentEn')), {
      [`${KO}/done.ts`]: '',
      [`${KO}/en/done.ts`]: 'export const doneContentEn = `hi`',
    })
    expect(result.translated.map((t) => t.slug)).toEqual(['done'])
    expect(result.pending).toEqual([])
    expect(result.problems).toEqual([])
  })

  it('ignores commented-out entries', () => {
    const result = fixture(`const articles = [${entry('live')}\n/*${entry('retired')}*/\n]`, {
      [`${KO}/live.ts`]: '',
    })
    expect(result.pending.map((p) => p.slug)).toEqual(['live'])
  })

  it('flags an en file that articles.ts never references', () => {
    const result = fixture(entry('orphan'), {
      [`${KO}/orphan.ts`]: '',
      [`${KO}/en/orphan.ts`]: 'export const orphanContentEn = ``',
    })
    // Still pending — nothing renders the file — but the stray file is called out.
    expect(result.pending.map((p) => p.slug)).toEqual(['orphan'])
    expect(result.problems[0].problem).toMatch(/no translations.en block/)
  })

  it('flags a translations block pointing at a missing file', () => {
    const result = fixture(entry('broken', enBlock('broken', 'brokenContentEn')), {
      [`${KO}/broken.ts`]: '',
    })
    expect(result.problems[0].problem).toMatch(/does not exist/)
  })

  it('flags a mismatched export name, which would fail the build', () => {
    const result = fixture(entry('typo', enBlock('typo', 'typoContentEn')), {
      [`${KO}/typo.ts`]: '',
      [`${KO}/en/typo.ts`]: 'export const typoContent = `hi`',
    })
    expect(result.problems[0].problem).toMatch(/does not export typoContentEn/)
  })
})
