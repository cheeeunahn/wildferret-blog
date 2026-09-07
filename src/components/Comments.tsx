import { useCallback, useEffect, useRef, useState } from 'react'
import { checkComment, LIMITS, messageFor, type RejectionReason } from '../lib/moderation'
import {
  CommentError,
  fetchComments,
  isConfigured,
  postComment,
  type Comment,
} from '../lib/supabaseComments'

/**
 * The comment island. Mounted client:visible in article/[slug].astro, so the
 * React runtime downloads only once a reader scrolls this far — article pages
 * keep their zero-JS first paint.
 *
 * XSS: every value below is rendered as JSX children so React escapes it.
 * `body` and `nickname` are attacker-controlled text stored verbatim (the
 * moderation trigger is not an XSS filter — <script> passes through it as
 * text). Do not introduce dangerouslySetInnerHTML here, and never run comment
 * text through formatInline/set:html — that parser emits raw HTML on purpose
 * and trusts its input because its input is the site owner. See CLAUDE.md.
 * `local/no-unescaped-user-html` enforces the first half of that.
 */

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

const field =
  'w-full rounded-lg border border-ink-100 bg-surface px-3 py-2 text-ink-900 ' +
  'placeholder:text-ink-400 outline-none transition-colors ' +
  'focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent'

export default function Comments({ articleSlug }: { articleSlug: string }) {
  // Build-time constant, so it can settle during render rather than in an
  // effect — setState in an effect body would cascade a second render.
  const configured = isConfigured()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(configured)
  const [loadFailed, setLoadFailed] = useState(!configured)
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!configured) return
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
  }, [articleSlug, configured])

  const reject = useCallback((reason: RejectionReason) => {
    // Our own copy, keyed by code. The server's message string is never shown.
    setError(messageFor(reason))
    bodyRef.current?.focus()
  }, [])

  const onSubmit = useCallback(
    async () => {
      if (submitting) return
      setError(null)

      // Instant feedback only — the trigger is what actually enforces this.
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
    },
    [articleSlug, body, nickname, reject, submitting],
  )

  if (loadFailed && comments.length === 0) return null

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-lg font-bold text-ink-900 mb-6">
        댓글 {comments.length > 0 && <span className="text-ink-400">{comments.length}</span>}
      </h2>

      {loading ? (
        <p className="text-sm text-ink-500 mb-8">댓글을 불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-500 mb-8">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-5">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-ink-50 pb-5 last:border-b-0">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-sm font-bold text-ink-800">{c.nickname}</span>
                <span className="text-xs text-ink-400">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-700 m-0 whitespace-pre-wrap break-words">
                {c.body}
              </p>
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
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="이름"
          maxLength={LIMITS.nickname}
          aria-label="이름"
          className={`${field} sm:max-w-[200px]`}
        />
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="댓글을 남겨주세요"
          rows={4}
          maxLength={LIMITS.body}
          aria-label="댓글"
          className={`${field} resize-y min-h-[96px]`}
        />

        {error && (
          <p role="alert" className="text-sm text-copper m-0">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-paper transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-default"
          >
            {submitting ? '등록 중…' : '댓글 남기기'}
          </button>
        </div>
      </form>
    </section>
  )
}
