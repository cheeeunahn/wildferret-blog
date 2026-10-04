/**
 * The AiSummary island's access to Chrome's built-in AI (Gemini Nano,
 * on-device): the Prompt API (`LanguageModel`) writes the summary, and the
 * Translator API carries languages the model does not take yet. Nothing here
 * touches the network — the browser downloads and runs the models itself.
 *
 * Why not the Summarizer API: on Chrome 154 it ignores `type`, `length` and
 * `format` — a `tldr`/`short`/`plain-text` request returned 3,000–5,000
 * characters of markdown critiquing the post. The Prompt API, given the
 * instruction below, returns a 2–3 sentence TL;DR in a few seconds.
 *
 * Every call can throw — the APIs are young and their shapes still move
 * between Chrome releases — so the island treats any failure as "show the
 * retry message" or "render nothing", never as a broken page.
 */

import type { Lang } from '../shared/i18n'

/** Statuses that mean a model can work, after a download if need be. */
export function canSummarize(availability: Availability): boolean {
  return availability !== 'unavailable'
}

/**
 * How a summary in `lang` gets made:
 * - `direct`: the model reads and writes `lang` itself
 * - `via-en`: translate the post to English, summarize, translate back. For
 *   languages the model refuses — Korean, as of Chrome 154. Once Chrome
 *   takes the language directly, `pickRoute` returns `direct` with no code change.
 */
export type Route = 'direct' | 'via-en'

/** The most sentences a summary shows; the island drops any beyond this. */
export const MAX_SENTENCES = 5

const LANGUAGE_NAMES: Record<Lang, string> = { ko: 'Korean', en: 'English' }

function systemPrompt(lang: Lang): string {
  return (
    'You summarize blog posts for their readers. Reply with 3 to ' +
    `${MAX_SENTENCES} short sentences, ` +
    'each one a key point the post makes. Start directly with the first point: no ' +
    'introduction such as "Here is a summary". No headings, no lists, no markdown, ' +
    `no feedback on the writing. Write in ${LANGUAGE_NAMES[lang]}.`
  )
}

function modelOptions(lang: Lang): LanguageModelCreateCoreOptions {
  return {
    expectedInputs: [{ type: 'text', languages: [lang] }],
    expectedOutputs: [{ type: 'text', languages: [lang] }],
  }
}

async function available(check: () => Promise<Availability>): Promise<boolean> {
  try {
    return canSummarize(await check())
  } catch {
    return false
  }
}

/** The route to use for `lang` in this browser, or null to hide the button. */
export async function pickRoute(lang: Lang): Promise<Route | null> {
  if (!('LanguageModel' in self)) return null
  if (await available(() => LanguageModel.availability(modelOptions(lang)))) return 'direct'
  if (lang === 'en' || !('Translator' in self)) return null
  const [toEn, fromEn, modelEn] = await Promise.all([
    available(() => Translator.availability({ sourceLanguage: lang, targetLanguage: 'en' })),
    available(() => Translator.availability({ sourceLanguage: 'en', targetLanguage: lang })),
    available(() => LanguageModel.availability(modelOptions('en'))),
  ])
  return toEn && fromEn && modelEn ? 'via-en' : null
}

export interface SummaryPipeline {
  /** Calls `onText` with the summary so far; resolves with the whole of it. */
  run(text: string, title: string, onText: (soFar: string) => void): Promise<string>
}

/**
 * The models created so far. The island keeps this across clicks, because a
 * click can pay for only one download (see `createPipeline`).
 */
export interface Models {
  model?: LanguageModel
  toEn?: Translator
  fromEn?: Translator
}

export function destroyModels(models: Models): void {
  for (const m of [models.model, models.toEn, models.fromEn]) m?.destroy()
}

/**
 * A model still has to be downloaded, but this click was already spent on
 * another download. The next click continues where this one stopped.
 */
export class NeedsAnotherClick extends Error {
  constructor() {
    super('needs another click')
    this.name = 'NeedsAnotherClick'
  }
}

/**
 * Creates the models the route needs, one at a time, into `models`.
 *
 * Chrome lets a click start only one download: the first `create()` of a
 * model that is not on the device yet uses up the gesture, and a second one
 * is refused with `NotAllowedError` — even within the same click. Created one
 * after another, the later models are usually already there by the time their
 * turn comes: the Korean language pack covers both ko→en and en→ko, so the
 * second translator never downloads anything. When two real downloads are
 * needed (the model and a language pack, on a fresh machine), this throws
 * `NeedsAnotherClick` after the first, and the next click picks up from there.
 *
 * `onProgress` gets the current download's fraction, and is called only while
 * something is downloading.
 */
export async function createPipeline(
  lang: Lang,
  route: Route,
  models: Models,
  onProgress: (fraction: number) => void,
): Promise<SummaryPipeline> {
  const monitor = (m: CreateMonitor) => {
    m.addEventListener('downloadprogress', (e) => onProgress(e.loaded))
  }
  const make = async <T>(create: () => Promise<T>): Promise<T> => {
    try {
      return await create()
    } catch (err) {
      throw err instanceof DOMException && err.name === 'NotAllowedError'
        ? new NeedsAnotherClick()
        : err
    }
  }

  const modelLang = route === 'direct' ? lang : 'en'
  if (route === 'via-en') {
    models.toEn ??= await make(() =>
      Translator.create({ sourceLanguage: lang, targetLanguage: 'en', monitor }),
    )
    models.fromEn ??= await make(() =>
      Translator.create({ sourceLanguage: 'en', targetLanguage: lang, monitor }),
    )
  }
  models.model ??= await make(() =>
    LanguageModel.create({
      ...modelOptions(modelLang),
      initialPrompts: [{ role: 'system', content: systemPrompt(modelLang) }],
      monitor,
    }),
  )

  const { model, toEn, fromEn } = models
  if (route === 'direct' || !toEn || !fromEn) {
    return { run: (text, title, onText) => summarizeArticle(model, text, title, onText) }
  }
  return {
    async run(text, title, onText) {
      const [english, englishTitle] = await Promise.all([
        translateParagraphs(toEn, text),
        toEn.translate(title),
      ])
      // The English summary is an intermediate step; only the final
      // translation streams to the reader.
      const englishSummary = await summarizeArticle(model, english, englishTitle, () => {})
      return readStream(fromEn.translateStreaming(englishSummary), onText)
    },
  }
}

/**
 * Translates paragraph by paragraph: each call stays well inside the
 * translator's input quota, and paragraph breaks survive.
 */
export async function translateParagraphs(translator: Translator, text: string): Promise<string> {
  const out: string[] = []
  for (const para of text.split(/\n{2,}/)) out.push(await translator.translate(para))
  return out.join('\n\n')
}

async function readStream(stream: ReadableStream<string>, onText: (soFar: string) => void) {
  let soFar = ''
  const reader = stream.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    soFar += value
    onText(soFar)
  }
  return soFar
}

/**
 * Splits `text` into pieces of at most `maxChars`, breaking between paragraphs.
 * A single paragraph longer than the limit is cut on its own.
 */
export function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = []
  let current = ''
  for (const para of text.split(/\n{2,}/)) {
    if (current && current.length + para.length + 2 > maxChars) {
      chunks.push(current)
      current = ''
    }
    if (para.length > maxChars) {
      for (let i = 0; i < para.length; i += maxChars) chunks.push(para.slice(i, i + maxChars))
      continue
    }
    current = current ? `${current}\n\n${para}` : para
  }
  if (current) chunks.push(current)
  return chunks
}

/**
 * Streams a summary of `text`, calling `onText` with the full text so far.
 *
 * Each prompt runs in a fresh clone of `model`, so earlier prompts never leak
 * into a later summary. A post longer than the model's context window is
 * summarized in pieces first, and the piece summaries are then summarized
 * together — so only the final pass streams.
 */
export async function summarizeArticle(
  model: LanguageModel,
  text: string,
  title: string,
  onText: (soFar: string) => void,
): Promise<string> {
  let input = text
  const usage = await model.measureContextUsage(articlePrompt(title, input))
  const limit = model.contextWindow * 0.75 // room for the system prompt and the answer
  if (usage > limit) {
    // Usage is in tokens, not characters; scale by the measured ratio and leave
    // headroom, since token density varies across a post.
    const maxChars = Math.floor((text.length * limit * 0.8) / usage)
    const parts: string[] = []
    for (const chunk of chunkText(text, maxChars)) {
      parts.push(await ask(model, articlePrompt(title, chunk), () => {}))
    }
    input = parts.join('\n\n')
  }
  return ask(model, articlePrompt(title, input), onText)
}

async function ask(model: LanguageModel, prompt: string, onText: (soFar: string) => void) {
  const session = await model.clone()
  try {
    const raw = await readStream(session.promptStreaming(prompt), (soFar) =>
      onText(toPlainText(soFar)),
    )
    return toPlainText(raw)
  } finally {
    session.destroy()
  }
}

function articlePrompt(title: string, body: string): string {
  return `Title: ${title}\n\nBlog post:\n\n${body}`
}

/**
 * Plain prose out of whatever the model wrote. Gemini Nano drifts into
 * markdown (`## Summary`, `**bold**`, `* bullets`) even when told not to, and
 * the summary is rendered as text — so the markers would show up raw.
 */
export function toPlainText(text: string): string {
  return text
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*(?:[*+-]|\d+[.)])\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .replace(PREAMBLE, '')
}

/** "Here is a TL;DR of the post:" and the like, which the model adds anyway. */
const PREAMBLE =
  /^(?:here(?:'s| is| are)|this is|below is)\b[^.:\n]*\b(?:tl;?dr|summary|key points)\b[^.:\n]*[.:]\s*/i

/**
 * The summary as sentences, for a bulleted list. Splits after `.`, `!` or `?`
 * followed by whitespace, which holds for Korean (…입니다. 다음…) and English.
 */
export function toSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Text of the rendered article body, as the reader sees it, minus the parts
 * that cost input quota without helping a summary: code blocks and the
 * author-written summary card.
 */
export function readArticleText(): string {
  const body = document.querySelector('[data-article-body]')
  if (!body) return ''
  const copy = body.cloneNode(true) as HTMLElement
  copy.querySelectorAll('pre, [data-summary-card]').forEach((el) => el.remove())
  // One paragraph per top-level block. innerText would do this, but it needs
  // layout, which a detached clone does not have.
  return Array.from(copy.children, (el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n')
}

// --- per-tab cache -----------------------------------------------------------
// sessionStorage can be missing or throw (private windows, blocked site data);
// a failed read or write just means summarizing again.

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

export function cacheKey(lang: Lang, slug: string): string {
  return `ai-summary:v2:${lang}:${slug}`
}

function session(): KeyValueStore | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function readCachedSummary(key: string, store = session()): string | null {
  try {
    return store?.getItem(key) || null
  } catch {
    return null
  }
}

export function writeCachedSummary(key: string, summary: string, store = session()): void {
  try {
    store?.setItem(key, summary)
  } catch {
    // Quota or blocked storage: the summary still shows, it just isn't kept.
  }
}
