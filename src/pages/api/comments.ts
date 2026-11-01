/**
 * GET  /api/comments?slug=<slug>         → Comment[]
 * POST /api/comments {slug,nickname,body} → Comment (201)
 * Errors: { "reason": <RejectionReason> } with a 4xx/5xx status.
 *
 * The only route that is not prerendered. Everything below the wiring lives in
 * src/server/comments/ (http → service → repository).
 */

import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'
import { articlesIn } from '../../content/service'
import { handleGet, handlePost } from '../../server/comments/http'
import { createCommentRepository } from '../../server/comments/repository'

export const prerender = false

// Every published article is in the Korean index (English is a subset of it).
// Read from article metadata only; no body is loaded.
const KNOWN_SLUGS: ReadonlySet<string> = new Set(articlesIn('ko').map((a) => a.slug))

function repository() {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_API_JWT } = env
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_API_JWT) return null
  return createCommentRepository({
    url: SUPABASE_URL,
    apiKey: SUPABASE_PUBLISHABLE_KEY,
    jwt: SUPABASE_API_JWT,
  })
}

export const GET: APIRoute = ({ url }) => handleGet(url, repository(), KNOWN_SLUGS)
export const POST: APIRoute = ({ request }) => handlePost(request, repository(), KNOWN_SLUGS)
