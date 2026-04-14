export type { Article } from './articleTypes'
import type { Article } from './articleTypes'
import { agentTeamsAndClaudePeersContent } from './article-content/agent-teams-and-claude-peers'
import { npsDashboardPipelineContent } from './article-content/nps-dashboard-pipeline'
import { pmAiWeekContent } from './article-content/pm-ai-week'
import { weeklyDiary0409Content } from './article-content/weekly-diary-0409'

export const articles: Article[] = [
  {
    slug: 'nps-dashboard-pipeline',
    title: 'NPS 대시보드를 하루 만에 만들고, 자동화까지 붙인 이야기',
    subtitle: 'Google Sheets → GitHub Actions → S3 정적 배포, PM이 만든 데이터 파이프라인',
    date: '2026.04.15',
    category: 'AI & PM',
    readTime: '12분',
    coverImage: '/nps-dashboard-pipeline-cover.png',
    content: npsDashboardPipelineContent,
  },
  {
    slug: 'weekly-diary-0409',
    title: '이번 주, Claude와 한 일들',
    subtitle: 'GTM 세팅부터 데스크탑 펫까지',
    date: '2026.04.09',
    category: 'AI & PM',
    readTime: '10분',
    coverImage: '/weekly-diary-0409-cover.svg',
    content: weeklyDiary0409Content,
  },
  {
    slug: 'agent-teams-and-claude-peers',
    title: '혼자인데 혼자가 아닌',
    subtitle: 'AI 에이전트 팀과 Claude Peers 이야기',
    date: '2026.03.29',
    category: 'AI & PM',
    readTime: '20분',
    coverImage: '/agent-teams-cover-pixel.png',
    content: agentTeamsAndClaudePeersContent,
  },
  {
    slug: 'pm-ai-week',
    title: '빨라진 게 아니라, 가능해진 것들',
    subtitle: 'Claude Code와 함께하는 일주일',
    date: '2026.03.27',
    category: 'AI & PM',
    readTime: '15분',
    coverImage: '/pm-ai-week-cover-pixel.png',
    content: pmAiWeekContent,
  },
]
