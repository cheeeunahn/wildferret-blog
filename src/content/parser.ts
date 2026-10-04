import { resolveAssetUrl } from '../shared/assetUrl'

export interface ArticleImage {
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
 * markup (`**bold**`, `` `code` ``, links); the renderer passes them through
 * formatInline. Heading and code text is plain and rendered escaped.
 */
export type ArticleBlock =
  | { type: 'divider' }
  | { type: 'code'; lang: string; code: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'carousel'; slides: ArticleImage[]; caption?: string }
  | { type: 'image'; image: ArticleImage }
  | { type: 'paragraph'; text: string }

export interface ArticleSummary {
  /** The heading text, used as the card label (TL;DR, 핵심 요약, Key takeaways…). */
  label: string
  items: string[]
}

export interface ArticleBody {
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

  return {
    summary: hasSummary ? { label: summaryHeading!, items: bulletItems(allBlocks[1]) } : null,
    blocks: rest.map(classifyBlock),
  }
}

/**
 * Decide what one trimmed block is. The checks are order-dependent: table
 * detection must stay after list detection, and the single-image check after
 * the carousel check.
 */
export function classifyBlock(block: string): ArticleBlock {
  if (block === '---') return { type: 'divider' }

  if (block.startsWith('~~~')) {
    const lines = block.split('\n')
    const lang = lines[0].match(/^~~~(\w+)?$/)?.[1] || ''
    return { type: 'code', lang, code: lines.slice(1, lines.length - 1).join('\n') }
  }

  if (block.startsWith('### '))
    return { type: 'heading', level: 3, text: block.replace('### ', '') }
  if (block.startsWith('## ')) return { type: 'heading', level: 2, text: block.replace('## ', '') }

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

  // Consecutive image lines in one block (no blank line between them) are one
  // carousel sharing a single caption, taken from the first line that has one.
  const images = lines.map(parseImageLine)
  if (lines.length > 1 && images.every((img) => img !== null)) {
    const slides = images as ArticleImage[]
    return { type: 'carousel', slides, caption: slides.find((s) => s.caption)?.caption }
  }

  const image = parseImageLine(block)
  if (image) return { type: 'image', image }

  return { type: 'paragraph', text: block }
}

export function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label: string, href: string) => {
      const safeHref = toSafeHref(href)
      return `<a href="${safeHref}" class="text-accent underline underline-offset-4 decoration-accent/35 hover:text-accent-strong hover:decoration-accent/70 transition-colors">${label}</a>`
    })
    .replace(
      /`(.+?)`/g,
      (_, code: string) =>
        `<code class="px-1.5 py-0.5 bg-ink-50 rounded text-[14px] font-mono text-copper">${code}</code>`,
    )
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
  if (href.startsWith('/')) return resolveAssetUrl(href)
  if (/^https?:\/\//.test(href)) return href
  return '#'
}
