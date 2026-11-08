import { describe, it, expect } from 'vitest'
import { excerptOf, fillPrompt, scanCards, setCardImage } from './card-image.mjs'
import { cardCommitPaths } from './auto-card-image.mjs'

const ARTICLES = `export const articles: Article[] = [
  {
    slug: 'new-post',
    title: '새 글',
    subtitle: '부제',
    date: '2026.11.07',
    readMinutes: 5,
    category: 'Paper Review',
    loadContent: () => import('./article-content/new-post').then(({ c }) => c),
  },
  {
    slug: 'old-post',
    title: '옛 글',
    subtitle: '부제',
    date: '2026.01.01',
    readMinutes: 5,
    category: 'Personal',
    cardImage: '/assets/images/old-post-card.webp',
    loadContent: () => import('./article-content/old-post').then(({ c }) => c),
  },
  /*{
    slug: 'hidden-post',
    category: 'Personal',
  },*/
]
`

describe('scanCards', () => {
  const scanWith = (files) =>
    scanCards(
      () => ARTICLES,
      (rel) => files.includes(rel),
    )

  it('lists entries with no cardImage as pending, ignoring commented-out ones', () => {
    const { pending, done } = scanWith(['public/assets/images/old-post-card.webp'])
    expect(pending).toEqual([{ slug: 'new-post' }])
    expect(done.map((e) => e.slug)).toEqual(['old-post'])
  })

  it('reports a cardImage that points at a missing file', () => {
    const { problems } = scanWith([])
    expect(problems).toHaveLength(1)
    expect(problems[0].slug).toBe('old-post')
  })
})

describe('setCardImage', () => {
  it('adds the line after category, in that entry only', () => {
    const out = setCardImage(ARTICLES, 'new-post')
    expect(out).toContain(
      "    category: 'Paper Review',\n    cardImage: '/assets/images/new-post-card.webp',\n",
    )
    expect(out.match(/cardImage:/g)).toHaveLength(2)
  })

  it('rewrites an existing line instead of adding a second one', () => {
    const out = setCardImage(ARTICLES, 'old-post', '/assets/images/other.webp')
    expect(out).toContain("cardImage: '/assets/images/other.webp',")
    expect(out.match(/cardImage:/g)).toHaveLength(1)
  })

  it('leaves the source alone for an unknown slug', () => {
    expect(setCardImage(ARTICLES, 'nope')).toBe(ARTICLES)
  })
})

describe('excerptOf', () => {
  it('prefers the leading summary block and undoes template escapes', () => {
    const mod = 'export const c = `## 요약\n\n- \\`CLAUDE.md\\` 이야기\n\n---\n\n본문`\n'
    expect(excerptOf(mod)).toBe('- `CLAUDE.md` 이야기')
  })

  it('falls back to the opening of the body, capped', () => {
    const mod = 'export const c = `## 시작\n\n' + '가'.repeat(50) + '`\n'
    expect(excerptOf(mod, 10)).toBe('## 시작\n\n가가가')
  })
})

describe('fillPrompt', () => {
  it('fills known keys and leaves unknown ones visible', () => {
    expect(fillPrompt('{{title}} / {{missing}}', { title: 'T' })).toBe('T / {{missing}}')
  })
})

describe('cardCommitPaths', () => {
  it('stages the index and each slug image', () => {
    expect(cardCommitPaths(['a'])).toEqual([
      'src/data/articles.ts',
      'public/assets/images/a-card.webp',
    ])
  })
})
