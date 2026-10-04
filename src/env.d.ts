/// <reference types="astro/client" />

/**
 * Worker bindings for /api/comments, read through `env` from
 * `cloudflare:workers`. All three are runtime secrets (`wrangler secret put`,
 * or .dev.vars locally) — none is inlined into the browser bundle. See the
 * Comments > Environment section of CLAUDE.md.
 */
declare namespace Cloudflare {
  interface Env {
    /** Supabase project URL, e.g. https://xxxx.supabase.co */
    SUPABASE_URL?: string
    /** Publishable key — the gateway requires it as `apikey`; it grants nothing after 0003. */
    SUPABASE_PUBLISHABLE_KEY?: string
    /** JWT with role claim `blog_api` (scripts/mint-api-jwt.mjs). Never a service_role key. */
    SUPABASE_API_JWT?: string
  }
}

/**
 * Only `env` is used. Declared here rather than pulling in
 * @cloudflare/workers-types, whose globals would replace the DOM `Response`,
 * `fetch`, etc. for the browser code too.
 */
declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env
}
