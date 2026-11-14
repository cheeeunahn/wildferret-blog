// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

// Served at the root of the Cloudflare static worker, so the default base is '/'.
// BASE_PATH overrides it for a build that has to live under a path prefix.
const base = process.env.BASE_PATH ?? '/'

// `client:summarizer`: hydrate only where Chrome's built-in Prompt API
// exists. Used by the AiSummary island; see src/directives/summarizer.ts.
/** @type {import('astro').AstroIntegration} */
const summarizerDirective = {
  name: 'summarizer-directive',
  hooks: {
    'astro:config:setup': ({ addClientDirective }) => {
      addClientDirective({
        name: 'summarizer',
        entrypoint: fileURLToPath(new URL('./src/directives/summarizer.ts', import.meta.url)),
      })
    },
  },
}

export default defineConfig({
  base,
  outDir: './dist',
  // One directory per route: dist/about/index.html, dist/article/<slug>/index.html.
  // The worker resolves extensionless paths to the directory index.
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  // Every page is prerendered; no route opts out with `prerender = false`. The
  // adapter is what deploys the site as a Cloudflare Worker serving those files.
  // No sessions: the blog has no logged-in state, and leaving them on makes the
  // adapter require a SESSION KV namespace that nothing would ever read.
  // No image service: images are plain files in public/, never astro:assets.
  //
  // Left out under Vitest: vitest.config.ts loads this file through
  // getViteConfig, and the adapter's Cloudflare Vite plugin refuses Vitest's
  // Node environment. Unit tests never exercise the Worker runtime anyway.
  adapter: process.env.VITEST ? undefined : cloudflare({ imageService: 'passthrough' }),
  session: false,
  integrations: [react(), summarizerDirective],
  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle every Astryx entry the server renders, up front. Left to be
    // discovered on first request, a new one (e.g. a component added to a page
    // mid-session) re-runs the SSR optimizer while the old bundle is still
    // loaded: Astryx then resolves a different React copy than react-dom/server,
    // and every Text/Heading fails with "Invalid hook call" until a restart.
    // The two astro/* entries are the ones the Worker runner otherwise finds
    // late at startup, which fails the same way ("file does not exist … in the
    // optimize deps directory"). Add a new `@astryxdesign/core/<Name>` import here too.
    ssr: {
      optimizeDeps: {
        include: [
          'astro/app/manifest',
          'astro/assets/services/noop',
          'react',
          'react/jsx-runtime',
          'react-dom/server',
          '@astryxdesign/core/Badge',
          '@astryxdesign/core/Blockquote',
          '@astryxdesign/core/Button',
          '@astryxdesign/core/Card',
          '@astryxdesign/core/ClickableCard',
          '@astryxdesign/core/CodeBlock',
          '@astryxdesign/core/Divider',
          '@astryxdesign/core/Heading',
          '@astryxdesign/core/HStack',
          '@astryxdesign/core/Icon',
          '@astryxdesign/core/IconButton',
          '@astryxdesign/core/Link',
          '@astryxdesign/core/List',
          '@astryxdesign/core/Markdown',
          '@astryxdesign/core/Table',
          '@astryxdesign/core/Text',
          '@astryxdesign/core/TextInput',
          '@astryxdesign/core/ToggleButton',
          '@astryxdesign/core/TopNav',
        ],
      },
    },
  },
})
