// The about page's copy, per language. It is page content rather than chrome,
// so it lives in src/data/ next to the articles instead of in copy/strings.ts.
// Read it through aboutCopy() in src/content/service.ts.
import type { Lang } from '../shared/i18n'

export interface AboutCopy {
  pageTitle: string
  heading: string
  /** A `\n` is a line break on the page; the meta description flattens it to a space. */
  intro: string
  careerHeading: string
  career: { period: string; role: string; org: string }[]
  projectsHeading: string
  projects: { year: string; name: string; summary: string }[]
  certificationsHeading: string
  certifications: { year: string; name: string; issuer: string }[]
}

const ko: AboutCopy = {
  pageTitle: '소개',
  heading: '안녕하세요, wildferret(안치은)입니다',
  intro:
    'UX 리서처 출신의 Product Manager입니다.\n사용자 조사로 문제를 찾고, AI 에이전트와 함께 제품을 만듭니다.',
  careerHeading: '경력',
  career: [
    { period: '2026 — 현재', role: 'Product Manager', org: '세금 도메인' },
    { period: '2024 — 2026', role: 'UX Researcher', org: '세금 도메인' },
    { period: '2022 — 2024', role: 'UX Researcher', org: '인테리어 및 커머스 도메인' },
    { period: '2021 — 2022', role: 'UX Researcher', org: '슬립테크 스타트업' },
    { period: '2014 — 2022', role: '산업디자인 학·석사 (HCI)', org: '공과대학' },
  ],
  projectsHeading: '주요 프로젝트',
  projects: [
    {
      year: '2026',
      name: '정부 혜택 알림 서비스',
      summary: '정부 API와 연동해 사용자가 받을 수 있는 혜택을 알려 주는 서비스 출시',
    },
    {
      year: '2026',
      name: '월별 소득 조회',
      summary: '사용자 인터뷰를 바탕으로 월별 소득 조회 기능을 기획·출시',
    },
    {
      year: '2026',
      name: 'LLM 가상 유저 툴',
      summary: '사내 리서치 데이터로 만든 가상 유저 패널이 화면에 피드백을 주는 툴',
    },
    {
      year: '2025',
      name: '리서치 패널',
      summary: '유저 패널을 구축해 피드백을 받는 데 걸리는 시간을 몇 주에서 며칠로 단축',
    },
  ],
  certificationsHeading: '자격증',
  certifications: [
    { year: '2026', name: '빅데이터분석기사', issuer: '한국데이터산업진흥원' },
    { year: '2026', name: '데이터분석 준전문가 (ADsP)', issuer: '한국데이터산업진흥원' },
    { year: '2025', name: '세무회계 3급', issuer: '한국세무사회' },
    { year: '2025', name: 'SQL 개발자 (SQLD)', issuer: '한국데이터산업진흥원' },
  ],
}

const en: AboutCopy = {
  pageTitle: 'About',
  heading: "Hello, I'm wildferret",
  intro:
    "I'm a product manager with a background in UX research.\nI use user research to identify problems and work with AI agents to build products.",
  careerHeading: 'Career',
  career: [
    { period: '2026 — present', role: 'Product Manager', org: 'Tax domain' },
    { period: '2024 — 2026', role: 'UX Researcher', org: 'Tax domain' },
    { period: '2022 — 2024', role: 'UX Researcher', org: 'Interiors and commerce domain' },
    { period: '2021 — 2022', role: 'UX Researcher', org: 'Sleep-tech startup' },
    {
      period: '2014 — 2022',
      role: 'BS/MS, Industrial Design (HCI)',
      org: 'College of Engineering',
    },
  ],
  projectsHeading: 'Selected projects',
  projects: [
    {
      year: '2026',
      name: 'Government benefit alerts',
      summary:
        'Launched a service that uses government APIs to show users which benefits they can claim',
    },
    {
      year: '2026',
      name: 'Monthly income view',
      summary: 'Designed and launched a monthly income lookup based on user interviews',
    },
    {
      year: '2026',
      name: 'LLM synthetic-user tool',
      summary:
        'A panel of synthetic users, built from in-house research, that gives feedback on screens',
    },
    {
      year: '2025',
      name: 'Research panel',
      summary: 'Built a user panel that cut the wait for user feedback from weeks to days',
    },
  ],
  certificationsHeading: 'Certifications',
  certifications: [
    {
      year: '2026',
      name: 'Engineer Big Data Analysis',
      issuer: 'Korea Data Agency',
    },
    {
      year: '2026',
      name: 'Advanced Data Analytics Semi-Professional (ADsP)',
      issuer: 'Korea Data Agency',
    },
    { year: '2025', name: 'Tax Accounting, Level 3', issuer: 'Korean Association of CPTA' },
    { year: '2025', name: 'SQL Developer (SQLD)', issuer: 'Korea Data Agency' },
  ],
}

export const about: Record<Lang, AboutCopy> = { ko, en }
