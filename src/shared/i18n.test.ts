import { describe, expect, it } from 'vitest'
import {
  ROOT_LOCALE,
  canonicalPath,
  isActiveInLocale,
  localeFromSegment,
  localeHref,
  switchLangHref,
  toLangFreePath,
} from './i18n'

const kr = localeFromSegment('kr')!
const en = localeFromSegment('en')!

describe('localeFromSegment', () => {
  it('maps the url segments to languages', () => {
    expect(kr).toEqual({ lang: 'ko', prefix: '/kr' })
    expect(en).toEqual({ lang: 'en', prefix: '/en' })
  })

  it('rejects anything that is not a language segment', () => {
    expect(localeFromSegment('article')).toBeNull()
    expect(localeFromSegment('ko')).toBeNull()
    expect(localeFromSegment('')).toBeNull()
  })
})

describe('localeHref', () => {
  it('leaves the root tree unprefixed', () => {
    expect(localeHref(ROOT_LOCALE, '/')).toBe('/')
    expect(localeHref(ROOT_LOCALE, '/about')).toBe('/about')
  })

  it('keeps a reader inside the tree they arrived through', () => {
    expect(localeHref(kr, '/')).toBe('/kr')
    expect(localeHref(en, '/about')).toBe('/en/about')
    expect(localeHref(en, '/article/some-slug')).toBe('/en/article/some-slug')
  })

  it('normalises a path given without a leading slash or with a trailing one', () => {
    expect(localeHref(en, 'about')).toBe('/en/about')
    expect(localeHref(en, '/about/')).toBe('/en/about')
  })
})

describe('toLangFreePath', () => {
  it('reduces the same page in all three trees to one identity', () => {
    expect(toLangFreePath('/about')).toBe('/about')
    expect(toLangFreePath('/kr/about')).toBe('/about')
    expect(toLangFreePath('/en/about')).toBe('/about')
  })

  it('reduces each tree root to /', () => {
    expect(toLangFreePath('/')).toBe('/')
    expect(toLangFreePath('/kr')).toBe('/')
    expect(toLangFreePath('/en/')).toBe('/')
  })

  it('leaves a non-language first segment alone', () => {
    expect(toLangFreePath('/article/some-slug')).toBe('/article/some-slug')
  })
})

describe('isActiveInLocale', () => {
  it('marks the nav item active in every tree', () => {
    expect(isActiveInLocale('/en/about', '/about')).toBe(true)
    expect(isActiveInLocale('/kr/about', '/about')).toBe(true)
    expect(isActiveInLocale('/en', '/')).toBe(true)
    expect(isActiveInLocale('/en/about', '/')).toBe(false)
  })
})

describe('switchLangHref', () => {
  it('always produces an explicit prefix, so the two trees round-trip', () => {
    expect(switchLangHref('en', '/about')).toBe('/en/about')
    expect(switchLangHref('ko', '/about')).toBe('/kr/about')
    expect(switchLangHref('ko', '/')).toBe('/kr')
  })
})

describe('canonicalPath', () => {
  it('canonicalises Korean onto the unprefixed root', () => {
    expect(canonicalPath('ko', '/about')).toBe('/about')
    expect(canonicalPath('ko', '/')).toBe('/')
  })

  it('leaves English on its own prefix', () => {
    expect(canonicalPath('en', '/about')).toBe('/en/about')
  })
})
