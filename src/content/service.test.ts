import { describe, expect, it } from 'vitest'
import { articles } from '../data/articles'
import type { Article } from '../data/articleTypes'
import { aboutCopy, articleLangs, articlesIn, langsForSlug, localizeArticle } from './service'

const post: Article = {
  slug: 'x',
  title: '제목',
  subtitle: '부제',
  date: '2026.01.01',
  readMinutes: 3,
  category: 'Research',
  loadContent: async () => '본문',
  translations: {
    en: { title: 'Title', subtitle: 'Subtitle', loadContent: async () => 'Body' },
  },
}

describe('localizeArticle', () => {
  it('resolves the Korean base copy without the translations block', () => {
    const ko = localizeArticle(post, 'ko')!
    expect(ko.title).toBe('제목')
    expect(ko.lang).toBe('ko')
    expect(ko).not.toHaveProperty('translations')
  })

  it('overlays the translated text and keeps the shared metadata', async () => {
    const en = localizeArticle(post, 'en')!
    expect(en.title).toBe('Title')
    expect(en.readMinutes).toBe(3)
    expect(await en.loadContent()).toBe('Body')
  })

  it('returns null for a language the post was not written in', () => {
    expect(localizeArticle({ ...post, translations: undefined }, 'en')).toBeNull()
  })
})

describe('articleLangs', () => {
  it('lists the base copy first', () => {
    expect(articleLangs(post)).toEqual(['ko', 'en'])
    expect(articleLangs({ ...post, translations: undefined })).toEqual(['ko'])
  })
})

describe('articlesIn', () => {
  it('lists every post in Korean, in source order', () => {
    expect(articlesIn('ko').map((a) => a.slug)).toEqual(articles.map((a) => a.slug))
  })

  it('lists only translated posts in English', () => {
    const translated = articles.filter((a) => a.translations?.en).map((a) => a.slug)
    expect(articlesIn('en').map((a) => a.slug)).toEqual(translated)
  })
})

describe('langsForSlug', () => {
  it('is empty for an unknown slug', () => {
    expect(langsForSlug('no-such-post')).toEqual([])
  })
})

describe('aboutCopy', () => {
  it('has copy for every language', () => {
    expect(aboutCopy('ko').heading).toBeTruthy()
    expect(aboutCopy('en').heading).toBeTruthy()
  })
})
