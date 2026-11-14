// Every piece of chrome text on the site, keyed by language. Page templates
// read from here rather than holding literals, so adding a language is a matter
// of adding a column — and a missing key is a type error, not a Korean string
// leaking into the English tree.
//
// Article bodies are not here: those live per-language in
// src/data/article-content/ and are wired up in src/data/articles.ts.
import type { Lang } from '../shared/i18n'

export interface Strings {
  /** <title> for the index, and the suffix on every other page's title. */
  siteTitle: string
  /** The footer's one line about the author. */
  footerTagline: string
  /** The home page's meta description. */
  siteDescription: string
  nav: { posts: string; about: string }
  /** Accessible name for the language switcher group. */
  langSwitchLabel: string
  langNames: Record<Lang, string>
  /** The interactive ferret illustration at the foot of the about page. */
  hero: {
    codingAlt: string
    greetAlt: string
    greetMoreAlt: string
    stateIdle: string
    stateGreet: string
    stateGreetMore: string
    stepGreet: string
    stepGreetMore: string
    stepReset: string
    caption: string
    soundOn: string
    soundOff: string
  }
  home: {
    filterLegend: string
    filterAll: string
    /** Accessible name of the post search box. */
    searchLabel: string
    searchPlaceholder: string
    /** Shown when the search and category leave no post visible. */
    noMatches: string
    /**
     * Announced to screen readers after the search or a pill changes the list,
     * given how many posts are still shown (at least 1; 0 reads `noMatches`).
     */
    resultsCount: (count: number) => string
    /** Shown on an index when no post has been written in its language yet. */
    emptyList: string
  }
  article: {
    back: string
  }
  notFound: { title: string; back: string }
  /** Accessible name and tooltip of the header's theme toggle, by what it switches to. */
  theme: { toLight: string; toDark: string }
  /**
   * Passed to the AiSummary island as a prop rather than looked up inside it.
   * The island would otherwise have to bundle every language's dictionary to
   * pick one at runtime; this way it ships only the strings it renders.
   */
  summarizer: {
    button: string
    /** Shown while Chrome downloads a model the summary needs. */
    downloading: string
    /** When one model has downloaded and the next needs another click. */
    continue: string
    summarizing: string
    heading: string
    /** Says the summary is machine-written and may be wrong. */
    disclaimer: string
    error: string
    retry: string
  }
}

const ko: Strings = {
  siteTitle: 'wildferret의 블로그',
  footerTagline: 'Just another product IT startup person out there, in the wild!',
  siteDescription: '사람을 깊이 이해하고, 조용하지만 분명한 차이를 만드는 제품을 만듭니다.',
  nav: { posts: '글', about: '소개' },
  langSwitchLabel: '언어 선택',
  langNames: { ko: '한국어', en: 'English' },
  hero: {
    codingAlt: '안경을 쓴 페럿이 책상에서 노트북으로 코드를 작성하는 일러스트',
    greetAlt: '페럿이 고개를 들어 정면을 바라보며 손을 흔들어 인사하는 일러스트',
    greetMoreAlt: '페럿이 활짝 웃으며 반갑게 인사하는 일러스트',
    stateIdle: '작업 중인 페럿',
    stateGreet: '인사하는 페럿',
    stateGreetMore: '활짝 웃으며 인사하는 페럿',
    stepGreet: '페럿에게 인사 건네기',
    stepGreetMore: '페럿의 인사 더 보기',
    stepReset: '처음 모습으로 돌아가기',
    caption: '소리 키고 클릭하면 좋은 일이 있을 수도? 위 이미지를 눌러보세요 🍀',
    soundOn: '주변 소리 켜기',
    soundOff: '주변 소리 끄기',
  },
  home: {
    filterLegend: '카테고리로 글 고르기',
    filterAll: '전체',
    searchLabel: '글 검색',
    searchPlaceholder: '제목이나 요약으로 검색…',
    noMatches: '조건에 맞는 글이 없어요.',
    resultsCount: (count) => `글 ${count}개를 찾았어요.`,
    emptyList: '아직 이 언어로 옮긴 글이 없어요.',
  },
  article: {
    back: '목록으로 돌아가기',
  },
  notFound: { title: '페이지를 찾을 수 없습니다', back: '목록으로 돌아가기' },
  theme: { toLight: '밝은 테마로 전환', toDark: '어두운 테마로 전환' },
  summarizer: {
    button: 'AI로 요약하기',
    downloading: 'AI 모델을 불러오고 있어요',
    continue: '이어서 불러오기',
    summarizing: '요약하는 중…',
    heading: 'AI 요약',
    disclaimer: 'Chrome에 내장된 AI가 이 기기에서 만든 요약이에요. 틀린 내용이 있을 수 있어요.',
    error: '요약하지 못했어요.',
    retry: '다시 시도',
  },
}

const en: Strings = {
  siteTitle: "wildferret's blog",
  footerTagline: 'Just another product IT startup person out there, in the wild!',
  siteDescription:
    'Understanding people deeply, and building products that make a quiet but unmistakable difference.',
  nav: { posts: 'Posts', about: 'About' },
  langSwitchLabel: 'Choose a language',
  langNames: { ko: '한국어', en: 'English' },
  hero: {
    codingAlt: 'Illustration of a ferret in glasses writing code on a laptop at a desk',
    greetAlt: 'Illustration of the ferret looking up and waving hello',
    greetMoreAlt: 'Illustration of the ferret beaming and greeting the reader',
    stateIdle: 'The ferret at work',
    stateGreet: 'The ferret waving hello',
    stateGreetMore: 'The ferret beaming a greeting',
    stepGreet: 'Say hello to the ferret',
    stepGreetMore: 'See more of the greeting',
    stepReset: 'Go back to the first frame',
    caption: 'Turn the sound on and click — something good might happen. Try the image above 🍀',
    soundOn: 'Turn ambient sound on',
    soundOff: 'Turn ambient sound off',
  },
  home: {
    filterLegend: 'Filter posts by category',
    filterAll: 'All',
    searchLabel: 'Search posts',
    searchPlaceholder: 'Search by title or summary…',
    noMatches: 'No posts match.',
    resultsCount: (count) => (count === 1 ? '1 post found.' : `${count} posts found.`),
    emptyList: 'Nothing has been translated into this language yet.',
  },
  article: {
    back: 'Back to all posts',
  },
  notFound: { title: 'Page not found', back: 'Back to all posts' },
  theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
  summarizer: {
    button: 'Summarize with AI',
    downloading: 'Loading the AI model',
    continue: 'Continue loading',
    summarizing: 'Summarizing…',
    heading: 'AI summary',
    disclaimer: "Written on your device by Chrome's built-in AI. It may contain mistakes.",
    error: "Couldn't summarize this post.",
    retry: 'Try again',
  },
}

const STRINGS: Record<Lang, Strings> = { ko, en }

export function t(lang: Lang): Strings {
  return STRINGS[lang]
}
