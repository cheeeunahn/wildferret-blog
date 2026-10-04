import { describe, expect, it, vi } from 'vitest'
import { handleGet, handlePost, MAX_BODY_BYTES } from './http'
import { RepositoryError, type CommentRepository } from './repository'

const saved = { id: '1', nickname: 'n', body: 'hello there', created_at: '2026-10-04T00:00:00Z' }

function repo(overrides: Partial<CommentRepository> = {}): CommentRepository {
  return {
    list: vi.fn().mockResolvedValue([saved]),
    insert: vi.fn().mockResolvedValue(saved),
    ...overrides,
  }
}

const url = (query: string) => new URL(`https://blog.example/api/comments${query}`)
const post = (body: string, headers: Record<string, string> = {}) =>
  new Request('https://blog.example/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  })

describe('GET /api/comments', () => {
  it('returns the comments as uncached JSON', async () => {
    const res = await handleGet(url('?slug=my-post'), repo())
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(await res.json()).toEqual([saved])
  })

  it('answers 400 {reason} for a missing slug', async () => {
    const res = await handleGet(url(''), repo())
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ reason: 'unknown' })
  })

  it('answers 503 when the Worker has no Supabase secrets', async () => {
    const res = await handleGet(url('?slug=my-post'), null)
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ reason: 'unknown' })
  })

  it('answers 502 when the database fails', async () => {
    const res = await handleGet(
      url('?slug=my-post'),
      repo({ list: vi.fn().mockRejectedValue(new RepositoryError(500, null)) }),
    )
    expect(res.status).toBe(502)
  })
})

describe('POST /api/comments', () => {
  const valid = JSON.stringify({ slug: 'my-post', nickname: 'n', body: 'hello there' })

  it('creates a comment with 201', async () => {
    const res = await handlePost(post(valid), repo())
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual(saved)
  })

  it('answers 400 for a body that is not JSON', async () => {
    const res = await handlePost(post('not json'), repo())
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ reason: 'unknown' })
  })

  it('answers 422 with only the reason code for a moderation rejection', async () => {
    const res = await handlePost(
      post(valid),
      repo({ insert: vi.fn().mockRejectedValue(new RepositoryError(400, 'profanity')) }),
    )
    expect(res.status).toBe(422)
    expect(await res.json()).toEqual({ reason: 'profanity' })
  })

  it('answers 429 for the rate limit', async () => {
    const res = await handlePost(
      post(valid),
      repo({ insert: vi.fn().mockRejectedValue(new RepositoryError(400, 'too_fast')) }),
    )
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ reason: 'too_fast' })
  })

  it('refuses an oversized body before parsing it', async () => {
    const r = repo()
    const big = JSON.stringify({ slug: 'my-post', nickname: 'n', body: 'x'.repeat(MAX_BODY_BYTES) })
    const res = await handlePost(post(big), r)
    expect(res.status).toBe(413)
    expect(r.insert).not.toHaveBeenCalled()
  })

  it('refuses a body that lies about its Content-Length', async () => {
    const res = await handlePost(
      post(valid, { 'Content-Length': String(MAX_BODY_BYTES + 1) }),
      repo(),
    )
    expect(res.status).toBe(413)
  })
})
