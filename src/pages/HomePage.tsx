import { articles } from '../data/articles'
import ArticleCard from '../components/ArticleCard'

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="max-w-[720px] mx-auto px-6 pt-16 sm:pt-24 pb-12">
        <div className="animate-reveal">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-[0.2em] mb-4">
            Personal Blog
          </p>
          <h1 className="text-3xl sm:text-[40px] font-bold text-ink-950 leading-tight tracking-tight">
            관찰하고, 질문하고, 기록합니다.
            <br />
            유저와 제품과 일상에서
            <br />
            발견한 것들.
          </h1>
        </div>
      </section>

      <hr className="ink-divider max-w-[720px] mx-auto" />

      {/* Article List */}
      <section className="max-w-[720px] mx-auto px-6 pb-20">
        {articles.map((article, i) => (
          <ArticleCard key={article.slug} article={article} index={i} />
        ))}
      </section>
    </div>
  )
}
