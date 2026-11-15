---
description: Check a change for comments it made untrue and code it left with no use. Read-only — it reports, it never edits.
allowed-tools: Bash(git diff:*), Bash(git show:*), Bash(git log:*), Bash(git grep:*), Bash(git ls-files:*), Read, Grep, Glob
---

Review a change for two things only: comments it made untrue, and code it left
with no reason to exist. You report; you never edit a file. The pre-commit hook
(`scripts/stale-check.mjs`) runs this on every commit that touches code, and a
finding stops the commit.

## 1. Read the change

$ARGUMENTS lists the paths to review. Read their staged diff with context:

```bash
git diff --cached -U10 -- <paths>
```

With no paths, review everything staged (`git diff --cached`). If nothing is
staged, review the uncommitted change (`git diff HEAD`) instead.

The staged diff is the change. A file on disk can hold unstaged edits that are
not part of it, so when you review staged work, read a changed file's staged
version with `git show :<path>`, not the working tree.

## 2. Stale comments

A comment is stale when, after this change, it no longer tells the truth about
the code. Look in three places:

- **The changed hunks:** a comment added or kept next to code that now does
  something else.
- **The rest of each changed file:** a header comment, a doc comment, or a note
  above a function whose behaviour, parameters, return value, defaults or list
  of cases the change altered.
- **The rest of the repo:** for every symbol, file, script, env var, CSS class,
  constant or value the change renamed, removed or changed, search
  (`git grep -n`) for comments that still describe the old one. `CLAUDE.md` and
  `README.md` count: a rule there that the change made false is a stale
  comment, and a worse one, because people follow those as instructions.

A comment is any prose that describes code: `//`, `/* */`, JSDoc, `#` in YAML
and shell, `<!-- -->` and `{/* */}` in templates, a lint rule's `description`
and `messages`, and log or error text that states behaviour ("skip with X=0").

Do not report:

- Anything in `docs/adr/`. ADRs record decisions as they were made and are
  never rewritten.
- Article bodies and copy under `src/data/`.
- A comment that is merely terse or could be worded better, or a missing one.

## 3. Unnecessary code

Code is unnecessary when, after this change, nothing needs it:

- An import, variable, function, type, constant, CSS rule or class, or config
  entry (an `optimizeDeps.include` entry, an island allowlist entry, a
  `.gitignore` line) that nothing references any more: the change removed its
  last user, or added it unused.
- An `export` on something no other file imports. This repo removes those.
- A branch, case, fallback or guard for a state the change made impossible.
- A workaround whose reason the change removed. The comment explaining it
  usually names what it worked around.
- Commented-out code, and debugging leftovers: `debugger`, or a `console.log`
  that dumps internal state rather than telling the user something (the
  `log()` helpers in `scripts/` are deliberate).

Do not report:

- Something only a test, a lint rule or a script uses. That is a use.
- Names that Astro or a tool reads by convention: `getStaticPaths`,
  `prerender`, a page's or config's default export, a lint rule's
  `meta`/`create`, a workflow's `meta`.
- Style, naming, simplification, refactoring, performance or bugs. Other checks
  own those.

## 4. Report only what you verified

Every finding stops a commit, so a false one costs more than a missed one.
Before you report anything:

- For a stale comment, find the exact code that contradicts it. If you cannot
  point at the contradiction, drop it.
- For unnecessary code, run the search that shows nothing uses it, across
  `.astro` templates, CSS, config and scripts as well as TypeScript. If the
  search finds a use, or the name could be reached in a way a search cannot see
  (built from a string, read by a tool), drop it.
- Report each problem once, at the line where it should be fixed.

An empty list is a valid answer, and the common one: most changes leave nothing
stale.

## 5. Answer

For each finding give:

- `file`: the repo-relative path.
- `line`: the line number in the staged version of that file (the working tree,
  for a file outside the change).
- `kind`: `stale-comment` or `unnecessary-code`.
- `summary`: one sentence saying what is wrong and how you know: the code that
  contradicts the comment, or the search that found no use.
- `fix`: one sentence: the corrected wording, or what to delete.

If you were given a JSON schema, answer in it. Otherwise list each finding as
`path:line — summary` with its fix underneath, or say "Nothing stale." Do not
edit any file: say what to change and stop.
