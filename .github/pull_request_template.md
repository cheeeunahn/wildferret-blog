<!-- Use a draft PR until ready for review. Delete optional sections and checklist items that don't apply. -->

## Summary

<!-- What problem does this solve, and what changes for readers or maintainers? One or two sentences. -->

## Related issues

<!-- Optional: Closes #123, related PRs, or background links. -->

## Testing

<!-- List checks actually run and their results (e.g. pnpm build, pnpm lint, pnpm test).
For manual checks, include the route, steps, and expected behavior so reviewers can reproduce them.
Explain any skipped checks. For documentation-only changes, a formatting check is sufficient. -->

## Review notes

<!-- Optional: areas needing close review, known limitations, deployment/migration steps, or a deadline and why it matters. -->

## Screenshots

<!-- For visual changes: before / after, mobile and desktop, light and dark where relevant. Delete otherwise. -->

## Checklist

<!-- Keep only applicable sections and items. Record command results in Testing above. -->

### If this touches pages or components

- [ ] Checked affected routes under `/`, `/kr/`, and `/en/`, including mobile and both themes
- [ ] No user-visible literals in templates; new copy is in `src/copy/strings.ts` for every language
- [ ] Internal links use `localeHref()`, and images use `resolveAssetUrl()`
- [ ] No new `client:*` islands
- [ ] Uses Astryx components where available and Astryx color tokens or existing aliases

### If this adds or edits an article

- [ ] Entry added or updated in `src/data/articles.ts` (newest first)
- [ ] New articles have a `cardImage` at `/assets/images/<slug>-card.webp`
- [ ] English version: written by the translate hook/workflow, or left out on purpose
- [ ] If the Korean was edited after translation, re-ran `/translate-articles <slug>`
- [ ] Any image with Korean text baked in is listed: it stays Korean on `/en/`

### If this touches comments

- [ ] Comment `body` and `nickname` render as JSX children: no `set:html`, no `formatInline`
- [ ] Any schema or moderation change has a migration in `supabase/migrations/`
