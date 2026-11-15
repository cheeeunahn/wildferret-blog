#!/usr/bin/env node
// Run by the lefthook pre-commit hook, after eslint and prettier: Claude Code
// reads the staged change and reports comments it made untrue and code it left
// with no use. A finding stops the commit.
//
// Same split as the post-commit hooks: this script decides whether there is
// anything to review, and Claude runs only when there is. A commit that touches
// no code (docs, article content, generated files) costs nothing. The review
// itself is the /check-stale command (.claude/commands/check-stale.md), which
// you can also run by hand in Claude Code.
//
//   pnpm stale:check                  check what is staged now, without committing
//   STALE_CHECK=0 git commit ...      skip it for one commit (or --no-verify)
//
// It stops a commit only on findings. When the review cannot run (no `claude`
// on PATH, not logged in, a timeout, an answer it cannot read), it says so and
// lets the commit through: a missing tool should not stop you committing.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Files that hold code and comments of ours. */
const REVIEWED = /\.(?:[cm]?js|tsx?|astro|css|ya?ml|jsonc|sh)$/

/** Content and generated files: nothing in them is ours to go stale. */
const SKIPPED = [
  /^src\/data\//, // article bodies and about copy
  /^src\/styles\/astryx\/wildferret\.theme\.css$/, // written by pnpm theme:build
  /^pnpm-lock\.yaml$/,
]

/** Beyond this many changed lines, the review would hold a commit up for minutes. */
const MAX_LINES = 3000

/** A review that has not answered by then is let through, not waited on. */
const TIMEOUT_MS = 5 * 60_000

/** What the review must answer in; see section 5 of check-stale.md. */
const SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          kind: { enum: ['stale-comment', 'unnecessary-code'] },
          summary: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['file', 'line', 'kind', 'summary', 'fix'],
      },
    },
  },
  required: ['findings'],
}

/** The staged paths worth a review. */
export function reviewable(files) {
  return files.filter((f) => REVIEWED.test(f) && !SKIPPED.some((re) => re.test(f)))
}

/** Lines added plus deleted, from `git diff --numstat`. A binary file ('-') counts as 0. */
export function changedLines(numstat) {
  return numstat
    .split('\n')
    .filter(Boolean)
    .reduce((sum, row) => {
      const [added, deleted] = row.split('\t')
      return sum + (Number(added) || 0) + (Number(deleted) || 0)
    }, 0)
}

/** The findings in `claude --output-format json`'s reply, or null if it gave none to trust. */
export function parseReply(stdout) {
  let reply
  try {
    reply = JSON.parse(stdout)
  } catch {
    return null
  }
  if (reply?.is_error || reply?.subtype !== 'success') return null
  const findings = reply.structured_output?.findings
  return Array.isArray(findings) ? findings : null
}

function formatFinding({ file, line, kind, summary, fix }) {
  return `  ${file}:${line}  ${kind}\n    ${summary}\n    → ${fix}`
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const log = (msg) => console.log(`[stale-check] ${msg}`)

/** Exit code: 1 when there are findings, 0 otherwise. */
function main() {
  if (process.env.STALE_CHECK === '0') return 0
  // The workflows' own commits (translations, doc syncs): content, and no login.
  if (process.env.CI) return 0
  // Concluding a merge: the merged commits were checked on their own branch.
  if (existsSync(git('rev-parse', '--git-path', 'MERGE_HEAD'))) return 0

  // --no-renames lists a renamed file under both names, so the review sees the
  // old name too and can look for comments that still use it.
  const staged = git('diff', '--cached', '--name-only', '--no-renames')
  const files = reviewable(staged.split('\n').filter(Boolean))
  if (files.length === 0) return 0

  const lines = changedLines(git('diff', '--cached', '--numstat', '--', ...files))
  if (lines > MAX_LINES) {
    log(`${lines} changed lines are too many to review before a commit — not checked.`)
    log('Split the commit, or review it in Claude Code: claude "/check-stale"')
    return 0
  }

  log(
    `Checking ${files.length} file(s) for stale comments and unused code with Claude Code ` +
      '(skip with STALE_CHECK=0)…',
  )
  const claude = spawnSync(
    'claude',
    [
      '-p',
      `/check-stale ${files.join(' ')}`,
      '--output-format',
      'json',
      '--json-schema',
      JSON.stringify(SCHEMA),
      // Read-only: Edit and Write are not in the tool set at all, and dontAsk
      // refuses any command outside the allowlist instead of prompting.
      '--tools',
      'Read,Grep,Glob,Bash',
      '--allowed-tools',
      'Read,Grep,Glob,Bash(git diff:*),Bash(git show:*),Bash(git log:*),Bash(git grep:*),Bash(git ls-files:*)',
      '--permission-mode',
      'dontAsk',
      // No MCP servers: the review needs none, and one that is slow to connect
      // would hold up every commit.
      '--strict-mcp-config',
      '--no-session-persistence',
      '--max-turns',
      '60',
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
      timeout: TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
    },
  )
  if (claude.error) {
    log(`Could not run claude (${claude.error.code}) — commit not checked.`)
    return 0
  }
  const findings = parseReply(claude.stdout)
  if (findings === null) {
    log(`claude exited with ${claude.status ?? claude.signal} and no answer — commit not checked.`)
    return 0
  }
  if (findings.length === 0) {
    log('✓ Nothing stale.')
    return 0
  }

  log(`${findings.length} finding(s) — commit stopped:\n`)
  console.log(findings.map(formatFinding).join('\n\n') + '\n')
  log('Fix them and commit again. If one is wrong (a model read the change),')
  log('commit anyway with STALE_CHECK=0 git commit …')
  return 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main()
  } catch (err) {
    log(`Failed: ${err.message} — commit not checked.`)
  }
}
