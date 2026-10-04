import { describe, it, expect } from 'vitest'
import { touchesKoreanArticles, slugsToTranslate } from './auto-translate.mjs'

describe('touchesKoreanArticles', () => {
  it('fires on a Korean body or articles.ts', () => {
    expect(touchesKoreanArticles(['src/data/article-content/new-post.ts'])).toBe(true)
    expect(touchesKoreanArticles(['README.md', 'src/data/articles.ts'])).toBe(true)
  })

  it('ignores English bodies, so the translation commit cannot retrigger it', () => {
    expect(touchesKoreanArticles(['src/data/article-content/en/new-post.ts'])).toBe(false)
  })

  it('ignores everything else', () => {
    expect(touchesKoreanArticles(['src/data/article-content/README.md', 'src/lib/i18n.ts'])).toBe(
      false,
    )
    expect(touchesKoreanArticles([''])).toBe(false)
  })
})

describe('slugsToTranslate', () => {
  it('merges pending and problems without duplicates', () => {
    expect(
      slugsToTranslate({
        pending: [{ slug: 'a' }, { slug: 'b' }],
        problems: [{ slug: 'b' }, { slug: 'c' }],
      }),
    ).toEqual(['a', 'b', 'c'])
  })

  it('is empty when nothing needs work', () => {
    expect(slugsToTranslate({ pending: [], problems: [] })).toEqual([])
  })
})
