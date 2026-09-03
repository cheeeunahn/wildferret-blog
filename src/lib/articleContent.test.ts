import { describe, expect, it } from 'vitest'
import {
  formatInline,
  parseImageLine,
  splitContentIntoBlocks,
} from './articleContent'

describe('parseImageLine', () => {
  it('preserves literal parentheses in image sources', () => {
    expect(parseImageLine('![diagram](/assets/images/graph_(final).png)')).toEqual(
      {
        alt: 'diagram',
        src: '/assets/images/graph_(final).png',
      },
    )
  })

  it('separates a caption from a source containing parentheses', () => {
    expect(
      parseImageLine(
        '![diagram](/assets/images/graph_(final).png "Source (2026)")',
      ),
    ).toEqual({
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

describe('formatInline', () => {
  it('renders supported markup while escaping unsafe input and URLs', () => {
    const result = formatInline('**강조** `code` [내부 링크](/assets/image.png) [unsafe](javascript:alert(1)) <script>alert(1)</script>')

    expect(result).toContain('<strong>강조</strong>')
    // Asserted as wrapper + color token rather than the exact class list: the
    // rest is presentational churn, and pinning it is what let this test drift
    // when the redesign moved inline code from text-ink-600 to text-copper.
    expect(result).toMatch(/<code class="[^"]*">code<\/code>/)
    expect(result).toContain('text-copper')
    expect(result).toContain('assets/image.png"')
    expect(result).toContain('<a href="#"')
    expect(result).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})
