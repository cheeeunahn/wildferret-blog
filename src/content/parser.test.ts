import { describe, expect, it } from 'vitest'
import { articles } from '../data/articles'
import {
  classifyBlock,
  formatInline,
  headingId,
  parseArticleBody,
  parseImageLine,
  splitContentIntoBlocks,
} from './parser'

describe('parseImageLine', () => {
  it('preserves literal parentheses in image sources', () => {
    expect(parseImageLine('![diagram](/assets/images/graph_(final).png)')).toEqual({
      alt: 'diagram',
      src: '/assets/images/graph_(final).png',
    })
  })

  it('separates a caption from a source containing parentheses', () => {
    expect(parseImageLine('![diagram](/assets/images/graph_(final).png "Source (2026)")')).toEqual({
      alt: 'diagram',
      src: '/assets/images/graph_(final).png',
      caption: 'Source (2026)',
    })
  })
})

describe('splitContentIntoBlocks', () => {
  it('keeps fenced code intact while splitting regular blocks', () => {
    const content = [
      '## 제목',
      '',
      '첫 문단입니다.',
      '',
      '~~~ts',
      'const value = 1',
      '',
      'console.log(value)',
      '~~~',
      '',
      '마지막 문단입니다.',
    ].join('\n')

    expect(splitContentIntoBlocks(content)).toEqual([
      '## 제목',
      '첫 문단입니다.',
      '~~~ts\nconst value = 1\n\nconsole.log(value)\n~~~',
      '마지막 문단입니다.',
    ])
  })
})

describe('classifyBlock', () => {
  it('classifies every block type', () => {
    expect(classifyBlock('---')).toEqual({ type: 'divider' })
    expect(classifyBlock('~~~ts\nconst a = 1\n~~~')).toEqual({
      type: 'code',
      lang: 'ts',
      code: 'const a = 1',
    })
    expect(classifyBlock('~~~\nplain\n~~~')).toEqual({ type: 'code', lang: '', code: 'plain' })
    expect(classifyBlock('## 제목')).toEqual({
      type: 'heading',
      level: 2,
      text: '제목',
      id: '제목',
    })
    expect(classifyBlock('### 소제목')).toEqual({
      type: 'heading',
      level: 3,
      text: '소제목',
      id: '소제목',
    })
    expect(classifyBlock('> "인용"')).toEqual({ type: 'quote', text: '인용' })
    expect(classifyBlock('- a\n- **b**')).toEqual({
      type: 'list',
      ordered: false,
      items: ['a', '**b**'],
    })
    expect(classifyBlock('1. a\n2. b')).toEqual({ type: 'list', ordered: true, items: ['a', 'b'] })
    expect(classifyBlock('| a | b |\n| --- | :-: |\n| 1 | `2` |')).toEqual({
      type: 'table',
      header: ['a', 'b'],
      rows: [['1', '`2`']],
    })
    expect(classifyBlock('![x](/a.png "캡션")')).toEqual({
      type: 'image',
      image: { alt: 'x', src: '/a.png', caption: '캡션' },
    })
    expect(classifyBlock('그냥 **문단**')).toEqual({ type: 'paragraph', text: '그냥 **문단**' })
  })

  it('turns consecutive image lines into one side-by-side gallery', () => {
    expect(classifyBlock('![a](/a.png)\n![b](/b.png "캡션")')).toEqual({
      type: 'gallery',
      images: [
        { alt: 'a', src: '/a.png' },
        { alt: 'b', src: '/b.png', caption: '캡션' },
      ],
    })
  })

  it('treats a single-line pipe row and a mixed image block as paragraphs', () => {
    expect(classifyBlock('| a | b |').type).toBe('paragraph')
    expect(classifyBlock('![a](/a.png)\n설명').type).toBe('paragraph')
  })
})

describe('parseArticleBody', () => {
  it('lifts a leading summary heading and list out of the blocks, with its divider', () => {
    const body = parseArticleBody('## TL;DR\n\n- one\n- two\n\n---\n\n본문')
    expect(body.summary).toEqual({ label: 'TL;DR', items: ['one', 'two'] })
    expect(body.blocks).toEqual([{ type: 'paragraph', text: '본문' }])
  })

  it.each(['핵심 요약', 'Key takeaways', 'Summary', 'tldr'])(
    'recognises %s as a summary',
    (label) => {
      expect(parseArticleBody(`## ${label}\n\n- one`).summary?.label).toBe(label)
    },
  )

  it('leaves an ordinary heading and list in the blocks', () => {
    const body = parseArticleBody('## 배경\n\n- one\n\n---')
    expect(body.summary).toBeNull()
    expect(body.blocks.map((b) => b.type)).toEqual(['heading', 'list', 'divider'])
  })
})

describe('headingId', () => {
  it('names fragments the way GitHub does, keeping Korean as written', () => {
    expect(headingId('지시 파일 정리 기준')).toBe('지시-파일-정리-기준')
    expect(headingId('Appendix: paper summaries')).toBe('appendix-paper-summaries')
    expect(headingId('Why `AGENTS.md`?')).toBe('why-agentsmd')
    expect(headingId('???')).toBe('section')
  })

  it('suffixes a repeated heading so each fragment lands on one place', () => {
    const ids = parseArticleBody('## 정리\n\n본문\n\n## 정리\n\n### 정리')
      .blocks.filter((b) => b.type === 'heading')
      .map((b) => b.id)
    expect(ids).toEqual(['정리', '정리-1', '정리-2'])
  })
})

describe('in-article # links', () => {
  // A heading renamed without its links would otherwise fail silently: the
  // click just stays put. Checks every language each post is written in.
  const versions = articles.flatMap((a) => [
    { name: a.slug, load: a.loadContent },
    ...Object.entries(a.translations ?? {}).map(([lang, t]) => ({
      name: `${lang}/${a.slug}`,
      load: t.loadContent,
    })),
  ])

  it.each(versions)('$name: every #fragment names a heading', async ({ load }) => {
    const content = await load()
    const ids = new Set(
      parseArticleBody(content)
        .blocks.filter((b) => b.type === 'heading')
        .map((b) => b.id),
    )
    const fragments = [...content.matchAll(/\]\(#([^)\s]+)\)/g)].map((m) => m[1])
    expect(fragments.filter((f) => !ids.has(decodeURIComponent(f)))).toEqual([])
  })
})

describe('formatInline', () => {
  it('renders supported markup while escaping unsafe input and URLs', () => {
    const result = formatInline(
      '**강조** `code` [내부 링크](/assets/image.png) [unsafe](javascript:alert(1)) <script>alert(1)</script>',
    )

    expect(result).toContain('<strong>강조</strong>')
    // Asserted as wrapper + font token rather than the exact class list: the
    // rest is presentational churn, and pinning it is what let this test drift
    // when inline code moved to Astryx's code font.
    expect(result).toMatch(/<code class="[^"]*">code<\/code>/)
    expect(result).toContain('--font-family-code')
    expect(result).toContain('assets/image.png"')
    expect(result).toContain('<a href="#"')
    expect(formatInline('[위로](#지시-파일-정리-기준)')).toContain('href="#지시-파일-정리-기준"')
    expect(result).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})
