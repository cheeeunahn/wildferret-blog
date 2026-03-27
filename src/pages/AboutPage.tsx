export default function AboutPage() {
  const profileImageUrl = resolveAssetUrl('/profile-aksae.png')

  return (
    <div className="page-enter">
      <section className="max-w-[640px] mx-auto px-6 pt-16 sm:pt-24 pb-20">
        {/* Profile */}
        <div className="animate-reveal mb-12">
          <div className="w-20 h-20 rounded-full border border-ink-200 overflow-hidden mb-6">
            <img
              src={profileImageUrl}
              alt="wildferret 프로필 이미지"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight mb-3">
            안녕하세요, wildferret입니다
          </h1>
          <p className="text-ink-400 text-[15px] leading-relaxed">
            제품을 만들고, 사용자를 연구합니다.
          </p>
        </div>

        <hr className="ink-divider mb-12" />

        {/* Bio */}
        <div className="prose-blog animate-reveal delay-1">
          <p>
            핀테크 스타트업 유저 리서치 기반 PM/기획자. 리서치로 묻고, 데이터로 확인하고, 필요하면 직접 만듭니다.
          </p>
          <p>
            유저의 목소리를 듣는 일과 제품을 만드는 일 사이 어딘가에 서 있습니다.
          </p>
          <p>
            진행 중인 생각들을 기록합니다.
          </p>
        </div>

        <hr className="ink-divider my-12" />

        {/* Interests */}
        <div className="animate-reveal delay-2">
          <h2 className="text-sm font-medium text-ink-400 uppercase tracking-widest mb-6">
            관심사
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Product Management',
              'UX Research',
              'Design Systems',
              'Data-driven Decision',
              'Writing',
              'Reading',
              'Side Projects',
            ].map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 text-xs text-ink-500 border border-ink-200 rounded-full hover:bg-ink-50 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <hr className="ink-divider my-12" />

      </section>
    </div>
  )
}

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.BASE_URL
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}
