---
description: Bring README.md and CLAUDE.md back in step with the repo after a structural change — the files, scripts, islands or external hosts they describe.
allowed-tools: Bash(node scripts/docs-sync.mjs:*), Bash(pnpm exec prettier:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Read, Edit, Grep, Glob
---

Update `README.md` and `CLAUDE.md` so that everything they say about this repo is
true again. Edit only those two files: you are syncing the docs to the code,
never the code to the docs.

## 1. Find the work

Run:

```bash
node scripts/docs-sync.mjs --json
```

It reports four lists:

- `changes` — what changed shape since the docs were last reviewed: tracked
  `files`, package `scripts`, `dependencies` (names only), `islands` (with their
  `client:*` directive), and external `hosts`. Each has `added` and `removed`.
  **This is your work list.**
- `unnoted` — entries in a generated block that have no prose yet (a tree
  entry with no `# note`, a script with no description, an island with no "why").
- `stale` — docs whose generated blocks are out of date. `--write` fixes these;
  you never edit a block's rows by hand.
- `problems` — a doc is missing a block's markers. Restore the markers.

If all four are empty, there is nothing to do: say so and stop without touching
a file. $ARGUMENTS may name a narrower focus (a file, a feature); if it does,
still run the scan, but limit your prose review to that area.

## 2. Understand each change before writing about it

For every entry in `changes`, open the file (or `package.json`,
`eslint.config.js`, `src/layouts/Base.astro`, …) and find out what it is and
why it exists — read its header comment, `git log -3 -- <path>`, and
`git diff` against the last commit that touched the snapshot
(`git log -1 --format=%H -- docs/docs-sync.snapshot.json`). A removed file
matters as much as an added one: anything the docs say about it is now false.

Then search both docs (`Grep`) for every mention of the thing that changed —
its file name, its component name, the script, the host — and decide, for each
mention, whether it is still true.

## 3. Edit the prose

The two docs have different readers. Keep each in its lane:

- **README.md** is for a person landing on the repo: what the site is, how to
  run it, where things live, how to write a post. Overview level. It links to
  CLAUDE.md and the ADRs for detail rather than repeating them.
- **CLAUDE.md** is for an agent (or person) about to change the code: the rules
  that are easy to break, _why_ they exist, and the traps. Every statement there
  is an instruction someone will follow, so a stale one is worse than a missing
  one.

Rules for both:

- Change only what a change made wrong or incomplete. Do not rewrite a passage
  that is still accurate, reorder sections, or "improve" wording you were not
  sent to fix.
- Match the voice already there: plain, concrete, short sentences; code
  identifiers in backticks; no marketing.
- Do not document what the code says better (signatures, every prop). Document
  rules, reasons, and where things live.
- Never edit the ADRs in `docs/adr/` — they are records of decisions as made.
  If a change contradicts an accepted ADR, say so in your summary instead.
- Never write a secret, token, or personal data into either doc.

**Generated blocks** (between `<!-- docs:<name>:start -->` and
`<!-- docs:<name>:end -->`): their rows come from the code, but their prose
cells are yours and are kept across rebuilds. For every `unnoted` entry, write
that cell — a tree entry's `# note`, a script's description, an island's
"why" — in the same style as its neighbours, then let `--write` realign the
block. A note says what the thing _is for_, in under ~70 characters.

## 4. Rebuild, record, verify

```bash
node scripts/docs-sync.mjs --write    # realign the generated blocks
node scripts/docs-sync.mjs --accept   # record that the docs now match this shape
node scripts/docs-sync.mjs            # must print the ✓ line and exit 0
pnpm exec prettier --check README.md CLAUDE.md docs/docs-sync.snapshot.json
```

Run `--accept` only after you have reviewed every entry in `changes`. It is the
statement "a reviewer has checked the docs against this exact repo shape"; it
is what keeps the hook and the workflow from running again.

## 5. Report

End with a short summary: one bullet per doc edit (what was wrong, what it says
now), then a **Needs a human** list for anything you could not settle — a
change whose purpose you could not work out, an ADR the change contradicts, a
doc statement you suspect is wrong but could not verify. If the workflow asked
for a summary file, write the same text there.
