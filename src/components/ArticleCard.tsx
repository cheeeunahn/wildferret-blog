import { Link } from 'react-router-dom'
import type { Article } from '../data/articleTypes'

interface ArticleCardProps {
  article: Article
  index: number
}

export default function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block no-underline animate-reveal"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <article className="py-8 sm:py-10 border-b border-ink-100 transition-colors hover:bg-ink-50/50 -mx-6 px-6">
        {/* Category & Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium text-ink-400 uppercase tracking-widest">
            {article.category}
          </span>
          <span className="w-px h-3 bg-ink-200" />
          <span className="text-xs text-ink-300">
            {article.date}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-[22px] font-semibold text-ink-900 leading-snug tracking-tight mb-2 group-hover:text-ink-600 transition-colors">
          {article.title}
        </h2>

        {/* Subtitle */}
        <p className="text-[15px] text-ink-400 leading-relaxed line-clamp-2">
          {article.subtitle}
        </p>

        {/* Read time */}
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-300">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {article.readTime} 읽기
        </div>
      </article>
    </Link>
  )
}
