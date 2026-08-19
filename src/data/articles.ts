export type { Article } from './articleTypes'
import type { Article } from './articleTypes'

export const articles: Article[] = [
  /*{
    slug: 'mgs-2026-play-hall',
    title: 'MGS 2026에서 들은 5가지 세션 요약',
    subtitle: '구독 결제, AI 인용, 게임 UA, 크립토 광고, 그리고 워크플로우',
    date: '2026.08.18',
    readTime: '24분',
    loadContent: () => import('./article-content/mgs-2026-play-hall').then(({ mgs2026PlayHallContent }) => mgs2026PlayHallContent),
  },
  */
  {
    slug: 'wiki-as-graph',
    title: '위키를 문서 말고 그래프로 짠다면',
    subtitle: 'RAG와 지식 그래프를 들여다보며 배운 것들',
    date: '2026.08.17',
    readTime: '12분',
    loadContent: () => import('./article-content/wiki-as-graph').then(({ wikiAsGraphContent }) => wikiAsGraphContent),
  },
  {
    slug: 'research-wiki-for-llm',
    title: 'LLM 친화적인 유저 리서치 위키 만들기',
    subtitle: '사람은 읽고 에이전트가 쓰는 위키를 만든 기록',
    date: '2026.08.13',
    readTime: '5분',
    loadContent: () => import('./article-content/research-wiki-for-llm').then(({ researchWikiForLlmContent }) => researchWikiForLlmContent),
  },
  {
    slug: 'synthetic-user-research-panel',
    title: '유저 없이 유저 피드백을 받아봤다',
    subtitle: '가상 유저 패널(synthetic user panel)을 만들어 실무에서 쓰기까지',
    date: '2026.08.13',
    readTime: '15분',
    loadContent: () => import('./article-content/synthetic-user-research-panel').then(({ syntheticUserResearchPanelContent }) => syntheticUserResearchPanelContent),
  },
  {
    slug: 'ai-git-101-for-designers',
    title: 'AI가 아직 막막한 디자이너에게',
    subtitle: 'AI & Git 101 세션을 준비하며 정리한 것들',
    date: '2026.04.23',
    readTime: '7분',
    loadContent: () => import('./article-content/ai-git-101-for-designers').then(({ aiGit101ForDesignersContent }) => aiGit101ForDesignersContent),
  },
  /*{
    slug: 'weekly-diary-0409',
    title: '이번 주, Claude와 한 일들',
    subtitle: 'GTM 세팅부터 데스크탑 펫까지',
    date: '2026.04.09',
    readTime: '6분',
    loadContent: () => import('./article-content/weekly-diary-0409').then(({ weeklyDiary0409Content }) => weeklyDiary0409Content),
  },
  {
    slug: 'agent-teams-and-claude-peers',
    title: '혼자 일하는데 혼자가 아니다',
    subtitle: 'AI 에이전트 팀과 Claude Peers 이야기',
    date: '2026.03.29',
    readTime: '18분',
    loadContent: () => import('./article-content/agent-teams-and-claude-peers').then(({ agentTeamsAndClaudePeersContent }) => agentTeamsAndClaudePeersContent),
  },*/
  {
    slug: 'pm-ai-week',
    title: '빨라진 게 아니라, 가능해진 것들',
    subtitle: 'Claude Code와 보낸 일주일',
    date: '2026.03.27',
    readTime: '7분',
    loadContent: () => import('./article-content/pm-ai-week').then(({ pmAiWeekContent }) => pmAiWeekContent),
  },
]
