import { useEffect, useRef, useState } from 'react'
import type { Lang } from '../shared/i18n'
import type { Strings } from '../copy/strings'
import {
  cacheKey,
  createPipeline,
  destroyModels,
  NeedsAnotherClick,
  pickRoute,
  readArticleText,
  MAX_SENTENCES,
  readCachedSummary,
  toSentences,
  writeCachedSummary,
  type Models,
  type Route,
} from '../client/summarizer'

/**
 * "Summarize with AI" button in the article header, backed by Chrome's
 * on-device Prompt API. Mounted with the custom `client:summarizer`
 * directive (src/directives/summarizer.ts), so it only hydrates where the API
 * exists. Here it still asks `availability()` for this language, and renders
 * nothing unless the models can run. Korean goes through English with the
 * Translator API until Chrome's summarizer takes it (see `Route`).
 *
 * XSS: the summary is model output, so it is untrusted text. It is rendered as
 * a JSX child and React escapes it — never set:html, formatInline or
 * dangerouslySetInnerHTML.
 */

type Status =
  | 'checking'
  | 'hidden'
  | 'idle'
  /** One model downloaded; another needs a fresh click (see createPipeline). */
  | 'continue'
  | 'downloading'
  | 'summarizing'
  | 'done'
  | 'error'

export default function AiSummary({
  slug,
  title,
  lang,
  strings,
}: {
  slug: string
  title: string
  lang: Lang
  strings: Strings['summarizer']
}) {
  const key = cacheKey(lang, slug)
  const [status, setStatus] = useState<Status>('checking')
  const [summary, setSummary] = useState('')
  const routeRef = useRef<Route | null>(null)
  // Kept across clicks: a click can pay for only one model download.
  const modelsRef = useRef<Models>({})

  useEffect(() => {
    let cancelled = false
    // The prerendered shell has no sessionStorage, so the cache is read here
    // rather than in a useState initializer, which would mismatch on hydration.
    const cached = readCachedSummary(key)
    const initial = cached
      ? Promise.resolve({ status: 'done' as const, summary: cached })
      : pickRoute(lang).then((route) => {
          routeRef.current = route
          return { status: route ? ('idle' as const) : ('hidden' as const), summary: '' }
        })
    initial.then((next) => {
      if (cancelled) return
      setSummary(next.summary)
      setStatus(next.status)
    })
    return () => {
      cancelled = true
      destroyModels(modelsRef.current)
      modelsRef.current = {}
    }
  }, [key, lang])

  async function run() {
    setSummary('')
    // Busy straight away: Chrome can take several seconds to report the first
    // download progress, and the button must not look clickable meanwhile.
    setStatus('summarizing')
    try {
      // A cached summary skips the availability check, so a retry after a
      // reload may still have to pick the route.
      const route = routeRef.current ?? (routeRef.current = await pickRoute(lang))
      if (!route) throw new Error('unavailable')
      // Only called when a model is not on the device yet.
      const pipeline = await createPipeline(lang, route, modelsRef.current, () =>
        setStatus('downloading'),
      )
      setStatus('summarizing')
      const result = await pipeline.run(readArticleText(), title, setSummary)
      writeCachedSummary(key, result)
      setStatus('done')
    } catch (err) {
      setStatus(err instanceof NeedsAnotherClick ? 'continue' : 'error')
    }
  }

  if (status === 'checking' || status === 'hidden') return null

  const busy = status === 'downloading' || status === 'summarizing'

  return (
    <div className="mt-6">
      {(status === 'idle' || status === 'continue' || busy) && (
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-surface px-3.5 py-2 text-sm text-ink-800 transition-colors hover:bg-surface-hover hover:border-ink-200 disabled:text-ink-600 disabled:hover:bg-surface disabled:hover:border-ink-100 cursor-pointer disabled:cursor-default"
        >
          {busy && (
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 rounded-full border-2 border-ink-200 border-t-ink-700 motion-safe:animate-spin"
            />
          )}
          {status === 'downloading'
            ? strings.downloading
            : status === 'summarizing'
              ? strings.summarizing
              : status === 'continue'
                ? strings.continue
                : strings.button}
        </button>
      )}

      {status === 'error' && (
        <p role="alert" className="text-sm text-copper m-0">
          {strings.error}{' '}
          <button
            type="button"
            onClick={() => void run()}
            className="underline underline-offset-2 cursor-pointer"
          >
            {strings.retry}
          </button>
        </p>
      )}

      {summary && (
        <section
          aria-label={strings.heading}
          aria-live="polite"
          className="mt-4 rounded-xl border border-ink-100 overflow-hidden"
        >
          <div className="px-4 py-2 border-b border-ink-100 bg-ink-50/60 text-[13px] text-ink-600">
            {strings.heading}
          </div>
          <div className="px-5 py-4">
            {/* Same look as the author-written summary card in ArticleView. */}
            <ul className="list-disc pl-5 m-0 space-y-2.5 marker:text-ink-300 text-ink-700 text-[15px] leading-relaxed break-words">
              {toSentences(summary)
                .slice(0, MAX_SENTENCES)
                .map((sentence, i) => (
                  <li key={i}>{sentence}</li>
                ))}
            </ul>
            <p className="mt-3 mb-0 text-xs text-ink-500">{strings.disclaimer}</p>
          </div>
        </section>
      )}
    </div>
  )
}
