import { Markdown } from '@astryxdesign/core/Markdown'

/**
 * Astryx's Markdown, for the parts of an article body it styles better than
 * hand-built markup (bullet and numbered lists). Rendered statically from
 * ArticleView.astro, never hydrated, so it ships no JavaScript.
 *
 * It exists because Markdown takes its source as a string child, and Astro
 * replaces a React component's children with pre-rendered slot HTML; passed
 * from .astro directly, Markdown receives an element and throws. This wrapper
 * takes the source as a plain prop instead.
 *
 * The input is the site owner's own article text, never reader input.
 */
export default function ArticleMarkdown({ source }: { source: string }) {
  return (
    <Markdown contentWidth="100%" density="compact">
      {source}
    </Markdown>
  )
}
