import { useParams, Link } from 'react-router-dom'
import { articles } from '../data/articles'
import { getDiagram } from '../components/Diagrams'

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

  const blocks = splitContentIntoBlocks(article.content)

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

          const diagramMatch = trimmed.match(/^\[diagram:(.+)\]$/)
          if (diagramMatch) {
            const DiagramComponent = getDiagram(diagramMatch[1])
            if (DiagramComponent) {
              return (
                <div key={i} className="animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                  <DiagramComponent />
                </div>
              )
            }
          }

          if (trimmed.startsWith('~~~')) {
            const codeLines = trimmed.split('\n')
            const langMatch = codeLines[0].match(/^~~~(\w+)?$/)
            const lang = langMatch?.[1] || ''
            const code = codeLines.slice(1, codeLines.length - 1).join('\n')
            const langLabels: Record<string, string> = { bash: 'Terminal', json: 'JSON', js: 'JavaScript', ts: 'TypeScript' }
            const label = langLabels[lang] || (lang ? lang : '')
            return (
              <div key={i} className="my-6 rounded-xl border border-ink-100 overflow-hidden animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-ink-100 bg-ink-50/60">
                  <div className="w-[7px] h-[7px] rounded-full border border-ink-300/70" />
                  <div className="w-[7px] h-[7px] rounded-full border border-ink-300/70" />
                  <div className="w-[7px] h-[7px] rounded-full border border-ink-300/70" />
                  {label && <span className="ml-2 text-[11px] text-ink-400">{label}</span>}
                </div>
                <pre className="px-4 py-3 bg-paper-warm/40 overflow-x-auto">
                  <code className="text-[13px] text-ink-600 leading-relaxed whitespace-pre block font-mono">{code}</code>
                </pre>
              </div>
            )
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={i} className="text-lg font-semibold text-ink-900 mt-8 mb-4 animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                {trimmed.replace('### ', '')}
              </h3>
            )
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
              <blockquote key={i} className="animate-reveal" style={{ animationDelay: `${i * 0.05}s` }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('> ', '').replace(/^"/, '').replace(/"$/, '')) }} />
            )
          }

          if (trimmed.startsWith('- ')) {
            const items = trimmed.split('\n').filter((l: string) => l.trim().startsWith('- ')).map((l: string) => l.replace(/^-\s+/, ''))
            return (
              <ul key={i} className="list-disc pl-5 mb-6 space-y-2 text-ink-700 text-[17px] leading-relaxed animate-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                {items.map((item: string, j: number) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                ))}
              </ul>
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
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-ink-600 underline underline-offset-4 decoration-ink-200 hover:text-ink-900 hover:decoration-ink-400 transition-colors">$1</a>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-ink-50 rounded text-[14px] font-mono text-ink-600">$1</code>')
}

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.BASE_URL
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}

function splitContentIntoBlocks(content: string): string[] {
  const blocks: string[] = []
  const lines = content.trim().split('\n')
  let buffer = ''
  let inCode = false

  for (const line of lines) {
    if (line.trim().startsWith('~~~')) {
      if (inCode) {
        buffer += '\n' + line
        blocks.push(buffer.trim())
        buffer = ''
        inCode = false
      } else {
        if (buffer.trim()) {
          buffer.trim().split('\n\n').filter((b) => b.trim()).forEach((b) => blocks.push(b))
        }
        buffer = line
        inCode = true
      }
    } else {
      buffer += (buffer ? '\n' : '') + line
    }
  }

  if (buffer.trim()) {
    if (inCode) {
      blocks.push(buffer.trim())
    } else {
      buffer.trim().split('\n\n').filter((b) => b.trim()).forEach((b) => blocks.push(b))
    }
  }

  return blocks
}
