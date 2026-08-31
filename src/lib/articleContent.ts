import { resolveAssetUrl } from './assetUrl'

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

export function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label: string, href: string) => {
      const safeHref = toSafeHref(href)
      return `<a href="${safeHref}" class="text-accent underline underline-offset-4 decoration-accent/35 hover:text-accent-strong hover:decoration-accent/70 transition-colors">${label}</a>`
    })
    .replace(/`(.+?)`/g, (_, code: string) => `<code class="px-1.5 py-0.5 bg-ink-50 rounded text-[14px] font-mono text-copper">${code}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function toSafeHref(href: string): string {
  if (href.startsWith('/')) return resolveAssetUrl(href)
  if (/^https?:\/\//.test(href)) return href
  return '#'
}
