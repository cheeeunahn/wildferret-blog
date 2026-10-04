/**
 * Data access for comments: the only code in the repo that talks to Supabase.
 *
 * Written against PostgREST with plain fetch rather than @supabase/supabase-js —
 * two REST calls do not justify the SDK, and on a Worker every dependency is
 * cold-start weight.
 *
 * Requests are made as the `blog_api` Postgres role (supabase/migrations/
 * 0002_blog_api_role.sql), never as service_role. That role has exactly the
 * privileges anon used to have, so RLS still hides `is_hidden` rows and the
 * column grant still refuses `is_hidden` / `created_at` on insert. The column
 * list and the payload below are narrow too, but they are no longer the only
 * thing standing between a bug here and a leak.
 */

import type { Comment } from '../../shared/comments'

export type { Comment }

export interface NewComment {
  slug: string
  nickname: string
  body: string
}

export interface CommentRepository {
  list(slug: string): Promise<Comment[]>
  insert(comment: NewComment): Promise<Comment>
}

export interface RepositoryConfig {
  /** Project URL, e.g. https://xxxx.supabase.co */
  url: string
  /** The publishable key. The Supabase gateway requires it as `apikey`; it grants nothing on its own. */
  apiKey: string
  /** A JWT whose `role` claim is `blog_api` (scripts/mint-api-jwt.mjs). */
  jwt: string
}

/**
 * A failed PostgREST call. `hint` is the moderation trigger's reason code when
 * there is one (`pii_phone`, `too_fast`, …) and is only ever used as a lookup
 * key. PostgREST's `message` and `details` are deliberately not kept: nothing
 * downstream should be able to put a server-written string in front of a reader.
 */
export class RepositoryError extends Error {
  readonly status: number
  readonly hint: string | null

  constructor(status: number, hint: string | null) {
    super(`PostgREST request failed with ${status}${hint ? ` (${hint})` : ''}`)
    this.name = 'RepositoryError'
    this.status = status
    this.hint = hint
  }
}

const TABLE = 'blog_user_comments'
const COLUMNS = 'id,nickname,body,created_at'

/** Bounded so one response can never be the whole table. */
export const PAGE_SIZE = 200

async function toRepositoryError(res: Response): Promise<RepositoryError> {
  let hint: unknown
  try {
    hint = (await res.json())?.hint
  } catch {
    // Non-JSON body (gateway error, rate limiter): no hint to read.
  }
  return new RepositoryError(res.status, typeof hint === 'string' ? hint : null)
}

export function createCommentRepository(
  config: RepositoryConfig,
  fetchImpl: typeof fetch = fetch,
): CommentRepository {
  const endpoint = `${config.url.replace(/\/+$/, '')}/rest/v1/${TABLE}`
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.jwt}`,
  }

  return {
    async list(slug) {
      const query = new URLSearchParams({
        select: COLUMNS,
        article_slug: `eq.${slug}`,
        order: 'created_at.asc',
        limit: String(PAGE_SIZE),
      })
      const res = await fetchImpl(`${endpoint}?${query}`, { headers })
      if (!res.ok) throw await toRepositoryError(res)
      return (await res.json()) as Comment[]
    },

    async insert({ slug, nickname, body }) {
      const res = await fetchImpl(`${endpoint}?select=${COLUMNS}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        // Only the three granted columns.
        body: JSON.stringify({ article_slug: slug, nickname, body }),
      })
      if (!res.ok) throw await toRepositoryError(res)
      const rows = (await res.json()) as Comment[]
      return rows[0]
    },
  }
}
