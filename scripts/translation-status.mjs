#!/usr/bin/env node
// Reports which articles have no English version yet, and which ones declare a
// `translations.en` block that does not line up with the file on disk.
//
// This is the deterministic half of the automatic translation pipeline: the
// GitHub workflow in .github/workflows/translate-articles.yml runs it with
// --json to decide whether there is anything for Claude to translate, and the
// `/translate-articles` command runs it to pick its targets. Keeping the
// detection here — rather than in a prompt — means the decision to translate is
// reproducible and reviewable, and the model is only asked to do the writing.
//
//   pnpm translation:status          human-readable report
//   pnpm translation:status --json   { pending, translated, problems }
//
// Exits 1 only on a `problems` entry (a broken reference, which breaks
// `pnpm build`). A merely untranslated post is a normal state — it is left out
// of the English index by design — so it never fails the command.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = 'src/data'
const KO_DIR = `${DATA}/article-content`
const EN_DIR = `${KO_DIR}/en`

/**
 * Drop comments so a commented-out article entry is not reported as pending.
 * Block comments go wholesale; line comments only when `//` opens the line, so
 * a `//` inside a string literal survives.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n')
}

/**
 * Slice `articles.ts` into one text block per entry. Each block runs from its
 * own `slug:` to the next one, which is enough to ask whether that entry
 * carries a `translations.en` block without parsing TypeScript.
 */
function splitEntries(source) {
  const matches = [...source.matchAll(/^\s*slug:\s*'([^']+)'/gm)]
  return matches.map((match, i) => ({
    slug: match[1],
    text: source.slice(match.index, matches[i + 1]?.index ?? source.length),
  }))
}

/** The `en` half of a `translations` block: its import path and export name. */
function readEnTranslation(entryText) {
  const block = /translations:\s*\{[\s\S]*?\ben:\s*\{([\s\S]*?)\n\s{6}\}/.exec(entryText)
  if (!block) return null
  const body = block[1]
  const load = /import\('\.\/article-content\/en\/([^']+)'\)[\s\S]*?\(\{\s*([A-Za-z0-9_$]+)\s*\}\)/.exec(body)
  return {
    title: /title:\s*'([^']*)'|title:\s*"([^"]*)"/.exec(body) !== null,
    module: load?.[1] ?? null,
    exportName: load?.[2] ?? null,
  }
}

export function scan(readFile = (rel) => readFileSync(path.join(root, rel), 'utf8'), exists = (rel) => existsSync(path.join(root, rel))) {
  const source = stripComments(readFile(`${DATA}/articles.ts`))
  const pending = []
  const translated = []
  const problems = []

  for (const { slug, text } of splitEntries(source)) {
    const koFile = `${KO_DIR}/${slug}.ts`
    if (!exists(koFile)) problems.push({ slug, problem: `Korean content file is missing: ${koFile}` })

    const en = readEnTranslation(text)
    const enFile = `${EN_DIR}/${slug}.ts`

    if (!en) {
      // No `translations.en` at all — the post simply has no English version
      // yet. An orphan en/ file means a half-finished translation, which is
      // worth flagging: nothing renders it.
      if (exists(enFile)) {
        problems.push({ slug, problem: `${enFile} exists but articles.ts has no translations.en block for it` })
      }
      pending.push({ slug, koFile, enFile })
      continue
    }

    if (!en.module || !en.exportName) {
      problems.push({ slug, problem: 'translations.en has no readable loadContent import' })
      continue
    }

    const declared = `${EN_DIR}/${en.module}.ts`
    if (!exists(declared)) {
      problems.push({ slug, problem: `translations.en imports ${declared}, which does not exist` })
      continue
    }
    if (!new RegExp(`export const ${en.exportName}\\b`).test(readFile(declared))) {
      problems.push({ slug, problem: `${declared} does not export ${en.exportName}` })
      continue
    }
    if (!en.title) problems.push({ slug, problem: 'translations.en has no title' })

    translated.push({ slug, enFile: declared })
  }

  return { pending, translated, problems }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = scan()

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`✅ translated: ${result.translated.length}`)
    for (const { slug } of result.translated) console.log(`   ${slug}`)
    console.log(`\n🕗 awaiting English: ${result.pending.length}`)
    for (const { slug, koFile } of result.pending) console.log(`   ${slug}  (${koFile})`)
    if (result.problems.length) {
      console.log(`\n❌ problems: ${result.problems.length}`)
      for (const { slug, problem } of result.problems) console.log(`   ${slug}: ${problem}`)
    }
    if (result.pending.length) {
      console.log('\nRun `pnpm translate` (or /translate-articles in Claude Code) to write the missing versions.')
    }
  }

  process.exit(result.problems.length ? 1 : 0)
}
