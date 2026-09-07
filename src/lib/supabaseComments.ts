/**
 * PostgREST client for the comment island, written against fetch directly
 * rather than @supabase/supabase-js.
 *
 * The SDK is ~40kB gzipped for what amounts to two REST calls, and this is the
 * first real JavaScript on article pages — a blog whose whole point is shipping
 * no client runtime should not pay that. Everything the SDK would do for us
 * here (auth, realtime, storage) is unused.
 */

import type { RejectionReason } from './moderation'

export interface Comment {
  id: string
  nickname: string
  body: string
  created_at: string
}

const TABLE = 'blog_user_comments'
const SELECT = 'id,nickname,body,created_at'

/** Bounded so one response can never be the whole table. */
const PAGE_SIZE = 200

const URL_BASE = import.meta.env.PUBLIC_SUPABASE_URL
const ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export class CommentError extends Error {
  reason: RejectionReason
  constructor(reason: RejectionReason) {
    super(reason)
    this.name = 'CommentError'
    this.reason = reason
  }
}

/** True when the build had the env vars; the island renders nothing without them. */
export function isConfigured(): boolean {
  return Boolean(URL_BASE && ANON_KEY)
}

function endpoint(query = ''): string {
  if (!isConfigured()) {
    // PUBLIC_* vars are inlined at build time, so a missing one means the build
    // ran without them — not a runtime blip. Fail loudly instead of firing a
    // request at `undefined/rest/v1/...`.
    throw new Error(
      'Supabase env vars missing: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY at build time.',
    )
  }
  return `${URL_BASE}/rest/v1/${TABLE}${query}`
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    ...extra,
  }
}

/**
 * Maps a PostgREST failure to one of our own reason codes.
 *
 * Only the `hint` is read, and only as a lookup key. The response also carries
 * `message` and `details`, and neither is ever surfaced: rendering a
 * server-supplied string would make the error path an injection channel that
 * bypasses every escaping rule applied to comment bodies.
 */
async function toCommentError(res: Response): Promise<CommentError> {
  let hint: unknown
  try {
    hint = (await res.json())?.hint
  } catch {
    // Non-JSON body (gateway error, rate limiter). Fall through to unknown.
  }
  const known: RejectionReason[] = [
    'pii_card', 'pii_rrn', 'pii_phone', 'pii_email',
    'profanity', 'link_spam', 'duplicate', 'too_fast',
    'too_short', 'too_long',
  ]
  const reason = known.find((r) => r === hint) ?? 'unknown'
  return new CommentError(reason)
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  const query =
    `?select=${SELECT}` +
    `&article_slug=eq.${encodeURIComponent(slug)}` +
    `&order=created_at.asc&limit=${PAGE_SIZE}`

  const res = await fetch(endpoint(query), { headers: headers() })
  if (!res.ok) throw await toCommentError(res)
  return (await res.json()) as Comment[]
}

export async function postComment(input: {
  slug: string
  nickname: string
  body: string
}): Promise<Comment> {
  // Only the three granted columns are sent. is_hidden and created_at are not
  // ours to set — the column-level grant would reject them anyway.
  const res = await fetch(endpoint(`?select=${SELECT}`), {
    method: 'POST',
    headers: headers({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      article_slug: input.slug,
      nickname: input.nickname.trim(),
      body: input.body.trim(),
    }),
  })

  if (!res.ok) throw await toCommentError(res)
  const rows = (await res.json()) as Comment[]
  return rows[0]
}
