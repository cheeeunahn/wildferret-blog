import { useCallback, useEffect, useRef, useState } from 'react'
import { checkComment, LIMITS, messageFor, type RejectionReason } from '../shared/moderation'
import type { Lang } from '../shared/i18n'
import type { Strings } from '../copy/strings'
import { CommentError, fetchComments, postComment, type Comment } from '../client/commentsApi'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import koKR from '@astryxdesign/core/locales/ko-KR.generated.js'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { TextInput } from '@astryxdesign/core/TextInput'

/**
 * The comment island. Mounted client:visible in ArticleView.astro, so the
 * React runtime downloads only once a reader scrolls this far — article pages
 * keep their zero-JS first paint.
 *
 * UI text arrives as a `strings` prop and the rejection copy is picked by
 * `lang`, so the island renders in the language of the tree that mounted it
 * without bundling every dictionary. A post's thread is keyed by slug alone,
 * so it is shared across /, /kr and /en rather than split per language.
 *
 * XSS: every value below is rendered as JSX children so React escapes it.
 * `body` and `nickname` are attacker-controlled text stored verbatim (the
 * moderation trigger is not an XSS filter — <script> passes through it as
 * text). Do not introduce dangerouslySetInnerHTML here, and never run comment
 * text through formatInline/set:html — that parser emits raw HTML on purpose
 * and trusts its input because its input is the site owner. See CLAUDE.md.
 * `local/no-unescaped-user-html` enforces the first half of that.
 *
 * Controls are Astryx components, themed by the `wildferret` theme on <html>
 * (see docs/trd/astryx-design-system.md). Our labels and placeholders still come from
 * `strings`; only text Astryx renders on its own (counter, status announcements)
 * comes from its catalog. The Korean one is ~6 KB gzipped and is bundled for
 * every reader — acceptable for a client:visible island.
 */

const ASTRYX_LOCALES: Record<Lang, string> = { ko: 'ko-KR', en: 'en' }
const ASTRYX_MESSAGES = { 'ko-KR': koKR }

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

export default function Comments({
  articleSlug,
  strings,
  lang = 'ko',
}: {
  articleSlug: string
  strings: Strings['comments']
  lang?: Lang
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let cancelled = false
    fetchComments(articleSlug)
      .then((rows) => {
        if (!cancelled) setComments(rows)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [articleSlug])

  const reject = useCallback(
    (reason: RejectionReason) => {
      // Our own copy, keyed by code. The server's message string is never shown.
      setError(messageFor(reason, lang))
      bodyRef.current?.focus()
    },
    [lang],
  )

  const onSubmit = useCallback(async () => {
    if (submitting) return
    setError(null)

    // Instant feedback only — the server and the trigger are what enforce this.
    const local = checkComment(nickname, body)
    if (local) {
      reject(local)
      return
    }

    setSubmitting(true)
    try {
      const saved = await postComment({ slug: articleSlug, nickname, body })
      setComments((prev) => [...prev, saved])
      // Keep the nickname so a second comment doesn't need retyping.
      setBody('')
    } catch (err) {
      // The input is deliberately left intact so the reader can edit and retry.
      reject(err instanceof CommentError ? err.reason : 'unknown')
    } finally {
      setSubmitting(false)
    }
  }, [articleSlug, body, nickname, reject, submitting])

  if (loadFailed && comments.length === 0) return null

  return (
    <InternationalizationProvider locale={ASTRYX_LOCALES[lang]} messages={ASTRYX_MESSAGES}>
      <section aria-labelledby="comments-heading">
        <Heading level={2} id="comments-heading" className="mb-6">
          {strings.heading}{' '}
          {comments.length > 0 && (
            <Text type="inherit" color="secondary">
              {comments.length}
            </Text>
          )}
        </Heading>

        {loading ? (
          <Text as="p" display="block" type="supporting" className="mb-8">
            {strings.loading}
          </Text>
        ) : comments.length === 0 ? (
          <Text as="p" display="block" type="supporting" className="mb-8">
            {strings.empty}
          </Text>
        ) : (
          <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-5">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-ink-50 pb-5 last:border-b-0">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <Text type="label" weight="bold">
                    {c.nickname}
                  </Text>
                  <Text type="supporting" size="xsm">
                    {formatDate(c.created_at)}
                  </Text>
                </div>
                <Text as="p" display="block" className="m-0 whitespace-pre-wrap break-words">
                  {c.body}
                </Text>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void onSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <TextInput
            label={strings.nameLabel}
            isLabelHidden
            value={nickname}
            // TextInput has no maxLength; cap here so typing stops at the limit
            onChange={(value) => setNickname(value.slice(0, LIMITS.nickname))}
            placeholder={strings.namePlaceholder}
            width={200}
          />
          <TextArea
            ref={bodyRef}
            label={strings.bodyLabel}
            isLabelHidden
            value={body}
            onChange={setBody}
            placeholder={strings.bodyPlaceholder}
            rows={4}
            // Shows a counter; it does not block input. checkComment() enforces it.
            maxLength={LIMITS.body}
            // Rejections (ours or the server's reason code) show as the field's
            // own error status, announced by Astryx.
            status={error ? { type: 'error', message: error } : undefined}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              label={submitting ? strings.submitting : strings.submit}
              isLoading={submitting}
            />
          </div>
        </form>
      </section>
    </InternationalizationProvider>
  )
}
