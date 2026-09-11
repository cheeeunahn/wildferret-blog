import type { Lang } from '../lib/i18n'

export const CATEGORIES = ['Research', 'Personal', 'Conference'] as const

export type Category = (typeof CATEGORIES)[number]

/** The part of an article that is written in one particular language. */
export interface ArticleText {
  title: string
  subtitle: string
  loadContent: () => Promise<string>
}

/** Languages an article can be translated into. Korean is the base copy. */
export type TranslatedLang = Exclude<Lang, 'ko'>

export interface Article extends ArticleText {
  slug: string
  date: string
  /** Whole minutes. Rendered per language — never store "12분" here. */
  readMinutes: number
  category: Category
  /** Full-width hero on the article page. */
  coverImage?: string
  /** Square thumbnail on the index card only — never rendered in the article. */
  cardImage?: string
  /**
   * Written versions in other languages. Absent means the post has no version
   * in that language yet: it is left out of that language's index and its
   * article route is not generated, rather than shown as untranslated Korean.
   */
  translations?: Partial<Record<TranslatedLang, ArticleText>>
}

/** An article resolved to one language — what every template actually renders. */
export type LocalizedArticle = Omit<Article, 'translations'> & { lang: Lang }

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
