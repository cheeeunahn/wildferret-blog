import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { mintApiJwt, ROLE } from './mint-api-jwt.mjs'

const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString())

describe('mintApiJwt', () => {
  const now = Date.UTC(2026, 9, 4)
  const token = mintApiJwt({ secret: 'test-secret', days: 30, now })
  const [header, payload, signature] = token.split('.')

  it('claims the blog_api role and nothing broader', () => {
    expect(ROLE).toBe('blog_api')
    expect(decode(payload)).toEqual({
      iss: 'supabase',
      role: 'blog_api',
      iat: now / 1000,
      exp: now / 1000 + 30 * 86400,
    })
  })

  it('is HS256-signed with the given secret', () => {
    expect(decode(header)).toEqual({ alg: 'HS256', typ: 'JWT' })
    const expected = createHmac('sha256', 'test-secret')
      .update(`${header}.${payload}`)
      .digest('base64url')
    expect(signature).toBe(expected)
  })

  it('refuses to mint without a secret or with a bad lifetime', () => {
    expect(() => mintApiJwt({ secret: '' })).toThrow(/SUPABASE_JWT_SECRET/)
    expect(() => mintApiJwt({ secret: 's', days: 0 })).toThrow(/days/)
    expect(() => mintApiJwt({ secret: 's', days: Number.NaN })).toThrow(/days/)
  })
})
