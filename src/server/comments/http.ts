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
import { createComment, listComments, type Failure, type KnownSlugs } from './service'

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

export async function handleGet(url: URL, repo: Repo, known: KnownSlugs): Promise<Response> {
  if (!repo) return error('unknown', 503)
  const result = await listComments(repo, known, url.searchParams.get('slug'))
  return result.ok ? json(result.value) : error(result.reason, statusFor(result))
}

/**
 * Reads the body up to `limit` bytes and gives up the moment it is exceeded,
 * cancelling the stream — so a body sent without Content-Length (or with a
 * false one) is never buffered past the limit. Returns null when too large.
 */
async function readBounded(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

/**
 * Our own page posts same-origin JSON. A browser always sends Origin on a POST,
 * so a different one is another site submitting through a visitor's browser.
 * No Origin means a non-browser client, which the trigger's limits still cover.
 */
function isForeignOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin')
  return origin !== null && origin !== new URL(request.url).origin
}

/** application/json only — text/plain and form bodies are what a cross-site form can send without a preflight. */
function isJson(request: Request): boolean {
  const type = request.headers.get('Content-Type') ?? ''
  return type.split(';')[0].trim().toLowerCase() === 'application/json'
}

export async function handlePost(
  request: Request,
  repo: Repo,
  known: KnownSlugs,
): Promise<Response> {
  if (!repo) return error('unknown', 503)
  if (isForeignOrigin(request)) return error('unknown', 403)
  if (!isJson(request)) return error('unknown', 415)

  const declared = Number(request.headers.get('Content-Length') ?? 0)
  if (declared > MAX_BODY_BYTES) return error('too_long', 413)

  const raw = await readBounded(request, MAX_BODY_BYTES)
  if (raw === null) return error('too_long', 413)

  let input: unknown
  try {
    input = JSON.parse(raw)
  } catch {
    return error('unknown', 400)
  }

  const result = await createComment(repo, known, input)
  return result.ok ? json(result.value, 201) : error(result.reason, statusFor(result))
}
