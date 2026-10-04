import { describe, expect, it, vi } from 'vitest'
import { createCommentRepository, PAGE_SIZE, RepositoryError } from './repository'

const config = { url: 'https://proj.supabase.co/', apiKey: 'pub-key', jwt: 'api-jwt' }
const row = { id: '1', nickname: 'n', body: 'hello', created_at: '2026-10-04T00:00:00Z' }

function mockFetch(response: Response) {
  return vi.fn<typeof fetch>().mockResolvedValue(response)
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('createCommentRepository', () => {
  it('lists visible-column comments for one slug, oldest first, bounded', async () => {
    const fetchImpl = mockFetch(jsonResponse([row]))
    const rows = await createCommentRepository(config, fetchImpl).list('my-post')

    expect(rows).toEqual([row])
    const [url, init] = fetchImpl.mock.calls[0]
    const parsed = new URL(String(url))
    expect(parsed.origin + parsed.pathname).toBe(
      'https://proj.supabase.co/rest/v1/blog_user_comments',
    )
    expect(parsed.searchParams.get('select')).toBe('id,nickname,body,created_at')
    expect(parsed.searchParams.get('article_slug')).toBe('eq.my-post')
    expect(parsed.searchParams.get('order')).toBe('created_at.asc')
    expect(parsed.searchParams.get('limit')).toBe(String(PAGE_SIZE))
    expect(init?.headers).toMatchObject({ apikey: 'pub-key', Authorization: 'Bearer api-jwt' })
  })

  it('inserts only the three granted columns', async () => {
    const fetchImpl = mockFetch(jsonResponse([row], 201))
    const saved = await createCommentRepository(config, fetchImpl).insert({
      slug: 'my-post',
      nickname: 'n',
      body: 'hello',
    })

    expect(saved).toEqual(row)
    const [, init] = fetchImpl.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      article_slug: 'my-post',
      nickname: 'n',
      body: 'hello',
    })
    expect(init?.headers).toMatchObject({ Prefer: 'return=representation' })
  })

  it('keeps the trigger hint and drops PostgREST message/details', async () => {
    const fetchImpl = mockFetch(
      jsonResponse(
        { hint: 'pii_phone', message: '<img src=x onerror=alert(1)>', details: 'x' },
        400,
      ),
    )
    const err = await createCommentRepository(config, fetchImpl)
      .insert({ slug: 's', nickname: 'n', body: 'b' })
      .catch((e: unknown) => e)

    expect(err).toBeInstanceOf(RepositoryError)
    expect(err).toMatchObject({ status: 400, hint: 'pii_phone' })
    expect(String((err as Error).message)).not.toContain('onerror')
  })

  it('treats a non-JSON failure as having no hint', async () => {
    const fetchImpl = mockFetch(new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(createCommentRepository(config, fetchImpl).list('s')).rejects.toMatchObject({
      status: 502,
      hint: null,
    })
  })
})
