import { describe, expect, it, vi } from 'vitest'
import { RepositoryError, type CommentRepository } from './repository'
import { createComment, listComments } from './service'

const saved = { id: '1', nickname: 'n', body: 'hello there', created_at: '2026-10-04T00:00:00Z' }

function fakeRepo(overrides: Partial<CommentRepository> = {}): CommentRepository {
  return {
    list: vi.fn().mockResolvedValue([saved]),
    insert: vi.fn().mockResolvedValue(saved),
    ...overrides,
  }
}

describe('listComments', () => {
  it('returns the repository rows for a valid slug', async () => {
    expect(await listComments(fakeRepo(), 'my-post')).toEqual({ ok: true, value: [saved] })
  })

  it.each([null, '', 'Has-Caps', 'a/b', '../x', 'x'.repeat(81), 42])(
    'refuses slug %j without touching the database',
    async (slug) => {
      const repo = fakeRepo()
      expect(await listComments(repo, slug)).toEqual({
        ok: false,
        kind: 'invalid',
        reason: 'unknown',
      })
      expect(repo.list).not.toHaveBeenCalled()
    },
  )

  it('reports an unreachable database as unavailable', async () => {
    const repo = fakeRepo({ list: vi.fn().mockRejectedValue(new TypeError('fetch failed')) })
    expect(await listComments(repo, 'my-post')).toMatchObject({ ok: false, kind: 'unavailable' })
  })
})

describe('createComment', () => {
  it('trims and saves a valid comment', async () => {
    const repo = fakeRepo()
    const result = await createComment(repo, {
      slug: 'my-post',
      nickname: ' n ',
      body: ' hello there ',
    })
    expect(result).toEqual({ ok: true, value: saved })
    expect(repo.insert).toHaveBeenCalledWith({
      slug: 'my-post',
      nickname: 'n',
      body: 'hello there',
    })
  })

  it.each([
    null,
    'string',
    { slug: 'my-post', nickname: 'n' },
    { slug: 'my-post', nickname: 1, body: 'hello' },
    { slug: 'BAD SLUG', nickname: 'n', body: 'hello' },
  ])('refuses malformed input %j', async (input) => {
    const repo = fakeRepo()
    expect(await createComment(repo, input)).toMatchObject({ ok: false, kind: 'invalid' })
    expect(repo.insert).not.toHaveBeenCalled()
  })

  it('re-runs the shared pre-check server-side, so a bypassed browser check still fails', async () => {
    const repo = fakeRepo()
    expect(
      await createComment(repo, { slug: 'my-post', nickname: 'n', body: 'call 010-1234-5678' }),
    ).toEqual({ ok: false, kind: 'rejected', reason: 'pii_phone' })
    expect(await createComment(repo, { slug: 'my-post', nickname: '  ', body: 'hello' })).toEqual({
      ok: false,
      kind: 'rejected',
      reason: 'no_nickname',
    })
    expect(repo.insert).not.toHaveBeenCalled()
  })

  it.each(['profanity', 'duplicate', 'too_fast', 'link_spam'])(
    'passes the trigger reason %s through',
    async (hint) => {
      const repo = fakeRepo({ insert: vi.fn().mockRejectedValue(new RepositoryError(400, hint)) })
      expect(
        await createComment(repo, { slug: 'my-post', nickname: 'n', body: 'hello there' }),
      ).toEqual({ ok: false, kind: 'rejected', reason: hint })
    },
  )

  it('never passes an unrecognised hint through', async () => {
    const repo = fakeRepo({
      insert: vi.fn().mockRejectedValue(new RepositoryError(400, '<script>alert(1)</script>')),
    })
    expect(
      await createComment(repo, { slug: 'my-post', nickname: 'n', body: 'hello there' }),
    ).toEqual({ ok: false, kind: 'unavailable', reason: 'unknown' })
  })
})
