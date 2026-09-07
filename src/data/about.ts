// The about page's copy, per language. It is page content rather than chrome,
// so it lives in src/data/ next to the articles instead of in lib/strings.ts.
import type { Lang } from '../lib/i18n'

export interface AboutCopy {
  pageTitle: string
  heading: string
  intro: string
  profileAlt: string
  interestsHeading: string
  interests: string[]
  careerHeading: string
  career: { period: string; role: string; org: string }[]
}

const ko: AboutCopy = {
  pageTitle: '소개',
  heading: '안녕하세요, wildferret입니다',
  intro: '사람을 깊이 이해하고, 조용하지만 분명한 차이를 만드는 제품을 만듭니다.',
  profileAlt: 'wildferret 프로필 이미지',
  interestsHeading: '관심사',
  interests: ['Product Management', 'User Research', 'AI', 'Data Analysis'],
  careerHeading: '경력',
  career: [
    { period: '2024 — 현재', role: 'UX Researcher → Product Manager', org: '세금 도메인' },
    { period: '2022 — 2024', role: 'UX Researcher', org: '인테리어 및 커머스 도메인' },
    { period: '2022', role: 'UX Researcher', org: '슬립테크 스타트업' },
    { period: '2014 — 2022', role: '산업디자인 학·석사 (HCI)', org: '공과대학' },
  ],
}

const en: AboutCopy = {
  pageTitle: 'About',
  heading: "Hello, I'm wildferret",
  intro:
    'Understanding people deeply, and building products that make a quiet but unmistakable difference.',
  profileAlt: 'wildferret profile picture',
  interestsHeading: 'Interests',
  interests: ['Product Management', 'User Research', 'AI', 'Data Analysis'],
  careerHeading: 'Career',
  career: [
    { period: '2024 — present', role: 'UX Researcher → Product Manager', org: 'Tax domain' },
    { period: '2022 — 2024', role: 'UX Researcher', org: 'Interiors and commerce domain' },
    { period: '2022', role: 'UX Researcher', org: 'Sleep-tech startup' },
    {
      period: '2014 — 2022',
      role: 'BS/MS, Industrial Design (HCI)',
      org: 'College of Engineering',
    },
  ],
}

const ABOUT: Record<Lang, AboutCopy> = { ko, en }

export function aboutCopy(lang: Lang): AboutCopy {
  return ABOUT[lang]
}
