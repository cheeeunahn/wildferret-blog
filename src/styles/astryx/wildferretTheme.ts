import { defineTheme } from '@astryxdesign/core/theme'

// The site's Astryx theme. Colors are Astryx's defaults, so the theme sets none;
// it exists to put NanumBarunGothic in place of Astryx's own font family, and
// to be the one place later overrides go. Rebuild the CSS with `pnpm theme:build`
// after editing. See docs/trd/astryx-design-system.md §3.

// global.css's --font-body stack minus its first entry, which is the family itself.
// The @font-face declarations stay in global.css; the theme only names the family.
const FONT_FALLBACKS =
  "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, " +
  "'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', " +
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"

export const wildferretTheme = defineTheme({
  name: 'wildferret',
  typography: {
    body: { family: 'NanumBarunGothic', fallbacks: FONT_FALLBACKS },
    heading: { family: 'NanumBarunGothic', fallbacks: FONT_FALLBACKS },
  },
})
