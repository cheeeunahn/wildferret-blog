export const CATEGORIES = ['Research', 'Personal', 'Conference'] as const

export type Category = (typeof CATEGORIES)[number]

export interface Article {
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  category: Category
  /** Full-width hero on the article page. */
  coverImage?: string
  /** Square thumbnail on the index card only — never rendered in the article. */
  cardImage?: string
  loadContent: () => Promise<string>
}
