export type { Article, LocalizedArticle } from './articleTypes'
import type { Article, LocalizedArticle } from './articleTypes'
import { localizeArticle, articleLangs } from './articleTypes'
import type { Lang } from '../lib/i18n'

export const articles: Article[] = [
  {
    slug: 'synthetic-user-reading',
    title: '합성 유저(synthetic user)는 실제 사람을 대상으로 하는 유저 리서치를 대체할 수 있을까',
    subtitle: '가상 유저 리서치 패널 만드는 김에 조사하고 읽어본 합성 유저 문헌들',
    date: '2026.09.01',
    readMinutes: 12,
    category: 'Research',
    cardImage: '/assets/images/synthetic-user-reading-card.webp',
    loadContent: () => import('./article-content/synthetic-user-reading').then(({ syntheticUserReadingContent }) => syntheticUserReadingContent),
    translations: {
      en: {
        title: 'Can synthetic users replace user research with real people?',
        subtitle:
          'The synthetic user literature I went looking for while building a virtual research panel',
        loadContent: () => import('./article-content/en/synthetic-user-reading').then(({ syntheticUserReadingContentEn }) => syntheticUserReadingContentEn),
      },
    },
  },
  {
    slug: 'mgs-2026-play-hall',
    title: 'MGS 2026에서 들은 5가지 세션 요약해보기',
    subtitle: '구독 결제, AI가 인용하는 브랜드, 게임 마케팅, 가상자산 광고, 그리고 AI로 일하는 방식',
    date: '2026.08.18',
    readMinutes: 12,
    category: 'Conference',
    cardImage: '/assets/images/mgs-2026-play-hall-card.webp',
    loadContent: () => import('./article-content/mgs-2026-play-hall').then(({ mgs2026PlayHallContent }) => mgs2026PlayHallContent),
    translations: {
      en: {
        title: 'Five sessions I sat in on at MGS 2026',
        subtitle:
          'Subscription payments, the brands AI cites, game marketing, crypto ads, and working with AI',
        loadContent: () => import('./article-content/en/mgs-2026-play-hall').then(({ mgs2026PlayHallContentEn }) => mgs2026PlayHallContentEn),
      },
    },
  },
  {
    slug: 'research-wiki-for-llm',
    title: 'LLM 유저 리서치 위키 만들기',
    subtitle: '방대한 유저 리서치 자료를 한 곳에, AI 에이전트가 이해하기 쉬운 방식으로 정리하기',
    date: '2026.08.13',
    readMinutes: 5,
    category: 'Personal',
    cardImage: '/assets/images/research-wiki-for-llm-card.webp',
    loadContent: () => import('./article-content/research-wiki-for-llm').then(({ researchWikiForLlmContent }) => researchWikiForLlmContent),
    translations: {
      en: {
        title: 'Building a user research wiki for an LLM',
        subtitle:
          'Getting a sprawling pile of user research into one place, in a shape an AI agent can actually read',
        loadContent: () => import('./article-content/en/research-wiki-for-llm').then(({ researchWikiForLlmContentEn }) => researchWikiForLlmContentEn),
      },
    },
  },
  {
    slug: 'synthetic-user-research-panel',
    title: '유저 없이 유저 피드백을 받을 수 있다?',
    subtitle: '가상 유저 패널(synthetic user panel) 직접 만들어보기',
    date: '2026.08.13',
    readMinutes: 10,
    category: 'Personal',
    cardImage: '/assets/images/synthetic-user-research-panel-card.webp',
    loadContent: () => import('./article-content/synthetic-user-research-panel').then(({ syntheticUserResearchPanelContent }) => syntheticUserResearchPanelContent),
    translations: {
      en: {
        title: 'Can you get user feedback without users?',
        subtitle: 'Building a synthetic user panel from scratch',
        loadContent: () => import('./article-content/en/synthetic-user-research-panel').then(({ syntheticUserResearchPanelContentEn }) => syntheticUserResearchPanelContentEn),
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
    loadContent: () => import('./article-content/ai-git-101-for-designers').then(({ aiGit101ForDesignersContent }) => aiGit101ForDesignersContent),
    translations: {
      en: {
        title: 'AI is not a god — just a clever system running on probabilities',
        subtitle: 'Notes from preparing an AI 101 session for product designers',
        loadContent: () => import('./article-content/en/ai-git-101-for-designers').then(({ aiGit101ForDesignersContentEn }) => aiGit101ForDesignersContentEn),
      },
    },
  },
  /*{
    slug: 'weekly-diary-0409',
    title: '이번 주, Claude와 한 일들',
    subtitle: 'GTM 세팅부터 데스크탑 펫까지',
    date: '2026.04.09',
    readMinutes: 6,
    category: 'Personal',
    loadContent: () => import('./article-content/weekly-diary-0409').then(({ weeklyDiary0409Content }) => weeklyDiary0409Content),
  },
  {
    slug: 'agent-teams-and-claude-peers',
    title: '혼자 일하는데 혼자가 아니다',
    subtitle: 'AI 에이전트 팀과 Claude Peers 이야기',
    date: '2026.03.29',
    readMinutes: 18,
    category: 'Personal',
    loadContent: () => import('./article-content/agent-teams-and-claude-peers').then(({ agentTeamsAndClaudePeersContent }) => agentTeamsAndClaudePeersContent),
  },
  {
    slug: 'pm-ai-week',
    title: '빨라진 게 아니라, 가능해진 것들',
    subtitle: 'Claude Code와 보낸 일주일',
    date: '2026.03.27',
    readMinutes: 7,
    category: 'Personal',
    loadContent: () => import('./article-content/pm-ai-week').then(({ pmAiWeekContent }) => pmAiWeekContent),
  },*/
]

/** The index for one language: posts written in it, newest first (source order). */
export function articlesIn(lang: Lang): LocalizedArticle[] {
  return articles
    .map((article) => localizeArticle(article, lang))
    .filter((article): article is LocalizedArticle => article !== null)
}

/** One post in one language, or null if it has no version there. */
export function articleIn(slug: string, lang: Lang): LocalizedArticle | null {
  const article = articles.find((a) => a.slug === slug)
  return article ? localizeArticle(article, lang) : null
}

/** Languages a slug is available in — drives the article page's switcher. */
export function langsForSlug(slug: string): Lang[] {
  const article = articles.find((a) => a.slug === slug)
  return article ? articleLangs(article) : []
}
