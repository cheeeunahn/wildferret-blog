import { describe, expect, it, vi } from 'vitest'
import * as http from './http'
import { RepositoryError, type CommentRepository } from './repository'

const { MAX_BODY_BYTES } = http
const KNOWN = new Set(['my-post'])
const handleGet = (url: URL, r: CommentRepository | null) => http.handleGet(url, r, KNOWN)
const handlePost = (req: Request, r: CommentRepository | null) => http.handlePost(req, r, KNOWN)

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

  it('answers 400 for a slug that is not a published article', async () => {
    const r = repo()
    const res = await handleGet(url('?slug=made-up'), r)
    expect(res.status).toBe(400)
    expect(r.list).not.toHaveBeenCalled()
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

  it('stops reading a streamed body once it passes the limit', async () => {
    const chunk = new Uint8Array(4096).fill(0x78)
    let pulled = 0
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled++
        controller.enqueue(chunk)
      },
    })
    const r = repo()
    const res = await handlePost(
      new Request('https://blog.example/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stream,
        duplex: 'half',
      } as RequestInit),
      r,
    )
    expect(res.status).toBe(413)
    // An endless stream: anything past limit/chunk + 1 pulls means it buffered on.
    expect(pulled).toBeLessThanOrEqual(MAX_BODY_BYTES / chunk.byteLength + 2)
    expect(r.insert).not.toHaveBeenCalled()
  })

  it('refuses a submission from another origin', async () => {
    const r = repo()
    const res = await handlePost(post(valid, { Origin: 'https://evil.example' }), r)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ reason: 'unknown' })
    expect(r.insert).not.toHaveBeenCalled()
  })

  it('accepts a submission from its own origin', async () => {
    const res = await handlePost(post(valid, { Origin: 'https://blog.example' }), repo())
    expect(res.status).toBe(201)
  })

  it('refuses a body that is not declared as JSON', async () => {
    const r = repo()
    const res = await handlePost(post(valid, { 'Content-Type': 'text/plain' }), r)
    expect(res.status).toBe(415)
    expect(r.insert).not.toHaveBeenCalled()
  })

  it('accepts JSON with a charset parameter', async () => {
    const res = await handlePost(
      post(valid, { 'Content-Type': 'application/json; charset=utf-8' }),
      repo(),
    )
    expect(res.status).toBe(201)
  })
})
