import { describe, expect, it } from 'vitest'
import { checkComment, countLinks, messageFor, REJECTION_MESSAGES } from './moderation'

const ok = (body: string) => checkComment('닉네임', body)

describe('checkComment — personal information', () => {
  it('catches Korean mobile numbers, spaced or punctuated', () => {
    expect(ok('연락처 010-1234-5678')).toBe('pii_phone')
    expect(ok('010 1234 5678 로 연락주세요')).toBe('pii_phone')
    expect(ok('01012345678')).toBe('pii_phone')
  })

  it('catches resident registration numbers', () => {
    expect(ok('901010-1234567')).toBe('pii_rrn')
  })

  it('catches card numbers before mistaking them for phone numbers', () => {
    // The "016" run inside this card number matches the mobile pattern too;
    // ordering is what makes the reported reason the accurate one.
    expect(ok('4016 1234 5678 9012')).toBe('pii_card')
  })

  it('catches email addresses', () => {
    expect(ok('내 이메일은 a.b+c@example.co.kr 이야')).toBe('pii_email')
  })

  it('leaves ordinary numbers alone', () => {
    expect(ok('2026년에 3번 읽었어요')).toBeNull()
    expect(ok('버전 1.2.3 에서 됩니다')).toBeNull()
  })
})

describe('checkComment — structure', () => {
  it('requires a nickname', () => {
    expect(checkComment('   ', '좋은 글이네요')).toBe('no_nickname')
  })

  it('rejects a nickname over the column limit', () => {
    expect(checkComment('가'.repeat(25), '좋은 글이네요')).toBe('too_long')
  })

  it('rejects bodies outside the length bounds', () => {
    expect(ok('ㅋ')).toBe('too_short')
    expect(ok('  ')).toBe('too_short')
    expect(ok('가'.repeat(2001))).toBe('too_long')
  })

  it('accepts an ordinary comment', () => {
    expect(ok('잘 읽었습니다. 다음 글도 기대할게요!')).toBeNull()
  })
})

describe('countLinks', () => {
  it('allows a single link but flags two', () => {
    expect(countLinks('참고: https://example.com')).toBe(1)
    expect(ok('https://a.com 그리고 https://b.com')).toBe('link_spam')
    expect(ok('참고: https://example.com 입니다')).toBeNull()
  })

  it('counts case-insensitively', () => {
    expect(countLinks('HTTP://a.com HTTPS://b.com')).toBe(2)
  })
})

describe('messageFor', () => {
  it('has copy for every reason the server can send', () => {
    // A reason code with no copy would render as undefined to the reader.
    for (const reason of Object.keys(REJECTION_MESSAGES) as (keyof typeof REJECTION_MESSAGES)[]) {
      expect(messageFor(reason)).toBeTruthy()
    }
  })

  it('falls back rather than rendering a raw code', () => {
    // @ts-expect-error — exercising the runtime guard against an unknown code.
    expect(messageFor('something_new_from_the_server')).toBe(REJECTION_MESSAGES.unknown)
  })
})
