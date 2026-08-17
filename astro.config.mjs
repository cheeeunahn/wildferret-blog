// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// The site is served from two places with different path prefixes:
//   GitHub Pages → cheeeunahn.github.io/wildferret-blog/
//   Cloudflare   → wildferret-blog.cheeeunahn.workers.dev/ (root)
// Cloudflare's build environment sets WORKERS_CI / CF_PAGES, so it gets '/'.
// BASE_PATH overrides both when set explicitly.
const base =
  process.env.BASE_PATH ??
  (process.env.WORKERS_CI || process.env.CF_PAGES ? '/' : '/wildferret-blog/')

export default defineConfig({
  base,
  outDir: './dist',
  // One directory per route: dist/about/index.html, dist/article/<slug>/index.html.
  // Both hosts resolve extensionless paths to the directory index.
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
