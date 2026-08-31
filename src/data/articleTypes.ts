export const CATEGORIES = ['Research', 'Personal'] as const

export type Category = (typeof CATEGORIES)[number]

export interface Article {
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  category: Category
  coverImage?: string
  loadContent: () => Promise<string>
}
