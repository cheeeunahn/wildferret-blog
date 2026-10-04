/**
 * Client-side pre-check, deliberately a SUBSET of the moderate_comment()
 * trigger in supabase/migrations/0001_blog_user_comments.sql.
 *
 * This is not a security control. The publishable key is public, so anyone can
 * POST straight to PostgREST and skip this file entirely — the trigger is the
 * only enforcement point. This exists so a reader gets instant feedback instead
 * of a round-trip.
 *
 * It checks only the structural rules, never profanity: the blocklist lives in
 * a table anon cannot read, and shipping a copy of it here would publish it.
 */

export type RejectionReason =
  | 'pii_card'
  | 'pii_rrn'
  | 'pii_phone'
  | 'pii_email'
  | 'profanity'
  | 'link_spam'
  | 'duplicate'
  | 'too_fast'
  | 'too_short'
  | 'too_long'
  | 'no_nickname'
  | 'unknown'

/** Mirrors the check constraints on the table. */
export const LIMITS = {
  nickname: 24,
  body: 2000,
} as const

// Card before phone, matching the trigger's ordering: a card number can contain
// a "016" run that the mobile pattern would otherwise claim.
const PII = [
  ['pii_card', /[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}/],
  ['pii_rrn', /[0-9]{6}[ -][1-4][0-9]{6}/],
  ['pii_phone', /01[016-9][ .-]?[0-9]{3,4}[ .-]?[0-9]{4}/],
  ['pii_email', /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
] as const satisfies readonly (readonly [RejectionReason, RegExp])[]

/** The trigger collapses whitespace before matching; do the same so the two agree. */
function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function countLinks(text: string): number {
  return normalize(text).split('http').length - 1
}

/**
 * Returns the reason this comment would be rejected, or null if it looks fine.
 * A null here means "worth sending" — not "will be accepted".
 */
export function checkComment(nickname: string, body: string): RejectionReason | null {
  if (nickname.trim().length === 0) return 'no_nickname'
  if (nickname.trim().length > LIMITS.nickname) return 'too_long'

  const trimmed = body.trim()
  if (trimmed.length < 2) return 'too_short'
  if (trimmed.length > LIMITS.body) return 'too_long'

  const normalized = normalize(body)
  for (const [reason, pattern] of PII) {
    if (pattern.test(normalized)) return reason
  }

  if (countLinks(body) >= 2) return 'link_spam'

  return null
}

/**
 * The only place rejection copy lives. The server sends a reason CODE, never a
 * message — rendering a PostgREST error string into the DOM would make the
 * error path a second injection channel.
 */
export const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  pii_card: '카드번호처럼 보이는 내용이 있어요. 빼고 다시 올려주세요.',
  pii_rrn: '주민등록번호처럼 보이는 내용이 있어요. 빼고 다시 올려주세요.',
  pii_phone: '전화번호처럼 보이는 내용이 있어요. 빼고 다시 올려주세요.',
  pii_email: '이메일 주소처럼 보이는 내용이 있어요. 빼고 다시 올려주세요.',
  profanity: '비속어가 포함되어 있어요. 다듬어서 다시 올려주세요.',
  link_spam: '링크가 너무 많아요. 하나만 남겨주세요.',
  duplicate: '같은 내용의 댓글이 이미 있어요.',
  too_fast: '조금 전에 댓글이 등록됐어요. 잠시 후 다시 시도해 주세요.',
  too_short: '댓글이 너무 짧아요.',
  too_long: '댓글이 너무 길어요.',
  no_nickname: '이름을 입력해 주세요.',
  unknown: '댓글을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.',
}

/** The same copy in English, for the /en tree. */
export const REJECTION_MESSAGES_EN: Record<RejectionReason, string> = {
  pii_card: 'That looks like it contains a card number. Please remove it and try again.',
  pii_rrn: 'That looks like it contains a national ID number. Please remove it and try again.',
  pii_phone: 'That looks like it contains a phone number. Please remove it and try again.',
  pii_email: 'That looks like it contains an email address. Please remove it and try again.',
  profanity: 'That contains profanity. Please rephrase and try again.',
  link_spam: 'Too many links. Please leave just one.',
  duplicate: 'A comment with the same content already exists.',
  too_fast: 'A comment was just posted. Please try again shortly.',
  too_short: 'That comment is too short.',
  too_long: 'That comment is too long.',
  no_nickname: 'Please enter a name.',
  unknown: 'Could not post the comment. Please try again shortly.',
}

const MESSAGES_BY_LANG: Record<string, Record<RejectionReason, string>> = {
  ko: REJECTION_MESSAGES,
  en: REJECTION_MESSAGES_EN,
}

/**
 * `lang` defaults to Korean, which is the site's base language — so a caller
 * that has no locale to hand (and the existing tests) keep the original copy.
 */
export function messageFor(reason: RejectionReason, lang = 'ko'): string {
  const messages = MESSAGES_BY_LANG[lang] ?? REJECTION_MESSAGES
  return messages[reason] ?? messages.unknown ?? REJECTION_MESSAGES.unknown
}
