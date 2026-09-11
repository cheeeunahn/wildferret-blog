// Language is carried in the URL, never in client state: every page is
// prerendered, so there is nothing to read a preference from at request time.
//
// Three prerendered trees exist:
//   ''    → Korean at the site root (the canonical Korean URLs)
//   '/kr' → the same Korean pages under an explicit prefix
//   '/en' → English
//
// A locale is therefore a (language, url prefix) pair rather than just a
// language — '' and '/kr' are the same language at different URLs, and links
// inside a page have to stay in the prefix the reader arrived through.
import { href, toAppPath } from './siteUrl'

export const LANGS = ['ko', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** The language served at the unprefixed site root. */
export const DEFAULT_LANG: Lang = 'ko'

/**
 * URL segment per language. Korean is 'kr', not its 'ko' language code — the
 * segment is a reader-facing country-style label, and `htmlLang` below keeps
 * the standards-facing code separate.
 */
export const LANG_SEGMENTS = { ko: 'kr', en: 'en' } as const satisfies Record<Lang, string>

/** Value for <html lang>. */
export const HTML_LANGS = { ko: 'ko', en: 'en' } as const satisfies Record<Lang, string>

export interface Locale {
  lang: Lang
  /** '' for the root tree, '/kr' or '/en' for a prefixed one. No trailing slash. */
  prefix: string
}

/** The unprefixed root tree. */
export const ROOT_LOCALE: Locale = { lang: DEFAULT_LANG, prefix: '' }

/** URL segment (the `[lang]` param) → locale, or null if it is not a language. */
export function localeFromSegment(segment: string): Locale | null {
  const lang = LANGS.find((l) => LANG_SEGMENTS[l] === segment)
  return lang ? { lang, prefix: `/${LANG_SEGMENTS[lang]}` } : null
}

/** The `[lang]` params to prerender: every language gets an explicit prefix. */
export const LANG_PARAMS = LANGS.map((lang) => LANG_SEGMENTS[lang])

/** App path ('/about') → href inside this locale's tree, base prefix applied. */
export function localeHref(locale: Locale, path: string): string {
  const clean = `/${path.replace(/^\//, '')}`.replace(/\/+$/, '')
  return href(`${locale.prefix}${clean}` || '/')
}

/**
 * Base-prefixed pathname → the app path with the language segment removed, so
 * '/en/about', '/kr/about' and '/about' all reduce to '/about'. This is what a
 * page hands the layout so the switcher can rebuild the same page in the other
 * language.
 */
export function toLangFreePath(pathname: string): string {
  const appPath = toAppPath(pathname)
  const [, first, ...rest] = appPath.split('/')
  if (!localeFromSegment(first ?? '')) return appPath
  const remainder = rest.join('/')
  return remainder ? `/${remainder}` : '/'
}

/** Nav active state within a locale. Both sides are compared lang-free. */
export function isActiveInLocale(pathname: string, path: string): boolean {
  return toLangFreePath(pathname) === toLangFreePath(path)
}

/**
 * Where the switcher's `lang` button points from `appPath`. Always an explicit
 * prefix, so /en/about ↔ /kr/about round-trips; the unprefixed root tree is a
 * canonical alias readers land on, not a switcher destination.
 */
export function switchLangHref(lang: Lang, appPath: string): string {
  return localeHref({ lang, prefix: `/${LANG_SEGMENTS[lang]}` }, appPath)
}

/**
 * The canonical URL path for a page: Korean canonicalises onto the unprefixed
 * root so '/about' and '/kr/about' are not two competing pages in an index.
 */
export function canonicalPath(lang: Lang, appPath: string): string {
  return lang === DEFAULT_LANG ? href(appPath) : switchLangHref(lang, appPath)
}
