/**
 * The custom Text types defined in wildferretTheme.ts (`components.text`), so
 * `<Text type="prose">` and `<Text type="compact">` type-check. Astryx documents
 * this augmentation; `astryx theme build` (CLI 0.6.5) writes the CSS for these
 * types but not this file. Keep the keys in step with the theme.
 */
import '@astryxdesign/core/theme'

declare module '@astryxdesign/core/theme' {
  interface CustomTextTypes {
    /** 15px on a 1.9 line height, for long Korean prose: the article text. */
    prose: true
    /** 15px, between supporting and body: the about page's rows. */
    compact: true
  }
}
