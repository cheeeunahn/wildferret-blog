// Every piece of chrome text on the site, keyed by language. Page templates
// read from here rather than holding literals, so adding a language is a matter
// of adding a column — and a missing key is a type error, not a Korean string
// leaking into the English tree.
//
// Article bodies are not here: those live per-language in
// src/data/article-content/ and are wired up in src/data/articles.ts.
import type { Lang } from './i18n'

export interface Strings {
  /** <title> for the index, and the suffix on every other page's title. */
  siteTitle: string
  siteDescription: string
  nav: { posts: string; about: string }
  /** Accessible name for the language switcher group. */
  langSwitchLabel: string
  langNames: Record<Lang, string>
  home: {
    heroCodingAlt: string
    heroGreetAlt: string
    heroGreetMoreAlt: string
    heroStateIdle: string
    heroStateGreet: string
    heroStateGreetMore: string
    heroStepGreet: string
    heroStepGreetMore: string
    heroStepReset: string
    heroCaption: string
    soundOn: string
    soundOff: string
    filterLegend: string
    filterAll: string
    /** Shown on the English index while a post has no English version yet. */
    emptyList: string
  }
  article: {
    /** Reading time, given whole minutes. */
    readTime: (minutes: number) => string
    coverImageNote: string
    /** Accessible name of the nth carousel slide, 1-based. */
    carouselSlide: (n: number) => string
    back: string
  }
  notFound: { title: string; back: string }
  /**
   * Passed to the Comments island as a prop rather than looked up inside it.
   * The island would otherwise have to bundle every language's dictionary to
   * pick one at runtime; this way it ships only the strings it renders.
   */
  comments: {
    heading: string
    loading: string
    empty: string
    namePlaceholder: string
    nameLabel: string
    bodyPlaceholder: string
    bodyLabel: string
    submit: string
    submitting: string
  }
}

const ko: Strings = {
  siteTitle: 'wildferret의 블로그',
  siteDescription: '사람을 깊이 이해하고, 조용하지만 분명한 차이를 만드는 제품을 만듭니다.',
  nav: { posts: '글', about: '소개' },
  langSwitchLabel: '언어 선택',
  langNames: { ko: '한국어', en: 'English' },
  home: {
    heroCodingAlt: '안경을 쓴 페럿이 책상에서 노트북으로 코드를 작성하는 일러스트',
    heroGreetAlt: '페럿이 고개를 들어 정면을 바라보며 손을 흔들어 인사하는 일러스트',
    heroGreetMoreAlt: '페럿이 활짝 웃으며 반갑게 인사하는 일러스트',
    heroStateIdle: '작업 중인 페럿',
    heroStateGreet: '인사하는 페럿',
    heroStateGreetMore: '활짝 웃으며 인사하는 페럿',
    heroStepGreet: '페럿에게 인사 건네기',
    heroStepGreetMore: '페럿의 인사 더 보기',
    heroStepReset: '처음 모습으로 돌아가기',
    heroCaption: '소리 키고 클릭하면 좋은 일이 있을 수도? 위 이미지를 눌러보세요 🍀',
    soundOn: '주변 소리 켜기',
    soundOff: '주변 소리 끄기',
    filterLegend: '카테고리로 글 고르기',
    filterAll: '전체',
    emptyList: '아직 이 언어로 옮긴 글이 없어요.',
  },
  article: {
    readTime: (minutes) => `${minutes}분 읽기`,
    coverImageNote: '해당 이미지는 AI로 제작한, 이해를 돕기 위한 예시 이미지입니다.',
    carouselSlide: (n) => `${n}번째 이미지`,
    back: '목록으로 돌아가기',
  },
  notFound: { title: '페이지를 찾을 수 없습니다', back: '목록으로 돌아가기' },
  comments: {
    heading: '댓글',
    loading: '댓글을 불러오는 중…',
    empty: '첫 댓글을 남겨보세요.',
    namePlaceholder: '이름',
    nameLabel: '이름',
    bodyPlaceholder: '댓글을 남겨주세요',
    bodyLabel: '댓글',
    submit: '댓글 남기기',
    submitting: '등록 중…',
  },
}

const en: Strings = {
  siteTitle: "wildferret's blog",
  siteDescription:
    'Understanding people deeply, and building products that make a quiet but unmistakable difference.',
  nav: { posts: 'Posts', about: 'About' },
  langSwitchLabel: 'Choose a language',
  langNames: { ko: '한국어', en: 'English' },
  home: {
    heroCodingAlt: 'Illustration of a ferret in glasses writing code on a laptop at a desk',
    heroGreetAlt: 'Illustration of the ferret looking up and waving hello',
    heroGreetMoreAlt: 'Illustration of the ferret beaming and greeting the reader',
    heroStateIdle: 'The ferret at work',
    heroStateGreet: 'The ferret waving hello',
    heroStateGreetMore: 'The ferret beaming a greeting',
    heroStepGreet: 'Say hello to the ferret',
    heroStepGreetMore: 'See more of the greeting',
    heroStepReset: 'Go back to the first frame',
    heroCaption: 'Turn the sound on and click — something good might happen. Try the image above 🍀',
    soundOn: 'Turn ambient sound on',
    soundOff: 'Turn ambient sound off',
    filterLegend: 'Filter posts by category',
    filterAll: 'All',
    emptyList: 'Nothing has been translated into this language yet.',
  },
  article: {
    readTime: (minutes) => `${minutes} min read`,
    coverImageNote: 'This image was generated with AI, as an illustrative example.',
    carouselSlide: (n) => `Image ${n}`,
    back: 'Back to all posts',
  },
  notFound: { title: 'Page not found', back: 'Back to all posts' },
  comments: {
    heading: 'Comments',
    loading: 'Loading comments…',
    empty: 'Be the first to comment.',
    namePlaceholder: 'Name',
    nameLabel: 'Name',
    bodyPlaceholder: 'Leave a comment',
    bodyLabel: 'Comment',
    submit: 'Post comment',
    submitting: 'Posting…',
  },
}

const STRINGS: Record<Lang, Strings> = { ko, en }

export function t(lang: Lang): Strings {
  return STRINGS[lang]
}
