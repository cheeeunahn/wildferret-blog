#!/usr/bin/env node
// Run by the lefthook post-commit hook, before auto-translate: commit a new
// Korean article and its card thumbnail follows as a second commit, drawn by
// the Codex CLI from the shared prompt in scripts/card-image-prompt.md.
//
// scanCards() decides; Codex is only started when an article has no
// cardImage. A commit that touches no article costs nothing.
//
//   AUTO_CARD_IMAGE=0 git commit ...   skip it for one commit
//
// It never fails the commit: a post-commit hook cannot undo it anyway, and a
// post with no card image still renders (the card just has no picture).
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { touchesKoreanArticles } from './auto-translate.mjs'
import { ARTICLES, IMAGE_DIR, generateCard, scanCards } from './card-image.mjs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const log = (msg) => console.log(`[auto-card-image] ${msg}`)

/** The files a card commit stages for these slugs: their images and the index. */
export function cardCommitPaths(slugs) {
  return [ARTICLES, ...slugs.map((s) => `${IMAGE_DIR}/${s}-card.webp`)]
}

async function main() {
  // Set on the card commit itself, so its own post-commit is a no-op.
  if (process.env.AUTO_CARD_IMAGE === '0') return

  const inProgress = ['rebase-merge', 'rebase-apply', 'MERGE_HEAD', 'CHERRY_PICK_HEAD']
  if (inProgress.some((p) => existsSync(git('rev-parse', '--git-path', p)))) return

  const changed = git('diff-tree', '--root', '--no-commit-id', '--name-only', '-r', 'HEAD')
  if (!touchesKoreanArticles(changed.split('\n'))) return

  const slugs = scanCards().pending.map((e) => e.slug)
  if (slugs.length === 0) return

  const paths = cardCommitPaths(slugs)
  // The commit below stages these paths wholesale; never sweep up edits of yours.
  if (git('status', '--porcelain', '--', ...paths)) {
    log(`${ARTICLES} or a card image has uncommitted changes — skipping.`)
    log(`Commit or stash them, then run: pnpm card:generate ${slugs.join(' ')}`)
    return
  }

  log(`Drawing card images for ${slugs.join(', ')} with Codex (skip with AUTO_CARD_IMAGE=0)…`)
  const made = []
  for (const slug of slugs) {
    const { ok, message } = await generateCard(slug, log)
    if (ok) made.push(slug)
    else log(`${slug}: ${message} — run \`pnpm card:generate ${slug}\` later.`)
  }
  if (made.length === 0) return

  const madePaths = cardCommitPaths(made)
  git('add', '--', ...madePaths)
  if (spawnSync('git', ['diff', '--cached', '--quiet', '--', ...madePaths]).status === 0) return

  // The other post-commit jobs are switched off for this commit's own hook
  // run; they still run once, after this job, for the outer commit.
  execFileSync(
    'git',
    [
      'commit',
      '-m',
      `content: add card image for ${made.join(' ')}`,
      '-m',
      'Drawn by the Codex CLI from scripts/card-image-prompt.md (scripts/auto-card-image.mjs).',
      '--',
      ...madePaths,
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, AUTO_CARD_IMAGE: '0', AUTO_TRANSLATE: '0', AUTO_SYNC_DOCS: '0' },
    },
  )
  log('Committed. Look at the image before you push.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (err) {
    log(`Failed: ${err.message}`)
  }
}
