// @ts-check
import { readdirSync, readFileSync } from 'node:fs'
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

// Every Astryx subpath the app imports ('@astryxdesign/core/Heading', …), read
// from src/ when the config loads. See `optimizeDeps` below for why.
function astryxImports() {
  const src = fileURLToPath(new URL('./src', import.meta.url))
  const found = new Set()
  for (const file of readdirSync(src, { recursive: true, encoding: 'utf8' })) {
    if (!/\.(astro|tsx?)$/.test(file)) continue
    const text = readFileSync(`${src}/${file}`, 'utf8')
    for (const [, id] of text.matchAll(/['"](@astryxdesign\/core\/[A-Za-z]+)['"]/g)) found.add(id)
  }
  return [...found].sort()
}

// Pre-bundled up front, in the browser and in the Worker. Vite otherwise
// discovers these on the first request to each page, re-optimizes, and deletes
// the chunks the Cloudflare workerd runner already holds — `pnpm dev` then dies
// with "process exited before becoming ready", or a page 500s with "The file
// does not exist at node_modules/.vite/deps_ssr/…". `astro/assets/services/noop`
// is pulled in by `imageService: 'passthrough'`.
const prebundle = [...astryxImports(), 'astro/assets/services/noop']

export default defineConfig({
  base,
  outDir: './dist',
  // One directory per route: dist/about/index.html, dist/article/<slug>/index.html.
  // The worker resolves extensionless paths to the directory index.
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  // Every page is still prerendered. The adapter exists for the one route that
  // opts out with `prerender = false`: /api/comments (src/pages/api/comments.ts).
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
    optimizeDeps: { include: prebundle.filter((id) => id.startsWith('@astryxdesign/')) },
    ssr: { optimizeDeps: { include: prebundle } },
  },
})
