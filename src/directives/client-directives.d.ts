// A module file (note the import), so the block below augments Astro's types
// rather than replacing the 'astro' module declaration.
import 'astro'

/** The custom hydration directive registered in astro.config.mjs. */
declare module 'astro' {
  interface AstroClientDirectives {
    'client:summarizer'?: boolean
  }
}
