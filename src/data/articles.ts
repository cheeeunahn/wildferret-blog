// Article metadata, newest first. Pure data: the queries over it (per-language
// index, available languages) live in src/content/service.ts.
import type { Article } from './articleTypes'

export const articles: Article[] = [
  {
    slug: 'optimizing-claude-md',
    title: 'CLAUDE.md에는 무엇을 적어야 할까',
    subtitle: 'AGENTS.md·CLAUDE.md에 관한 최근 논문 여섯 편을 읽고 든 생각',
    date: '2026.11.07',
    readMinutes: 16,
    category: 'Research',
    cardImage: '/assets/images/optimizing-claude-md-card.webp',
    loadContent: () =>
      import('./article-content/optimizing-claude-md').then(
        ({ optimizingClaudeMdContent }) => optimizingClaudeMdContent,
      ),
    translations: {
      en: {
        title: 'Your CLAUDE.md outranks your code',
        subtitle:
          'How to write AGENTS.md and CLAUDE.md, from six papers on agent instruction files',
        loadContent: () =>
          import('./article-content/en/optimizing-claude-md').then(
            ({ optimizingClaudeMdContentEn }) => optimizingClaudeMdContentEn,
          ),
      },
    },
  },
  {
    slug: 'synthetic-user-reading',
    title: '합성 유저(synthetic user)는 실제 사람을 대상으로 하는 유저 리서치를 대체할 수 있을까',
    subtitle: '가상 유저 리서치 패널 만드는 김에 조사하고 읽어본 합성 유저 문헌들',
    date: '2026.09.01',
    readMinutes: 12,
    category: 'Research',
    cardImage: '/assets/images/synthetic-user-reading-card.webp',
    loadContent: () =>
      import('./article-content/synthetic-user-reading').then(
        ({ syntheticUserReadingContent }) => syntheticUserReadingContent,
      ),
    translations: {
      en: {
        title: 'Can synthetic users replace user research with real people?',
        subtitle:
          'The synthetic user literature I went looking for while building a virtual research panel',
        loadContent: () =>
          import('./article-content/en/synthetic-user-reading').then(
            ({ syntheticUserReadingContentEn }) => syntheticUserReadingContentEn,
          ),
      },
    },
  },
  {
    slug: 'mgs-2026-play-hall',
    title: 'MGS 2026에서 들은 5가지 세션 요약해보기',
    subtitle:
      '구독 결제, AI가 인용하는 브랜드, 게임 마케팅, 가상자산 광고, 그리고 AI로 일하는 방식',
    date: '2026.08.18',
    readMinutes: 12,
    category: 'Conference',
    cardImage: '/assets/images/mgs-2026-play-hall-card.webp',
    loadContent: () =>
      import('./article-content/mgs-2026-play-hall').then(
        ({ mgs2026PlayHallContent }) => mgs2026PlayHallContent,
      ),
    translations: {
      en: {
        title: 'Five sessions I sat in on at MGS 2026',
        subtitle:
          'Subscription payments, the brands AI cites, game marketing, crypto ads, and working with AI',
        loadContent: () =>
          import('./article-content/en/mgs-2026-play-hall').then(
            ({ mgs2026PlayHallContentEn }) => mgs2026PlayHallContentEn,
          ),
      },
    },
  },
  {
    slug: 'ai-git-101-for-designers',
    title: 'AI는 신이 아니고, 그저 확률 기반으로 움직이는 똑똑한 시스템일 뿐',
    subtitle: '프로덕트 디자이너 대상으로 AI 101 세션을 준비하며 정리한 내용 요약',
    cardImage: '/assets/images/ai-git-101-for-designers-card.webp',
    date: '2026.04.23',
    readMinutes: 7,
    category: 'Personal',
    loadContent: () =>
      import('./article-content/ai-git-101-for-designers').then(
        ({ aiGit101ForDesignersContent }) => aiGit101ForDesignersContent,
      ),
    translations: {
      en: {
        title: 'AI is not a god — just a clever system running on probabilities',
        subtitle: 'Notes from preparing an AI 101 session for product designers',
        loadContent: () =>
          import('./article-content/en/ai-git-101-for-designers').then(
            ({ aiGit101ForDesignersContentEn }) => aiGit101ForDesignersContentEn,
          ),
      },
    },
  },
]
