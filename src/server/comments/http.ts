/**
 * HTTP transport for /api/comments: turns requests into service calls and
 * service results into responses. Kept apart from the Astro route so it can be
 * tested with plain Request objects, without a Worker runtime.
 *
 * Error bodies are always `{ "reason": <RejectionReason> }` and nothing else —
 * the browser maps the code to its own copy (messageFor in src/shared/
 * moderation.ts). No upstream string is ever forwarded.
 */

import type { RejectionReason } from '../../shared/moderation'
import type { CommentRepository } from './repository'
import { createComment, listComments, type Failure } from './service'

/** Twice the longest legal comment, with room for JSON escaping. Anything bigger is not ours. */
export const MAX_BODY_BYTES = 16 * 1024

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  // Comments change; a cached GET would hide a reader's own new comment.
  'Cache-Control': 'no-store',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}

function error(reason: RejectionReason, status: number): Response {
  return json({ reason }, status)
}

function statusFor(failure: Failure): number {
  if (failure.kind === 'invalid') return 400
  if (failure.kind === 'unavailable') return 502
  return failure.reason === 'too_fast' ? 429 : 422
}

/** The route passes null when the Worker is missing its Supabase secrets. */
type Repo = CommentRepository | null

export async function handleGet(url: URL, repo: Repo): Promise<Response> {
  if (!repo) return error('unknown', 503)
  const result = await listComments(repo, url.searchParams.get('slug'))
  return result.ok ? json(result.value) : error(result.reason, statusFor(result))
}

export async function handlePost(request: Request, repo: Repo): Promise<Response> {
  if (!repo) return error('unknown', 503)

  const declared = Number(request.headers.get('Content-Length') ?? 0)
  if (declared > MAX_BODY_BYTES) return error('too_long', 413)

  const raw = await request.text()
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return error('too_long', 413)

  let input: unknown
  try {
    input = JSON.parse(raw)
  } catch {
    return error('unknown', 400)
  }

  const result = await createComment(repo, input)
  return result.ok ? json(result.value, 201) : error(result.reason, statusFor(result))
}
