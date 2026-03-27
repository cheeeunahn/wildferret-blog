import { useParams, Link } from 'react-router-dom'
import { articles } from '../data/articles'

export default function ArticlePage() {
  const { slug } = useParams()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-32 text-center page-enter">
        <h1 className="text-2xl font-semibold text-ink-900 mb-4">
          글을 찾을 수 없습니다
        </h1>
        <Link to="/" className="text-ink-400 hover:text-ink-700 text-sm underline underline-offset-4">
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  // Parse content into blocks
  const blocks = article.content
    .trim()
    .split('\n\n')
    .filter((b) => b.trim())

  return (
    <div className="page-enter">
      {/* Article Header */}
      <header className="max-w-[720px] mx-auto px-6 pt-16 sm:pt-24 pb-10">
        <div className="animate-reveal">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium text-ink-400 uppercase tracking-widest">
              {article.category}
            </span>
            <span className="w-px h-3 bg-ink-200" />
            <span className="text-xs text-ink-300">{article.date}</span>
            <span className="w-px h-3 bg-ink-200" />
            <span className="text-xs text-ink-300">{article.readTime} 읽기</span>
          </div>

          <h1 className="text-[28px] sm:text-[36px] font-bold text-ink-950 leading-tight tracking-tight mb-3">
            {article.title}
          </h1>
          <p className="text-ink-400 text-base leading-relaxed">
            {article.subtitle}
          </p>
          {article.coverImage && (
            <div className="mt-8">
              <div className="overflow-hidden rounded-2xl border border-ink-100">
                <img
                  src={resolveAssetUrl(article.coverImage)}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
              <p className="mt-3 text-sm text-ink-400 leading-relaxed">
                해당 이미지는 AI로 제작한, 이해를 돕기 위한 예시 이미지입니다.
              </p>
            </div>
          )}
        </div>
      </header>

      <hr className="ink-divider max-w-[720px] mx-auto" />

      {/* Article Body */}
      <article className="max-w-[640px] mx-auto px-6 py-12 prose-blog">
        {blocks.map((block, i) => {
          const trimmed = block.trim()

          if (trimmed === '---') {
            return <hr key={i} className="ink-divider my-10" />
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={i} className="animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                {trimmed.replace('## ', '')}
              </h2>
            )
          }

          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={i} className="animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                {trimmed.replace('> ', '').replace(/^"/, '').replace(/"$/, '')}
              </blockquote>
            )
          }

          if (trimmed.match(/^\d\.\s/)) {
            const items = trimmed.split('\n').map((line) => line.replace(/^\d+\.\s/, ''))
            return (
              <ol key={i} className="list-decimal pl-5 mb-6 space-y-2 text-ink-700 text-[17px] leading-relaxed animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                {items.map((item, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                ))}
              </ol>
            )
          }

          const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
          if (imageMatch) {
            const [, altText, imageSrc] = imageMatch
            return (
              <figure key={i} className="my-8 animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="overflow-hidden rounded-2xl border border-ink-100">
                  <img src={resolveAssetUrl(imageSrc)} alt={altText || article.title} className="w-full h-auto object-cover" loading="lazy" />
                </div>
                <figcaption className="mt-3 text-sm text-ink-400 leading-relaxed">
                  해당 이미지는 AI로 제작한, 이해를 돕기 위한 예시 이미지입니다.
                </figcaption>
              </figure>
            )
          }

          return (
            <p
              key={i}
              className="animate-reveal"
              style={{ animationDelay: `${i * 0.05}s` }}
              dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
            />
          )
        })}
      </article>

      {/* Back link */}
      <div className="max-w-[640px] mx-auto px-6 pb-20">
        <hr className="ink-divider mb-10" />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink-400 no-underline hover:text-ink-700 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

function formatInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.BASE_URL
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}
