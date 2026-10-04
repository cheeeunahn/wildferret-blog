# ADR 0001: Separate presentation, logic, and data layers

- Status: Proposed
- Date: 2026-10-04
- Tracking: https://github.com/cheeeunahn/wildferret-blog/issues/32

## Context
The blog is an Astro 7 static site on a Cloudflare assets-only Worker. Layer responsibilities are blurred:
- Pages and view components import `src/data` directly (`articles`, `articlesIn`, `localizeArticle`).
- `src/lib` mixes pure logic (`articleContent.ts`, `i18n.ts`, `moderation.ts`), UI copy (`strings.ts`), and a browser database client (`supabaseComments.ts`).
- `src/data` contains query logic, not only data.
- Comments: the browser calls Supabase PostgREST directly with a publishable key inlined at build time. There is no server layer; all comment rules live in the `moderate_comment()` trigger.

The repo is public, so `supabase/migrations/0001_blog_user_comments.sql` is published, including the profanity seed list.

## Decision
1. **Three layers, plus shared helpers**
   - Presentation: `src/pages`, `src/layouts`, `src/components`, `src/styles` (Tailwind, unchanged), `src/copy/strings.ts`. Gets data only through `src/content` services (build time); never imports `src/data` directly. Islands (`.tsx` with `client:*`) talk to the server only through `src/client`.
   - Logic: `src/content/{service,parser}.ts` for articles (runs at build time, so it is named for content, not "server"); `src/server/comments/service.ts` runs per request behind `src/pages/api/comments.ts`. `src/server/` holds only real runtime code.
   - Data: `src/data` (article metadata, bodies, about copy, types — no query functions), `src/server/comments/repository.ts` (the only code that talks to Supabase), `supabase/migrations`.
   - Shared: `src/shared` — pure, environment-agnostic helpers (`i18n`, `siteUrl`, `assetUrl`, `moderation`) usable from any layer.
2. **Articles stay as files**, read at build time. Pages remain prerendered, zero JS. `src/data` paths are unchanged so the translation pipeline keeps working.
3. **Comments get a real server layer** via `@astrojs/cloudflare`: `GET/POST /api/comments`, errors as `{reason}` only. The server connects as a dedicated least-privilege role `blog_api` (same RLS policies and column grants anon has today) using a role JWT held as a Worker secret — never `service_role`. Migration `0002` creates that role and revokes all anon privileges, so the API is the only door while the database still enforces visibility and column rules even if server code is wrong. The DB trigger stays the final authority; the server re-runs `checkComment()`; the browser keeps its pre-check for instant feedback.
4. **Boundaries are enforced by ESLint** import rules, not just convention.
5. **Schema SQL stays public; seed data does not.** The profanity list is maintained from the Supabase dashboard.

## Consequences
- + Each layer can be read and tested on its own; the browser bundle contains no DB URL or key.
- + Direct PostgREST abuse with the old public key stops working.
- + Defense in depth is kept: RLS, column grants, the trigger, and a 3s `statement_timeout` all apply to `blog_api`.
- − The site gains a server runtime (one on-demand route) and a role JWT secret to manage and rotate.
- − More setup than using `service_role` (role, grants, `grant blog_api to authenticator`, JWT).
- − Old commits still contain the seed words (history is not rewritten).

## Alternatives considered
- **Folder reorganisation only, keep browser → Supabase:** clearer folders but no actual logic/server layer and the key stays public.
- **Move moderation from the SQL trigger into TypeScript:** rejected for now; the trigger already protects every write path.
- **Articles in Supabase (build-time or per-request):** rejected; adds publish friction, breaks the translation pipeline, and (per-request) loses static prerendering.
- **`service_role` / secret key on the server:** rejected; it bypasses RLS and grants, making `repository.ts` a single point of failure (violates least privilege).
- **Article logic under `src/server/`:** rejected; it runs at build time, and a pass-through "server" layer would be misleading.
- **Hand-written Worker instead of the Astro adapter:** rejected in favour of one codebase/deploy.
- **Hide the SQL from the repo:** rejected; schema secrecy is not a security control here.
