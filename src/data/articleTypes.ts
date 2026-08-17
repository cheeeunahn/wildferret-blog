export interface Article {
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  coverImage?: string
  loadContent: () => Promise<string>
}
