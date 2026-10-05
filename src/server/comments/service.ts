/**
 * Comment rules, independent of HTTP and of Supabase.
 *
 * Validates what arrives, re-runs the same pre-check the browser runs
 * (`checkComment` from src/shared/moderation.ts — the browser copy is for
 * instant feedback, this one is because the browser is not to be trusted),
 * then hands off to the repository. The moderate_comment() trigger in Postgres
 * remains the final authority: it alone knows the profanity list, duplicate
 * bodies, and the rate limits.
 */

import { checkComment, type RejectionReason } from '../../shared/moderation'
import { RepositoryError, type Comment, type CommentRepository } from './repository'

/**
 * Why a call failed, in terms the transport layer can map to a status:
 * - `invalid`: the request itself is malformed (never sent by our own form)
 * - `rejected`: a well-formed comment that a moderation rule refused
 * - `unavailable`: the database could not be reached or answered unexpectedly
 */
export type Failure = {
  ok: false
  kind: 'invalid' | 'rejected' | 'unavailable'
  reason: RejectionReason
}
export type Result<T> = { ok: true; value: T } | Failure

/** Mirrors the article_slug check constraint on the table. */
const SLUG = /^[a-z0-9-]{1,80}$/

/** Reason codes the trigger raises as a `hint`. Anything else becomes `unknown`. */
const TRIGGER_REASONS: readonly RejectionReason[] = [
  'pii_card',
  'pii_rrn',
  'pii_phone',
  'pii_email',
  'profanity',
  'link_spam',
  'duplicate',
  'too_fast',
]

const invalid: Failure = { ok: false, kind: 'invalid', reason: 'unknown' }

function fromError(err: unknown): Failure {
  if (err instanceof RepositoryError) {
    const reason = TRIGGER_REASONS.find((r) => r === err.hint)
    if (reason) return { ok: false, kind: 'rejected', reason }
  }
  return { ok: false, kind: 'unavailable', reason: 'unknown' }
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && SLUG.test(slug)
}

/**
 * The slugs of published articles. Checked before the database is touched, so a
 * client rotating made-up slugs cannot spread rows (or the per-article cooldown)
 * across threads no page will ever show.
 */
export type KnownSlugs = ReadonlySet<string>

export async function listComments(
  repo: CommentRepository,
  known: KnownSlugs,
  slug: unknown,
): Promise<Result<Comment[]>> {
  if (!isValidSlug(slug) || !known.has(slug)) return invalid
  try {
    return { ok: true, value: await repo.list(slug) }
  } catch (err) {
    return fromError(err)
  }
}

export async function createComment(
  repo: CommentRepository,
  known: KnownSlugs,
  input: unknown,
): Promise<Result<Comment>> {
  if (typeof input !== 'object' || input === null) return invalid
  const { slug, nickname, body } = input as Record<string, unknown>
  if (
    !isValidSlug(slug) ||
    !known.has(slug) ||
    typeof nickname !== 'string' ||
    typeof body !== 'string'
  ) {
    return invalid
  }

  const local = checkComment(nickname, body)
  if (local) return { ok: false, kind: 'rejected', reason: local }

  try {
    return {
      ok: true,
      value: await repo.insert({ slug, nickname: nickname.trim(), body: body.trim() }),
    }
  } catch (err) {
    return fromError(err)
  }
}
