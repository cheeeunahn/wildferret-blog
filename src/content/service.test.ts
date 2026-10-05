import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  cardImage: '/assets/images/x-card.webp',
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

// Width × height of a WebP, from its first chunk (VP8X, VP8L or VP8).
function webpSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X')
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8 ')
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  return null
}

describe('card thumbnails', () => {
  // Every post needs one — see the article-thumbnail skill for how to make it.
  it.each(articles.map((a) => [a.slug, a.cardImage] as const))(
    '%s has a square WebP thumbnail at /assets/images/<slug>-card.webp',
    (slug, cardImage) => {
      expect(cardImage).toBe(`/assets/images/${slug}-card.webp`)
      const file = resolve('public', cardImage.slice(1))
      expect(existsSync(file), `${file} is missing`).toBe(true)
      const size = webpSize(readFileSync(file))
      expect(size, `${file} is not a WebP`).not.toBeNull()
      expect(size!.width).toBe(size!.height)
    },
  )
})
