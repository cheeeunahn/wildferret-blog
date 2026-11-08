# Software Bill of Materials

`sbom.cdx.json` is this repo's SBOM in [CycloneDX 1.6](https://cyclonedx.org/docs/1.6/json/) JSON: every third-party package the site is built from, plus the fonts and services it uses at runtime. This page explains what it covers and how to read it, and ends with a generated summary.

Regenerate both files after any dependency change:

```bash
pnpm sbom:write
```

It takes a few seconds, needs no network access, and is deterministic: no timestamp and no serial number, everything sorted. A re-run with no dependency change produces no diff, so a changed `sbom.cdx.json` in a PR always means a changed dependency.

## Where the data comes from

| Question                      | Answered by                                                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which packages and versions?  | `pnpm-lock.yaml`. Every package it resolves, with its integrity hash and dependency edges.                                                                                                                       |
| Licence, homepage, repository | Each package's own `package.json` at the locked version, read from pnpm's virtual store. Packages not installed on this OS keep what the previous `sbom.cdx.json` recorded for the same name@version and SHA-512 |
| Does it reach readers?        | A one-off production build with sourcemaps into a temp directory: a package whose code is in a browser chunk or the Worker is shipped                                                                            |
| Fonts and services            | Listed by hand in `EXTERNAL_COMPONENTS` / `EXTERNAL_SERVICES` in `scripts/sbom.mjs`                                                                                                                              |

**The lockfile, not `node_modules`.** A clean CI or Cloudflare install is the lockfile, while a local `node_modules` can drift from it. When it has, `pnpm sbom:write` prints a warning listing the drifted packages. The SBOM still describes the lockfile, but the shipped/not-shipped split is measured on the installed tree. Run `pnpm install --frozen-lockfile` first for an exact result.

**Why not just `dependencies` vs `devDependencies`?** That split does not say what reaches readers. `astro` and `@astrojs/cloudflare` are `dependencies`, but most of their code runs only at build time. `sharp` (whose libvips binaries are LGPL-3.0) only arrives through the adapter's local dev server, miniflare. Only the build output answers "does this ship?", so that is what the generator measures.

## Reading `sbom.cdx.json`

- **`scope`** — `required`: the package's code is served to readers, in a browser chunk or the Cloudflare Worker. `excluded`: build, dev or test tooling only.
- **`cdx:npm:package:development: true`** (standard CycloneDX npm property): reachable only from `devDependencies`.
- **`wildferret:shipped`**: `browser`, `worker`, `browser,worker` or `no`.
- **`wildferret:optional`**, **`wildferret:os`**, **`wildferret:cpu`**: platform-specific optional binaries. pnpm installs only the one matching the machine.
- **`wildferret:manifest: not-in-local-store`**: no `package.json` for that exact version in the local store, and no earlier run recorded one, so the entry has no licence data. See the footnote under the summary.
- **`hashes`**: the lockfile's SHA-512 integrity, in hex.
- **`dependencies`**: the full graph, rooted at `pkg:npm/wildferret-blog@0.1.0`.

## What it does not cover

- **First-party code and content.** `src/`, the articles, and the images and audio in `public/` are this repo's own work, so they are the SBOM's subject (`metadata.component`), not components of it.
- **The tools that run the build**: Node.js, pnpm (pinned in `package.json`'s `packageManager`) and the GitHub Actions in `.github/workflows/`.
- **Chrome's built-in AI** (Gemini Nano, used by the "AI로 요약하기" button). It is part of the reader's browser; the site ships no model and calls no API for it.
- **Vulnerabilities.** This is an inventory, not an audit. Feed the JSON to a scanner that reads CycloneDX (OSV-Scanner, Grype, Dependency-Track) for that.

## Licence notes

Everything shipped to readers is under a permissive licence (MIT, ISC or BSD-3-Clause), and both webfonts are under the SIL Open Font License 1.1. The stronger licences in the tree all stay in the toolchain:

| Licence           | Package                                       | Why it does not reach readers                                                     |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| LGPL-3.0-or-later | `@img/sharp-libvips-*` (libvips, via `sharp`) | Pulled in by miniflare, the adapter's local Workers runtime; never bundled        |
| MPL-2.0           | `lightningcss` (+ platform binaries)          | Tailwind's CSS compiler, which runs at build time only                            |
| CC-BY-4.0         | `caniuse-lite`                                | Browser-support data `browserslist` reads at build time (here via the Astryx CLI) |
| Python-2.0        | `argparse`                                    | Via `js-yaml` in Astro's build-time Markdown pipeline; not in the Worker bundle   |

If a change moves one of these into the `required` scope, the generated table below will show it. Read it before approving a dependency PR.

## Summary

<!-- sbom:summary:start -->
<!-- Generated by `pnpm sbom:write` — do not edit by hand. -->

|                                                      | Packages |
| ---------------------------------------------------- | -------: |
| Total resolved by the lockfile                       |      697 |
| Shipped to readers (browser or Worker)               |       20 |
| Reachable only from devDependencies                  |      353 |
| Toolchain reachable from `dependencies`, not shipped |      324 |

### Shipped npm packages

| Package                              | Version | License      | Ships in       |
| ------------------------------------ | ------- | ------------ | -------------- |
| `@astrojs/cloudflare`                | 14.4.6  | MIT          | worker         |
| `@astrojs/internal-helpers`          | 0.13.1  | MIT          | worker         |
| `@astrojs/react`                     | 7.1.4   | MIT          | browser        |
| `@astryxdesign/core`                 | 0.7.5   | MIT          | browser        |
| `@formatjs/fast-memoize`             | 3.1.7   | MIT          | browser        |
| `@formatjs/icu-messageformat-parser` | 3.5.18  | MIT          | browser        |
| `@formatjs/icu-skeleton-parser`      | 2.1.11  | MIT          | browser        |
| `@oslojs/encoding`                   | 1.1.0   | MIT          | worker         |
| `@stylexjs/stylex`                   | 0.19.1  | MIT          | browser        |
| `astro`                              | 7.4.7   | MIT          | browser,worker |
| `clsx`                               | 2.1.1   | MIT          | worker         |
| `cookie`                             | 2.0.1   | MIT          | worker         |
| `devalue`                            | 6.0.3   | MIT          | worker         |
| `html-escaper`                       | 3.0.3   | MIT          | worker         |
| `intl-messageformat`                 | 11.2.15 | BSD-3-Clause | browser        |
| `piccolore`                          | 0.1.3   | ISC          | worker         |
| `react-dom`                          | 19.3.1  | MIT          | browser        |
| `react`                              | 19.3.1  | MIT          | browser        |
| `scheduler`                          | 0.28.0  | MIT          | browser        |
| `zod`                                | 4.6.7   | MIT          | worker         |

### Loaded from a CDN at runtime

| Asset            | Version     | License | Source              |
| ---------------- | ----------- | ------- | ------------------- |
| Pretendard       | 1.3.9       | OFL-1.1 | cdn.jsdelivr.net    |
| NanumBarunGothic | unversioned | OFL-1.1 | hangeul.pstatic.net |

### Services

| Service            | Provider   | Used for                                                                                                                           |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Supabase PostgREST | Supabase   | Comment storage. Called only by the Worker (src/server/comments/repository.ts) as the blog_api role; the browser never reaches it. |
| Cloudflare Workers | Cloudflare | Hosts the prerendered pages as static assets and runs the one on-demand route, /api/comments.                                      |

### Licenses (npm packages)

| License                                  | All packages | Shipped |
| ---------------------------------------- | -----------: | ------: |
| MIT                                      |          476 |      18 |
| unknown — not in local store¹            |          126 |       0 |
| ISC                                      |           29 |       1 |
| Apache-2.0                               |           23 |       0 |
| BSD-2-Clause                             |           16 |       0 |
| BSD-3-Clause                             |            7 |       1 |
| BlueOak-1.0.0                            |            4 |       0 |
| MPL-2.0                                  |            4 |       0 |
| CC0-1.0                                  |            3 |       0 |
| MIT OR Apache-2.0                        |            3 |       0 |
| 0BSD                                     |            1 |       0 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT |            1 |       0 |
| BSD                                      |            1 |       0 |
| CC-BY-4.0                                |            1 |       0 |
| LGPL-3.0-or-later                        |            1 |       0 |
| Python-2.0                               |            1 |       0 |

¹ Almost all are platform binaries for other operating systems (e.g. `@img/sharp-linux-x64`), which pnpm never downloads on the machine that ran `pnpm sbom:write`, so their package.json is not in the local store, and no earlier run recorded their licence (a recorded one is carried forward while the SHA-512 matches). The rest are lockfile versions that node_modules has drifted away from. They carry the `wildferret:manifest = not-in-local-store` property in the JSON.

<!-- sbom:summary:end -->
