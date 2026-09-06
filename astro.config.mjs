// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

// Served at the root of the Cloudflare static worker, so the default base is '/'.
// BASE_PATH overrides it for a build that has to live under a path prefix.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  outDir: './dist',
  // One directory per route: dist/about/index.html, dist/article/<slug>/index.html.
  // The worker resolves extensionless paths to the directory index.
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
