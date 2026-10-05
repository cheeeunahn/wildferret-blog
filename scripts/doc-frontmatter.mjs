#!/usr/bin/env node
// Checks that every Markdown doc starts with YAML frontmatter carrying the
// fields its kind requires.
//
//   docs/**/*.md                  title (= the H1), status, date (YYYY-MM-DD)
//   .claude/skills/*/SKILL.md     name (= the folder), description
//
// Every other .md is exempt on purpose: README.md and CLAUDE.md are read by
// tools that would show frontmatter as text, and GitHub pastes the PR
// template into each PR body verbatim.
//
//   pnpm docs:check           report, exit 1 on any problem
//   pnpm docs:check <files>   check only these (lefthook passes staged files)
import { readFileSync, globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const STATUSES = ['Draft', 'Proposed', 'Accepted', 'Superseded', 'Deprecated']

/** Which frontmatter rules a repo-relative path falls under, or null if exempt. */
export function kindOf(rel) {
  if (/^docs\/.+\.md$/.test(rel)) return 'doc'
  if (/^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(rel)) return 'skill'
  return null
}

/**
 * The leading `---` block as flat `key: value` pairs. Only top-level scalars
 * are read — enough for the fields checked here, without a YAML dependency.
 * Returns null when the file does not open with frontmatter.
 */
export function readFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
  if (!match) return null
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) continue
    fields[pair[1]] = pair[2].replace(/^(['"])(.*)\1$/, '$2').trim()
  }
  return { fields, body: text.slice(match[0].length) }
}

/** Problems with one file, as messages. Empty when it passes or is exempt. */
export function check(rel, text) {
  const kind = kindOf(rel)
  if (!kind) return []
  const fm = readFrontmatter(text)
  if (!fm) return ['missing frontmatter (the file must open with a --- block)']

  const { fields, body } = fm
  const problems = []
  const need = (key) => {
    if (!fields[key]) problems.push(`missing \`${key}\``)
    return fields[key]
  }

  if (kind === 'doc') {
    const title = need('title')
    const h1 = /^# (.+)$/m.exec(body)?.[1].trim()
    if (title && h1 && title !== h1) problems.push(`\`title\` does not match the H1 "${h1}"`)
    const status = need('status')
    if (status && !STATUSES.includes(status)) {
      problems.push(`\`status\` must be one of ${STATUSES.join(', ')}`)
    }
    const date = need('date')
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) problems.push('`date` must be YYYY-MM-DD')
  }
  if (kind === 'skill') {
    const name = need('name')
    const folder = rel.split('/')[2]
    if (name && name !== folder) problems.push(`\`name\` must be the folder name "${folder}"`)
    need('description')
  }
  return problems
}

/** Every repo-relative .md path that falls under a rule. */
export function governedFiles() {
  return globSync(['docs/**/*.md', '.claude/skills/*/SKILL.md'], {
    cwd: root,
  }).sort()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const files = args.length
    ? args.map((f) => path.relative(root, path.resolve(f))).filter(kindOf)
    : governedFiles()
  let failed = 0
  for (const rel of files) {
    const problems = check(rel, readFileSync(path.join(root, rel), 'utf8'))
    if (!problems.length) continue
    failed++
    for (const p of problems) console.error(`${rel}: ${p}`)
  }
  if (failed) {
    console.error(`\n${failed} doc(s) with frontmatter problems — see scripts/doc-frontmatter.mjs`)
    process.exit(1)
  }
  console.log(`frontmatter ok (${files.length} file(s))`)
}
