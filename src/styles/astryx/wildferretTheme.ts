import { defineTheme } from '@astryxdesign/core/theme'

// The site's Astryx theme. Colors are Astryx's defaults, so the theme sets none;
// it puts NanumBarunGothic in place of Astryx's own font family, raises the
// type scale's base to a reading size, and is the one place later overrides go. Rebuild the CSS with `pnpm theme:build`
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
    // Astryx's default ramp starts at 14px, sized for dense app UI. This is a
    // reading site, so the base is 16px; the 1.2 ratio is Astryx's own, so
    // every step (headings, supporting text) scales up together.
    scale: { base: 16, ratio: 1.2 },
    body: { family: 'NanumBarunGothic', fallbacks: FONT_FALLBACKS },
    heading: { family: 'NanumBarunGothic', fallbacks: FONT_FALLBACKS },
  },
  components: {
    // The large text input is the home page's search box (the only lg one).
    // Astryx's lg is 36px with 4px of vertical padding, which crowds 16px text;
    // 44px gives it room and matches a comfortable touch target.
    'text-input': {
      'size:lg': { height: '44px', paddingInline: '12px' },
    },
  },
})
