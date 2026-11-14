# ADR 0004: Remove the comment section and the Supabase integration

- Status: Proposed (on `fix/scroll-and-ui-tweaks`, PR #64)
- Date: 2026-11-14
- Supersedes: [ADR 0001](0001-layered-architecture.md) decisions 3 and 5 (the comments server layer, and the public schema SQL), and the comments parts of decision 1. The layer split itself stands.

## Context

ADR 0001 gave comments a real server layer: `GET/POST /api/comments` on the Worker, a least-privilege `blog_api` role, a role JWT held as a Worker secret, and moderation run in the browser, the service and a database trigger. It was the only reason any route ran as Worker code, and it brought:

- three runtime secrets to set and rotate (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_API_JWT`, the JWT expiring yearly);
- a Supabase project, four migrations applied by hand, and a profanity list maintained from its dashboard;
- the `Comments` island on every article, with its Astryx `TextInput`/`TextArea`/`Button` chunk;
- a stored-XSS surface, which shaped a lint rule (`no-unescaped-user-html`) and a section of CLAUDE.md.

The comment section is not wanted on the blog any more.

## Decision

1. **Remove comments end to end.** The `Comments` island, `src/pages/api/comments.ts`, `src/server/comments/`, `src/client/commentsApi.ts`, `src/shared/{comments,moderation}.ts`, `scripts/mint-api-jwt.mjs`, `.dev.vars.example` and `supabase/migrations/` are deleted, with their tests, strings and docs.
2. **Every page is prerendered; no route runs as Worker code.** `@astrojs/cloudflare` stays, because it is how the site deploys as a Worker serving the static files. Removing it would change the deployment, which this decision does not need.
3. **The layer zones stay.** `src/server/` no longer exists, but its zones in `eslint-rules/layer-zones.js` remain, so per-request code that returns starts out isolated (ADR 0001 decision 4 stands).
4. **`no-unescaped-user-html` stays, re-justified.** The AI summary renders model output, which is untrusted text just as comments were, so it must reach the page through React's escaping too.
5. **The external resources are removed by hand, after deploy.** The Worker secrets and the Supabase project are not in the repo. Delete the secrets with `wrangler secret delete` once the new Worker is live, and back up the comments before pausing or deleting the project.

## Consequences

- \+ No secrets, no database, no migrations to apply, nothing to rotate. The site is static files behind a Worker.
- \+ Article pages lose the comments island, so the React runtime loads on an article only where the AI summary hydrates.
- \+ The stored-XSS surface is gone; the remaining untrusted text is the on-device AI summary.
- \+ The SBOM loses the Supabase service and the Worker's request-handling packages.
- − Existing comments are no longer shown, and are lost unless backed up before the project is deleted.
- − Readers have no way to respond on the site.
- − ADR 0001's description of comments, and the TRD's comment requirements, now describe code that is gone. They stay as records.

## Alternatives considered

- **Hide the island but keep the API and database:** rejected; it keeps every operational cost for a feature nobody sees.
- **Replace with a hosted comment widget (giscus, utterances):** not chosen; the goal is no comments, not different ones. It would also add a third-party script and host to the CSP.
- **Drop the Cloudflare adapter and deploy as plain static assets:** deferred. It is possible now that nothing runs per request, but it changes the deployment and is not needed to remove comments.
