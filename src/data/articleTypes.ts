import type { Lang } from '../shared/i18n'

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
