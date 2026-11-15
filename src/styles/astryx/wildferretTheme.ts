import { defineTheme } from '@astryxdesign/core/theme'
import { indigoAccentTokens, stoneColorTokens, stoneSyntax } from './stoneColors'

// The site's Astryx theme. Its colors, light and dark, are Astryx's shipped
// "stone" theme (stoneColors.ts); its fonts, type scale and everything else are
// our own. It puts NanumSquareNeo in place of Astryx's own font family, raises
// the type scale's base to a reading size, and is the one place later
// overrides go. Rebuild the CSS with `pnpm theme:build` after editing. The
// decisions behind it are ADRs 0002, 0003, 0005, 0006 and 0007 in docs/adr/.

// global.css's --font-body stack minus its first entry, which is the family itself.
// The @font-face declarations stay in global.css; the theme only names the family.
const FONT_FALLBACKS =
  "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, " +
  "'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', " +
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"

// Article reading type: a step under body size, on a tall line. NanumSquareNeo
// is wide and fills its em box, so 16px paragraphs on a 1.75 line read dense;
// 15px on 1.9 keeps about the same line pitch (28.5px) and gives the space to
// the gap between lines.
const PROSE = { fontSize: '0.9375rem', lineHeight: '1.9' }

export const wildferretTheme = defineTheme({
  name: 'wildferret',
  // Stone's colors, with a muted indigo accent of our own on top.
  tokens: { ...stoneColorTokens, ...indigoAccentTokens },
  syntax: stoneSyntax,
  typography: {
    // Astryx's default ramp starts at 14px, sized for dense app UI. This is a
    // reading site, so the base is 16px; the 1.2 ratio is Astryx's own, so
    // every step (headings, supporting text) scales up together.
    scale: { base: 16, ratio: 1.2 },
    body: { family: 'NanumSquareNeo', fallbacks: FONT_FALLBACKS },
    heading: { family: 'NanumSquareNeo', fallbacks: FONT_FALLBACKS },
  },
  components: {
    // Two text types the site needs and Astryx's ramp does not have. Defining
    // them here keeps components on <Text type="…"> instead of per-component
    // size and line-height overrides.
    text: {
      // Long Korean prose (PROSE above): article paragraphs and quotes, and the
      // AI summary's sentences.
      'type:prose': PROSE,
      // Between supporting (13px) and body (16px): the about page's rows.
      'type:compact': { fontSize: '0.9375rem', lineHeight: '1.5' },
    },
    // Article lists render through Astryx's Markdown (ArticleMarkdown.tsx) and
    // take the prose size and line height too. Each item's text, links, bold
    // and inline code size themselves from the body and code tokens rather
    // than inheriting from the list, so the list redefines those tokens for
    // everything inside it. Without --text-body-leading, an item that wraps
    // keeps Astryx's 1.5 line height.
    'markdown-list': {
      base: {
        ...PROSE,
        '--text-body-size': PROSE.fontSize,
        '--text-body-leading': PROSE.lineHeight,
        '--text-code-size': PROSE.fontSize,
      },
    },
    // Article tables and code blocks: the prose size, so neither reads larger
    // than the paragraphs around it. They keep their own, denser line heights.
    'table-cell': {
      base: { fontSize: PROSE.fontSize },
    },
    'table-header-cell': {
      base: { fontSize: PROSE.fontSize },
    },
    'code-block': {
      base: { '--text-code-size': PROSE.fontSize },
    },
    // The large text input is the home page's search box (the only lg one).
    // Astryx's lg is 36px with 4px of vertical padding, which crowds 16px text;
    // 44px gives it room and matches a comfortable touch target.
    'text-input': {
      'size:lg': { height: '44px', paddingInline: '12px' },
    },
  },
})
