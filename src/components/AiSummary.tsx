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
  SUMMARY_TIMEOUT_MS,
  toSentences,
  withTimeout,
  writeCachedSummary,
  type Models,
  type Route,
} from '../client/summarizer'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { List, ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'

/**
 * "Summarize with AI" button in the article header, backed by Chrome's
 * on-device Prompt API. Mounted with the custom `client:summarizer`
 * directive (src/directives/summarizer.ts), so it only hydrates where the API
 * exists. Here it still asks `availability()` for this language, and renders
 * nothing unless every model it needs is already on the device (see
 * canSummarize): no download is ever started from a page view. Korean goes through English with the
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
      // The whole run is capped, so a stalled model or browser bug ends in the
      // retry message instead of a button that spins forever.
      const result = await withTimeout(
        (async () => {
          // A cached summary skips the availability check, so a retry after a
          // reload may still have to pick the route.
          const route = routeRef.current ?? (routeRef.current = await pickRoute(lang))
          if (!route) throw new Error('unavailable')
          // Only called when a model is not on the device yet, which the
          // availability check makes rare (see canSummarize).
          const pipeline = await createPipeline(lang, route, modelsRef.current, () =>
            setStatus('downloading'),
          )
          setStatus('summarizing')
          return pipeline.run(readArticleText(), title, setSummary)
        })(),
        SUMMARY_TIMEOUT_MS,
      )
      writeCachedSummary(key, result)
      setStatus('done')
    } catch (err) {
      if (err instanceof NeedsAnotherClick) {
        setStatus('continue')
      } else {
        // Drop any half-streamed text, so a timeout does not leave a partial
        // summary above the retry message.
        setSummary('')
        setStatus('error')
      }
    }
  }

  if (status === 'checking' || status === 'hidden') return null

  const busy = status === 'downloading' || status === 'summarizing'

  const label =
    status === 'downloading'
      ? strings.downloading
      : status === 'summarizing'
        ? strings.summarizing
        : status === 'continue'
          ? strings.continue
          : strings.button

  return (
    <div className="mt-6">
      {(status === 'idle' || status === 'continue' || busy) && (
        // isLoading shows Astryx's spinner, sets aria-busy and blocks a second
        // click while staying focusable.
        <Button label={label} isLoading={busy} onClick={() => void run()} />
      )}

      {status === 'error' && (
        <div role="alert" className="flex flex-wrap items-center gap-2">
          <Text type="supporting" className="text-copper">
            {strings.error}
          </Text>
          <Button label={strings.retry} variant="ghost" size="sm" onClick={() => void run()} />
        </div>
      )}

      {summary && (
        <section aria-label={strings.heading} aria-live="polite" className="mt-4">
          <Card padding={0} className="overflow-hidden">
            <div className="px-4 py-2 border-b border-ink-100 bg-ink-50/60">
              <Text type="supporting">{strings.heading}</Text>
            </div>
            <div className="px-5 py-4">
              {/* Each sentence is a JSX child, so React escapes it. A ReactNode
                  label, not a string, so a long sentence wraps instead of
                  being truncated to one line. */}
              <List listStyle="disc" density="compact" edge="flush">
                {toSentences(summary)
                  .slice(0, MAX_SENTENCES)
                  .map((sentence, i) => (
                    <ListItem key={i} label={<Text type="prose">{sentence}</Text>} />
                  ))}
              </List>
              <Text as="p" display="block" type="supporting" size="xsm" className="mt-3">
                {strings.disclaimer}
              </Text>
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}
