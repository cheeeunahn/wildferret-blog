import { resolveAssetUrl } from '../shared/assetUrl'

interface ArticleImage {
  alt: string
  src: string
  caption?: string
}

// Try the caption form first so a source containing literal parentheses remains
// intact, while the final quoted segment is still separated as the caption.
export function parseImageLine(line: string): ArticleImage | null {
  const withCaption = line.match(/^!\[(.*?)\]\((.+)\s+"([\s\S]+)"\)$/)
  if (withCaption) {
    const [, alt, src, caption] = withCaption
    return { alt, src, caption }
  }

  const withoutCaption = line.match(/^!\[(.*?)\]\((.+)\)$/)
  if (withoutCaption) {
    const [, alt, src] = withoutCaption
    return { alt, src }
  }

  return null
}

export function splitContentIntoBlocks(content: string): string[] {
  const blocks: string[] = []
  const lines = content.trim().split('\n')
  let buffer = ''
  let inCode = false

  for (const line of lines) {
    if (line.trim().startsWith('~~~')) {
      if (inCode) {
        buffer += '\n' + line
        blocks.push(buffer.trim())
        buffer = ''
        inCode = false
      } else {
        if (buffer.trim()) {
          blocks.push(...buffer.trim().split('\n\n').filter(Boolean))
        }
        buffer = line
        inCode = true
      }
    } else {
      buffer += (buffer ? '\n' : '') + line
    }
  }

  if (buffer.trim()) {
    blocks.push(...(inCode ? [buffer.trim()] : buffer.trim().split('\n\n').filter(Boolean)))
  }

  return blocks
}

/**
 * One block of an article body, already classified. Text fields hold raw inline
 * markup (`**bold**`, `` `code` ``, links). The renderer passes prose, quotes,
 * table cells and captions through formatInline, and hands list items to
 * Astryx's Markdown (ArticleMarkdown.tsx). Heading and code text is plain and
 * rendered escaped. A heading's `id` is its fragment, so `[text](#id)` in the
 * body or the summary jumps to it.
 */
export type ArticleBlock =
  | { type: 'divider' }
  | { type: 'code'; lang: string; code: string }
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'image'; image: ArticleImage }
  | { type: 'gallery'; images: ArticleImage[] }
  | { type: 'paragraph'; text: string }

interface ArticleSummary {
  /** The heading text, used as the card label (TL;DR, 핵심 요약, Key takeaways…). */
  label: string
  items: string[]
}

interface ArticleBody {
  summary: ArticleSummary | null
  blocks: ArticleBlock[]
}

const isSummaryLabel = (label?: string) =>
  !!label &&
  (/^tl[;,.]?\s?dr$/i.test(label) ||
    label.includes('요약') ||
    /\b(summary|takeaways)\b/i.test(label))

const bulletItems = (block: string) =>
  block
    .split('\n')
    .filter((l) => l.trim().startsWith('- '))
    .map((l) => l.replace(/^-\s+/, ''))

/**
 * Parse an article body into a leading summary (if any) and classified blocks.
 *
 * A leading summary heading plus its bullet list becomes `summary` instead of a
 * heading + list block. The heading text becomes the label, so renaming it in
 * the content keeps working. The divider that follows it in the source is
 * dropped — the summary card's border separates it.
 */
export function parseArticleBody(content: string): ArticleBody {
  const allBlocks = splitContentIntoBlocks(content).map((b) => b.trim())

  const summaryHeading = allBlocks[0]?.match(/^##\s+(.+)$/)?.[1]?.trim()
  const hasSummary = isSummaryLabel(summaryHeading) && !!allBlocks[1]?.startsWith('- ')

  let rest = hasSummary ? allBlocks.slice(2) : allBlocks
  if (hasSummary && rest[0] === '---') rest = rest.slice(1)

  // A repeated heading gets -1, -2… so every fragment still lands on one place.
  const seen = new Map<string, number>()
  const blocks = rest.map(classifyBlock).map((block) => {
    if (block.type !== 'heading') return block
    const n = seen.get(block.id) ?? 0
    seen.set(block.id, n + 1)
    return n ? { ...block, id: `${block.id}-${n}` } : block
  })

  return {
    summary: hasSummary ? { label: summaryHeading!, items: bulletItems(allBlocks[1]) } : null,
    blocks,
  }
}

/**
 * The fragment a heading is linked by, named the way GitHub names heading
 * anchors: lowercased, punctuation dropped, spaces as hyphens. Korean stays as
 * written, so `## 지시 파일 정리 기준` is `#지시-파일-정리-기준`. Renaming a
 * heading renames its fragment; parser.test.ts fails on any in-article
 * `#` link left pointing at nothing.
 */
export function headingId(text: string): string {
  const id = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
  return id || 'section'
}

/**
 * Decide what one trimmed block is. The checks are order-dependent: table
 * detection must stay after list detection.
 */
export function classifyBlock(block: string): ArticleBlock {
  if (block === '---') return { type: 'divider' }

  if (block.startsWith('~~~')) {
    const lines = block.split('\n')
    const lang = lines[0].match(/^~~~(\w+)?$/)?.[1] || ''
    return { type: 'code', lang, code: lines.slice(1, lines.length - 1).join('\n') }
  }

  if (block.startsWith('### ')) {
    const text = block.replace('### ', '')
    return { type: 'heading', level: 3, text, id: headingId(text) }
  }
  if (block.startsWith('## ')) {
    const text = block.replace('## ', '')
    return { type: 'heading', level: 2, text, id: headingId(text) }
  }

  if (block.startsWith('> ')) {
    return { type: 'quote', text: block.replace('> ', '').replace(/^"/, '').replace(/"$/, '') }
  }

  if (block.startsWith('- ')) return { type: 'list', ordered: false, items: bulletItems(block) }

  if (block.match(/^\d\.\s/)) {
    return {
      type: 'list',
      ordered: true,
      items: block.split('\n').map((line) => line.replace(/^\d+\.\s/, '')),
    }
  }

  const lines = block.split('\n').map((l) => l.trim())

  if (lines.length > 1 && lines.every((l) => l.startsWith('|') && l.endsWith('|'))) {
    const dataRows = lines.filter((r) => !r.match(/^\|[\s\-:|]+\|$/))
    const cells = (row: string) =>
      row
        .split('|')
        .filter((c) => c.trim() !== '')
        .map((c) => c.trim())
    return { type: 'table', header: cells(dataRows[0]), rows: dataRows.slice(1).map(cells) }
  }

  // Image lines written together, with no blank line between them, sit side by
  // side as one row, each keeping its own alt text and caption. An image line
  // mixed with text stays a paragraph.
  if (lines.length > 1 && lines.every((l) => parseImageLine(l) !== null)) {
    return { type: 'gallery', images: lines.map((l) => parseImageLine(l)!) }
  }

  const image = parseImageLine(block)
  if (image) return { type: 'image', image }

  return { type: 'paragraph', text: block }
}

// Inline links and code match what Astryx's Markdown renders for the article's
// lists (ArticleMarkdown.tsx), in Astryx tokens: an accent underline for links;
// the code font at the surrounding size, on the muted background, with Astryx's
// inner radius. No type utilities: size and line height come from the Text
// around the markup.
const LINK_CLASS = 'text-accent underline hover:text-accent-strong transition-colors'
const CODE_CLASS =
  'font-(family-name:--font-family-code) px-1 bg-ink-50 rounded-(--radius-inner) text-ink-900'

export function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label: string, href: string) => {
      const safeHref = toSafeHref(href)
      return `<a href="${safeHref}" class="${LINK_CLASS}">${label}</a>`
    })
    .replace(/`(.+?)`/g, (_, code: string) => `<code class="${CODE_CLASS}">${code}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toSafeHref(href: string): string {
  if (href.startsWith('#')) return href
  if (href.startsWith('/')) return resolveAssetUrl(href)
  if (/^https?:\/\//.test(href)) return href
  return '#'
}
