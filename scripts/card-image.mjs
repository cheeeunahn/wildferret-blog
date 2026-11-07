#!/usr/bin/env node
// Card thumbnails for the home page list: which articles lack one, and drawing
// the missing ones with the Codex CLI's image generation.
//
// Same split as translation-status.mjs: scanCards() decides what needs an
// image, deterministically, and the model is only asked to draw. The style and
// the instructions live in scripts/card-image-prompt.md, the one shared prompt,
// so every card is asked for the same way.
//
//   pnpm card:status                      which articles have no cardImage
//   pnpm card:status --json               { pending, done, problems }
//   pnpm card:generate                    draw every pending card
//   pnpm card:generate <slug> [<slug>…]   draw (or redraw) these
//
// Generating writes public/assets/images/<slug>-card.webp (640×640) and adds
// the cardImage line to that entry in articles.ts. It does not commit; the
// post-commit hook (auto-card-image.mjs) does that, and so do you.
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { splitEntries, stripComments } from './translation-status.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const ARTICLES = 'src/data/articles.ts'
export const IMAGE_DIR = 'public/assets/images'
const KO_DIR = 'src/data/article-content'
const PROMPT = 'scripts/card-image-prompt.md'
const OUTPUT = 'card.png'
const SIZE = 640
const MAX_REFERENCES = 3

export const cardPath = (slug) => `/assets/images/${slug}-card.webp`

/** Articles with no cardImage, and cardImage lines that point at a missing file. */
export function scanCards(
  readFile = (rel) => readFileSync(path.join(root, rel), 'utf8'),
  exists = (rel) => existsSync(path.join(root, rel)),
) {
  const source = stripComments(readFile(ARTICLES))
  const pending = []
  const done = []
  const problems = []

  for (const { slug, text } of splitEntries(source)) {
    const declared = /^\s*cardImage:\s*'([^']+)'/m.exec(text)?.[1]
    if (!declared) {
      pending.push({ slug })
    } else if (!exists(`public${declared}`)) {
      problems.push({
        slug,
        problem: `cardImage points at public${declared}, which does not exist`,
      })
    } else {
      done.push({ slug, cardImage: declared })
    }
  }
  return { pending, done, problems }
}

/**
 * Add (or rewrite) the cardImage line of one entry, right after its category
 * line, where the other entries keep it. Returns the source unchanged when the
 * slug is not found, so the caller can tell.
 */
export function setCardImage(source, slug, image = cardPath(slug)) {
  // [ \t]*, not \s*: with the m flag \s would also eat newlines, so a match
  // could start on the line above and the slices below would be off by a line.
  const start = source.search(new RegExp(`^[ \\t]*slug:[ \\t]*'${slug}',`, 'm'))
  if (start === -1) return source
  const afterSlugLine = source.indexOf('\n', start) + 1
  const nextSlug = source.slice(afterSlugLine).search(/^[ \t]*slug:[ \t]*'/m)
  const end = nextSlug === -1 ? source.length : afterSlugLine + nextSlug
  let entry = source.slice(start, end)

  if (/^[ \t]*cardImage:/m.test(entry)) {
    entry = entry.replace(/^([ \t]*)cardImage:[ \t]*'[^']*',/m, `$1cardImage: '${image}',`)
  } else {
    entry = entry.replace(/^([ \t]*)(category:[^\n]*\n)/m, `$1$2$1cardImage: '${image}',\n`)
  }
  return source.slice(0, start) + entry + source.slice(end)
}

/**
 * The part of a Korean body worth showing the image model: the leading
 * `## 요약` block when there is one (it states the post's point), otherwise
 * the opening. Template-literal escapes are undone so the model reads prose.
 */
export function excerptOf(moduleSource, limit = 1800) {
  const body = (/=\s*`([\s\S]*)`\s*;?\s*$/.exec(moduleSource)?.[1] ?? moduleSource)
    .replace(/\\`/g, '`')
    .replace(/\\\$/g, '$')
  const summary = /^## 요약\n([\s\S]*?)(?:\n---|\n## )/m.exec(body)?.[1]
  return (summary ?? body).trim().slice(0, limit)
}

/** Fill the {{placeholders}} in the shared prompt. Unknown keys stay visible. */
export function fillPrompt(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match)
}

/** sharp is not our dependency but Astro's; borrow it rather than add a second copy. */
function loadSharp() {
  const fromAstro = createRequire(createRequire(import.meta.url).resolve('astro/package.json'))
  return fromAstro('sharp')
}

function titlesOf(slug) {
  const entry = splitEntries(stripComments(readFileSync(path.join(root, ARTICLES), 'utf8'))).find(
    (e) => e.slug === slug,
  )
  const field = (name) => new RegExp(`^\\s*${name}:\\s*'([^']*)'`, 'm').exec(entry?.text ?? '')?.[1]
  return { title: field('title') ?? slug, subtitle: field('subtitle') ?? '' }
}

/**
 * Draw one card with Codex, save it as the 640px WebP and point articles.ts at
 * it. Returns { ok, message }; it throws only on a bug, never on a failed run.
 */
export async function generateCard(slug, log = console.log) {
  const koFile = path.join(root, KO_DIR, `${slug}.ts`)
  if (!existsSync(koFile)) return { ok: false, message: `no article body at ${KO_DIR}/${slug}.ts` }

  const sharp = loadSharp()
  const work = mkdtempSync(path.join(tmpdir(), `card-${slug}-`))
  try {
    // The existing cards are the style guide. Codex gets up to three as PNG,
    // never including the card being redrawn.
    const refs = readdirSync(path.join(root, IMAGE_DIR))
      .filter((f) => f.endsWith('-card.webp') && f !== `${slug}-card.webp`)
      .slice(0, MAX_REFERENCES)
    const refPngs = []
    for (const f of refs) {
      const out = path.join(work, f.replace(/\.webp$/, '.png'))
      await sharp(path.join(root, IMAGE_DIR, f))
        .png()
        .toFile(out)
      refPngs.push(out)
    }

    const prompt = fillPrompt(readFileSync(path.join(root, PROMPT), 'utf8'), {
      ...titlesOf(slug),
      excerpt: excerptOf(readFileSync(koFile, 'utf8')),
      output: OUTPUT,
    })

    log(`Drawing ${slug} with Codex…`)
    // Codex runs in the scratch folder, not the repo: everything it needs is
    // in the prompt and the attached references, so it has nothing to edit.
    // The prompt goes on stdin because -i takes every following argument.
    const codex = spawnSync(
      'codex',
      [
        'exec',
        '--skip-git-repo-check',
        '-s',
        'workspace-write',
        '-C',
        work,
        '--enable',
        'image_generation',
        ...refPngs.flatMap((p) => ['-i', p]),
        '-',
      ],
      { input: prompt, stdio: ['pipe', 'inherit', 'inherit'], timeout: 10 * 60 * 1000 },
    )
    if (codex.error) return { ok: false, message: `could not run codex (${codex.error.code})` }
    if (codex.status !== 0)
      return { ok: false, message: `codex exited with ${codex.status ?? codex.signal}` }

    const drawn = path.join(work, OUTPUT)
    if (!existsSync(drawn)) return { ok: false, message: `codex did not save ${OUTPUT}` }

    const target = path.join(root, IMAGE_DIR, `${slug}-card.webp`)
    await sharp(drawn).resize(SIZE, SIZE, { fit: 'cover' }).webp({ quality: 80 }).toFile(target)

    const articlesFile = path.join(root, ARTICLES)
    const source = readFileSync(articlesFile, 'utf8')
    const updated = setCardImage(source, slug)
    if (updated === source && !source.includes(cardPath(slug))) {
      return { ok: false, message: `saved the image but found no '${slug}' entry in ${ARTICLES}` }
    }
    writeFileSync(articlesFile, updated)
    return { ok: true, message: `${IMAGE_DIR}/${slug}-card.webp` }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

async function main(args) {
  if (args[0] === '--generate') {
    const slugs = args.length > 1 ? args.slice(1) : scanCards().pending.map((e) => e.slug)
    if (slugs.length === 0) return console.log('Every article has a card image.')
    let failed = 0
    for (const slug of slugs) {
      const { ok, message } = await generateCard(slug)
      console.log(ok ? `✅ ${slug}: ${message}` : `❌ ${slug}: ${message}`)
      if (!ok) failed++
    }
    console.log('\nLook at each image before you commit it.')
    process.exit(failed ? 1 : 0)
  }

  const result = scanCards()
  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log(`✅ with a card: ${result.done.length}`)
    console.log(`\n🕗 no card image: ${result.pending.length}`)
    for (const { slug } of result.pending) console.log(`   ${slug}`)
    if (result.problems.length) {
      console.log(`\n❌ problems: ${result.problems.length}`)
      for (const { slug, problem } of result.problems) console.log(`   ${slug}: ${problem}`)
    }
    if (result.pending.length) console.log('\nRun `pnpm card:generate` to draw the missing ones.')
  }
  process.exit(result.problems.length ? 1 : 0)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2))
}
