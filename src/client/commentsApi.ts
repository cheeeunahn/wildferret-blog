/**
 * The comment island's only way out of the page: same-origin calls to
 * /api/comments. The browser holds no database URL and no key — those live
 * in the Worker (src/server/comments/).
 */

import type { Comment } from '../shared/comments'
import { isRejectionReason, type RejectionReason } from '../shared/moderation'
import { href } from '../shared/siteUrl'

export type { Comment }

const ENDPOINT = href('/api/comments')

export class CommentError extends Error {
  reason: RejectionReason
  constructor(reason: RejectionReason) {
    super(reason)
    this.name = 'CommentError'
    this.reason = reason
  }
}

/**
 * Reads only `reason`, and only as a lookup key against the known codes.
 * Whatever else the body holds is ignored: the island renders its own copy
 * for a code (messageFor), never a string the server wrote.
 */
async function toCommentError(res: Response): Promise<CommentError> {
  let reason: unknown
  try {
    reason = (await res.json())?.reason
  } catch {
    // Non-JSON body (Cloudflare error page, network middlebox).
  }
  return new CommentError(isRejectionReason(reason) ? reason : 'unknown')
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  const res = await fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
  if (!res.ok) throw await toCommentError(res)
  return (await res.json()) as Comment[]
}

export async function postComment(input: {
  slug: string
  nickname: string
  body: string
}): Promise<Comment> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await toCommentError(res)
  return (await res.json()) as Comment
}
