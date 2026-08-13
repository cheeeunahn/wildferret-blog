export type { Article } from './articleTypes'
import type { Article } from './articleTypes'
import { aiGit101ForDesignersContent } from './article-content/ai-git-101-for-designers'
import { agentTeamsAndClaudePeersContent } from './article-content/agent-teams-and-claude-peers'
import { pmAiWeekContent } from './article-content/pm-ai-week'
import { researchWikiForLlmContent } from './article-content/research-wiki-for-llm'
import { syntheticUserResearchPanelContent } from './article-content/synthetic-user-research-panel'
import { weeklyDiary0409Content } from './article-content/weekly-diary-0409'

export const articles: Article[] = [
  {
    slug: 'research-wiki-for-llm',
    title: '리서치를 LLM이 읽는 형태로 바꾸기',
    subtitle: '흩어진 UX 리서치를 사람은 읽고 에이전트가 쓰는 위키로 정리한 기록',
    date: '2026.08.13',
    readTime: '8분',
    content: researchWikiForLlmContent,
  },
  {
    slug: 'synthetic-user-research-panel',
    title: '유저 없이 유저 피드백을 받는다는 것',
    subtitle: '가상 유저 패널(synthetic user panel)을 만들고, 실무에 쓰이는 도구로 만들어간 이야기',
    date: '2026.08.13',
    readTime: '11분',
    content: syntheticUserResearchPanelContent,
  },
  {
    slug: 'ai-git-101-for-designers',
    title: 'AI가 막연하고 무서운 디자이너를 위해',
    subtitle: 'AI & Git 101 세션을 만들면서 생각한 것들',
    date: '2026.04.23',
    readTime: '8분',
    content: aiGit101ForDesignersContent,
  },
  {
    slug: 'weekly-diary-0409',
    title: '이번 주, Claude와 한 일들',
    subtitle: 'GTM 세팅부터 데스크탑 펫까지',
    date: '2026.04.09',
    readTime: '10분',
    coverImage: '/assets/images/weekly-diary-0409-cover.svg',
    content: weeklyDiary0409Content,
  },
  {
    slug: 'agent-teams-and-claude-peers',
    title: '혼자인데 혼자가 아닌',
    subtitle: 'AI 에이전트 팀과 Claude Peers 이야기',
    date: '2026.03.29',
    readTime: '20분',
    coverImage: '/assets/images/agent-teams-cover-pixel.png',
    content: agentTeamsAndClaudePeersContent,
  },
  {
    slug: 'pm-ai-week',
    title: '빨라진 게 아니라, 가능해진 것들',
    subtitle: 'Claude Code와 함께하는 일주일',
    date: '2026.03.27',
    readTime: '15분',
    coverImage: '/assets/images/pm-ai-week-cover-pixel.png',
    content: pmAiWeekContent,
  },
]
