/**
 * The content layer: every read of article and about-page data goes through
 * here. It runs at build time, inside getStaticPaths and page frontmatter —
 * there is no request-time server behind it.
 *
 * Presentation (pages, layouts, components) imports from this module, never
 * from src/data directly; src/data holds the data itself and nothing else.
 * `local/no-cross-layer-import` enforces that boundary.
 */

import { about } from '../data/about'
import type { AboutCopy } from '../data/about'
import { articles } from '../data/articles'
import { CATEGORIES } from '../data/articleTypes'
import type { Article, Category, LocalizedArticle, TranslatedLang } from '../data/articleTypes'
import type { Lang } from '../shared/i18n'

export { CATEGORIES }
export type { AboutCopy, Article, Category, LocalizedArticle }

/**
 * Resolve an article into `lang`, or null when it has not been written in that
 * language. Korean always resolves, since it is the base copy.
 */
export function localizeArticle(article: Article, lang: Lang): LocalizedArticle | null {
  const { translations, ...base } = article
  if (lang === 'ko') return { ...base, lang }

  const text = translations?.[lang as TranslatedLang]
  return text ? { ...base, ...text, lang } : null
}

/** Languages this article has been written in, base copy first. */
export function articleLangs(article: Article): Lang[] {
  const translated = Object.keys(article.translations ?? {}) as TranslatedLang[]
  return ['ko', ...translated.filter((l) => !!article.translations?.[l])]
}

/** The index for one language: posts written in it, newest first (source order). */
export function articlesIn(lang: Lang): LocalizedArticle[] {
  return articles
    .map((article) => localizeArticle(article, lang))
    .filter((article): article is LocalizedArticle => article !== null)
}

/** Languages a slug is available in — drives the article page's switcher. */
export function langsForSlug(slug: string): Lang[] {
  const article = articles.find((a) => a.slug === slug)
  return article ? articleLangs(article) : []
}

/** The about page's copy in one language. */
export function aboutCopy(lang: Lang): AboutCopy {
  return about[lang]
}
