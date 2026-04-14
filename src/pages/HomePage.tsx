import { articles } from '../data/articles'
import ArticleCard from '../components/ArticleCard'

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="max-w-[720px] mx-auto px-6 pt-10 sm:pt-14 pb-12">
        <div className="animate-reveal">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-[0.2em] mb-4">
            Personal Blog
          </p>
          <h1 className="text-3xl sm:text-[40px] font-bold text-ink-950 leading-tight tracking-tight">
            프로덕트와 일상에서
            <br />
            발견한 것들.
          </h1>
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100 bg-paper-warm/30">
            <img
              src={`${import.meta.env.BASE_URL}pm-hero-workspace.png`}
              alt="PM workspace illustration with VOC dashboard and kanban board"
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>
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
