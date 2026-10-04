# READY FOR REVIEW / NOT READY

<!-- Keep one. Open as a draft PR while it is NOT READY. -->

## Summary

<!-- TL;DR: what this PR changes and why, in one or two sentences. -->

## Type

- [ ] Content: new or revised article
- [ ] Feature
- [ ] Fix
- [ ] Refactor / chore / CI

## Needed by / urgency

<!-- When this should be merged, and how critical it is. Delete if there's no deadline. -->

## Steps to test

1. `pnpm dev`, then open …
2. …
3. …

## Affected areas

- [ ] Routes: `/` · `/kr/` · `/en/`
- [ ] Articles (which slugs?)
- [ ] Comments / Supabase
- [ ] Build, CI, or deploy (Cloudflare worker)

## Related issues, PRs, and people

<!-- Linked issues (`Closes #123`), related PRs, background on the bug or feature, and anyone to @mention. -->

## Checks

- [ ] `pnpm build` passes (`astro check` + build)
- [ ] `pnpm lint` and `pnpm test` pass
- [ ] Checked the change under `/`, `/kr/` and `/en/`, or it doesn't touch rendered pages

### If this touches pages or components

- [ ] No user-visible literals in templates; new copy is in `src/copy/strings.ts` for every language
- [ ] Internal links use `localeHref()`, and images use `resolveAssetUrl()`
- [ ] No new `client:*` islands
- [ ] Colors use the ink/paper tokens only

### If this adds or edits an article

- [ ] Entry added or updated in `src/data/articles.ts` (newest first)
- [ ] English version: written by the translate hook/workflow, or left out on purpose
- [ ] If the Korean was edited after translation, re-ran `/translate-articles <slug>`
- [ ] Any image with Korean text baked in is listed: it stays Korean on `/en/`

### If this touches comments

- [ ] Comment `body` and `nickname` render as JSX children: no `set:html`, no `formatInline`
- [ ] Any schema or moderation change has a migration in `supabase/migrations/`

## Screenshots

<!-- For visual changes: before / after, light and dark if relevant. Delete if not applicable. -->
