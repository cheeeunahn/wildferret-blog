#!/usr/bin/env node
// Mints the JWT the comments Worker uses to reach Supabase as the `blog_api`
// role (supabase/migrations/0002_blog_api_role.sql).
//
//   SUPABASE_JWT_SECRET=... pnpm mint:api-jwt            valid 365 days
//   SUPABASE_JWT_SECRET=... pnpm mint:api-jwt --days 90
//
// The secret is the project's JWT secret (Supabase dashboard > Project
// Settings > JWT Keys — the legacy HS256 shared secret, which must still be
// an accepted signing key). It is read from the environment, never a flag, so
// it does not land in shell history.
//
// Paste the printed token straight into `wrangler secret put SUPABASE_API_JWT`
// and do not store it anywhere else. It grants only what `blog_api` is
// granted, but it is still a credential. Rotate by minting a new one before
// `exp` and putting it again; rotating the JWT secret itself revokes every
// token at once.
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'

export const ROLE = 'blog_api'

const base64url = (input) => Buffer.from(input).toString('base64url')

/** HS256-signed JWT with `role: blog_api`. `now` is injectable for tests. */
export function mintApiJwt({ secret, days = 365, now = Date.now() }) {
  if (!secret) throw new Error('SUPABASE_JWT_SECRET is not set.')
  if (!Number.isFinite(days) || days <= 0) throw new Error('--days must be a positive number.')

  const iat = Math.floor(now / 1000)
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({ iss: 'supabase', role: ROLE, iat, exp: iat + Math.round(days * 86400) }),
  )
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--days')
  const days = i === -1 ? 365 : Number(process.argv[i + 1])
  try {
    process.stdout.write(`${mintApiJwt({ secret: process.env.SUPABASE_JWT_SECRET, days })}\n`)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
