/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// getViteConfig loads astro.config.mjs, so import.meta.env.BASE_URL inside
// assetUrl.ts matches the real build base during tests.
export default getViteConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
