#!/usr/bin/env node
// Writes the repo's SBOM: docs/sbom/sbom.cdx.json (CycloneDX 1.6) and the
// generated summary block in docs/sbom/README.md.
//
//   pnpm sbom:write
//
// Three sources, each the authority for one thing:
//
// - pnpm-lock.yaml decides WHAT is in the SBOM: every package and version the
//   lockfile resolves, with its integrity hash and dependency edges. Not
//   node_modules, which can drift from the lockfile (and has); a clean CI or
//   Cloudflare install is the lockfile.
// - pnpm's virtual store (node_modules/.pnpm, one folder per exact version)
//   supplies each package's own package.json at the locked version (license,
//   homepage, repository), so nothing is fetched.
// - A one-off production build with sourcemaps, into a temp directory, decides
//   which packages actually SHIP: a package whose code appears in a browser
//   chunk or the Worker bundle is scope "required"; everything else is the
//   toolchain and is scope "excluded". package.json's dependencies/
//   devDependencies split cannot answer that — astro, for one, is a
//   "dependency" but mostly build-time code.
//
// The output is deterministic (sorted, no timestamp or serial number), so a
// re-run with no dependency change produces no diff.
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_JSON = 'docs/sbom/sbom.cdx.json'
const OUT_README = 'docs/sbom/README.md'
const SUMMARY_START = '<!-- sbom:summary:start -->'
const SUMMARY_END = '<!-- sbom:summary:end -->'

// SPDX ids that appear in this tree. Anything else goes out as a license
// `name` rather than an `id`, since CycloneDX requires `id` to be valid SPDX.
const SPDX_IDS = new Set([
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'LGPL-3.0-or-later',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'OFL-1.1',
  'Python-2.0',
  'Unlicense',
])

// What readers' browsers and the Worker use at runtime that no lockfile can
// see: webfonts loaded from a CDN (Base.astro, global.css) and the services the
// Worker talks to (src/server/). Keep this list in step with those files.
export const EXTERNAL_COMPONENTS = [
  {
    type: 'library',
    'bom-ref': 'cdn:pretendard@1.3.9',
    name: 'Pretendard',
    version: '1.3.9',
    scope: 'required',
    description: 'Fallback webfont (variable, dynamic subset), loaded from jsDelivr by Base.astro',
    licenses: [{ license: { id: 'OFL-1.1' } }],
    externalReferences: [
      {
        type: 'distribution',
        url: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
      },
      { type: 'vcs', url: 'https://github.com/orioncactus/pretendard' },
    ],
    properties: [
      { name: 'wildferret:shipped', value: 'browser' },
      { name: 'wildferret:source', value: 'cdn' },
    ],
  },
  {
    type: 'library',
    'bom-ref': 'cdn:nanum-barun-gothic',
    name: 'NanumBarunGothic',
    scope: 'required',
    description:
      "Body webfont, loaded from Naver's hangeul.pstatic.net CDN by the @font-face rules in global.css (unversioned URL)",
    licenses: [{ license: { id: 'OFL-1.1' } }],
    externalReferences: [
      {
        type: 'distribution',
        url: 'https://hangeul.pstatic.net/hangeul_static/webfont/NanumBarunGothic/NanumBarunGothicWeb.woff',
      },
      { type: 'website', url: 'https://hangeul.naver.com/font' },
    ],
    properties: [
      { name: 'wildferret:shipped', value: 'browser' },
      { name: 'wildferret:source', value: 'cdn' },
    ],
  },
]

export const EXTERNAL_SERVICES = [
  {
    'bom-ref': 'service:supabase-postgrest',
    provider: { name: 'Supabase' },
    name: 'Supabase PostgREST',
    description:
      'Comment storage. Called only by the Worker (src/server/comments/repository.ts) as the blog_api role; the browser never reaches it.',
    endpoints: ['https://<project>.supabase.co/rest/v1/blog_user_comments'],
    authenticated: true,
    'x-trust-boundary': true,
    data: [{ flow: 'bi-directional', classification: 'public: nickname and comment text' }],
  },
  {
    'bom-ref': 'service:cloudflare-workers',
    provider: { name: 'Cloudflare' },
    name: 'Cloudflare Workers',
    description:
      'Hosts the prerendered pages as static assets and runs the one on-demand route, /api/comments.',
    authenticated: false,
    'x-trust-boundary': true,
  },
]

/** 'react-dom@19.2.8(react@19.2.8)' → { name: 'react-dom', version: '19.2.8' } */
export function splitKey(key) {
  const bare = key.includes('(') ? key.slice(0, key.indexOf('(')) : key
  const at = bare.lastIndexOf('@')
  if (at <= 0) throw new Error(`Not a name@version key: ${key}`)
  return { name: bare.slice(0, at), version: bare.slice(at + 1) }
}

/** A dependency value from a snapshot, resolved against its name. */
export function resolveDep(name, value) {
  const bare = value.includes('(') ? value.slice(0, value.indexOf('(')) : value
  // An npm alias is written as the real `name@version`.
  if (/^@?[^@]+@.+$/.test(bare)) return splitKey(bare)
  return { name, version: bare }
}

export function purl(name, version) {
  return `pkg:npm/${name.replace(/^@/, '%40')}@${version}`
}

/** 'sha512-<base64>' → { alg: 'SHA-512', content: '<hex>' } */
export function integrityToHash(integrity) {
  const m = /^sha(256|384|512)-(.+)$/.exec(integrity ?? '')
  if (!m) return undefined
  return { alg: `SHA-${m[1]}`, content: Buffer.from(m[2], 'base64').toString('hex') }
}

/** A package.json `license` (or legacy `licenses`) as CycloneDX licenses. */
export function toLicenses(manifest) {
  let raw = manifest?.license
  if (raw && typeof raw === 'object') raw = raw.type
  if (!raw && Array.isArray(manifest?.licenses)) {
    raw = manifest.licenses.map((l) => (typeof l === 'string' ? l : l.type)).join(' OR ')
  }
  if (!raw || typeof raw !== 'string') return []
  const value = raw.trim().replace(/^\((.*)\)$/, '$1')
  if (/\s(OR|AND|WITH)\s/.test(value)) return [{ expression: value }]
  return [{ license: SPDX_IDS.has(value) ? { id: value } : { name: value } }]
}

/**
 * Parse a v9 pnpm-lock.yaml. Line-based on purpose: the format is regular and
 * this keeps the script free of a YAML dependency that would itself belong in
 * the SBOM.
 *
 * pnpm 11+ writes the file as two YAML documents: first an "env" document that
 * locks pnpm itself (`packageManagerDependencies`) and any config
 * dependencies, then the project's own lockfile. Only the last document
 * describes the project; reading the first would yield an SBOM of pnpm alone.
 */
export function parseLockfile(fileText) {
  const docs = fileText.split(/^---[ \t]*$/m).filter((d) => /^lockfileVersion:/m.test(d))
  const text = docs.at(-1) ?? fileText
  const version = /^lockfileVersion: '?([\d.]+)'?/m.exec(text)?.[1]
  if (!version?.startsWith('9')) throw new Error(`Expected lockfileVersion 9, got ${version}`)

  const section = (name) => {
    const start = text.indexOf(`\n${name}:\n`)
    if (start === -1) return ''
    const rest = text.slice(start + name.length + 3)
    const end = rest.search(/\n[a-zA-Z]/)
    return end === -1 ? rest : rest.slice(0, end)
  }
  const unquote = (s) => s.trim().replace(/^'(.*)'$/, '$1')

  // importers → the root project's direct dependencies
  const direct = []
  let group
  let current
  for (const line of section('importers').split('\n')) {
    if (/^ {2}\S/.test(line) && line.trim() !== '.:') group = 'other'
    let m
    if ((m = /^ {4}(dependencies|devDependencies|optionalDependencies):$/.exec(line))) {
      group = m[1]
    } else if ((m = /^ {6}(.+):$/.exec(line))) {
      current = unquote(m[1])
    } else if ((m = /^ {8}version: (.+)$/.exec(line)) && group !== 'other' && current) {
      direct.push({ ...resolveDep(current, m[1].trim()), group })
    }
  }

  // packages → integrity and platform restrictions, keyed by name@version
  const packages = new Map()
  let pkg
  for (const line of section('packages').split('\n')) {
    let m
    if ((m = /^ {2}(\S.*):$/.exec(line))) {
      pkg = { ...splitKey(unquote(m[1])) }
      packages.set(`${pkg.name}@${pkg.version}`, pkg)
    } else if (pkg && (m = /^ {4}resolution: \{(.*)\}$/.exec(line))) {
      pkg.integrity = /integrity: ([^,}\s]+)/.exec(m[1])?.[1]
      pkg.tarball = /tarball: ([^,}\s]+)/.exec(m[1])?.[1]
    } else if (pkg && (m = /^ {4}(os|cpu|libc): \[(.*)\]$/.exec(line))) {
      pkg[m[1]] = m[2].split(',').map((s) => unquote(s))
    }
  }

  // snapshots → dependency edges. One package can have several snapshots (one
  // per peer set); their edges are unioned onto the plain name@version.
  const edges = new Map()
  const optional = new Set()
  let snap
  let inDeps = false
  for (const line of section('snapshots').split('\n')) {
    let m
    if ((m = /^ {2}(\S.*):$/.exec(line))) {
      const { name, version } = splitKey(unquote(m[1]))
      snap = `${name}@${version}`
      if (!edges.has(snap)) edges.set(snap, new Set())
      inDeps = false
    } else if (snap && /^ {4}optional: true$/.test(line)) {
      optional.add(snap)
    } else if (snap && /^ {4}(dependencies|optionalDependencies):$/.test(line)) {
      inDeps = true
    } else if (/^ {4}\S/.test(line)) {
      inDeps = false
    } else if (snap && inDeps && (m = /^ {6}(.+?): (.+)$/.exec(line))) {
      const dep = resolveDep(unquote(m[1]), m[2].trim())
      edges.get(snap).add(`${dep.name}@${dep.version}`)
    }
  }

  return { version, direct, packages, edges, optional }
}

/** Every id reachable from `starts` over `edges`. */
export function reachable(starts, edges) {
  const seen = new Set()
  const stack = [...starts]
  while (stack.length) {
    const id = stack.pop()
    if (seen.has(id)) continue
    seen.add(id)
    for (const next of edges.get(id) ?? []) stack.push(next)
  }
  return seen
}

/**
 * The package a sourcemap `sources` entry belongs to: `{ name, version }`, with
 * the version read from pnpm's `.pnpm/<name>@<version>_<peers>` folder when the
 * path has one (it is the INSTALLED version), or undefined if not a package.
 */
export function packageOfSource(source) {
  const parts = source.split(/[\\/]/)
  const at = parts.lastIndexOf('node_modules')
  if (at === -1 || at + 1 >= parts.length) return undefined
  const first = parts[at + 1]
  if (first.startsWith('.')) return undefined
  const name = first.startsWith('@') ? `${first}/${parts[at + 2]}` : first
  let version
  if (parts[at - 2] === '.pnpm') {
    const dir = parts[at - 1].split('_')[0].replace(/\+/g, '/')
    if (dir.startsWith(`${name}@`)) version = dir.slice(name.length + 1).split('(')[0]
  }
  return { name, version }
}

/**
 * Which locked ids a set of shipped `{ name, version }` hits mark. An exact
 * locked match wins; a version the lockfile does not have (node_modules drift)
 * falls back to every locked version of that name, so drift can over-report
 * but never hide a shipped package.
 */
export function matchShipped(found, packages) {
  const byName = new Map()
  for (const [id, pkg] of packages) {
    if (!byName.has(pkg.name)) byName.set(pkg.name, [])
    byName.get(pkg.name).push(id)
  }
  const ids = new Set()
  for (const { name, version } of found) {
    const exact = `${name}@${version}`
    if (version && packages.has(exact)) ids.add(exact)
    else for (const id of byName.get(name) ?? []) ids.add(id)
  }
  return ids
}

/**
 * Where each locked name@version is installed: pnpm's virtual store,
 * node_modules/.pnpm/<name>@<version>[_<peers>]/node_modules/<name>. pnpm 11+
 * keeps the content-addressed store's index in a binary database (index.db)
 * rather than JSON files, so the virtual store is the readable copy. Its
 * folders are keyed by exact version, so a folder either holds the locked
 * version or does not exist; node_modules drift cannot slip in another one.
 */
export function virtualStoreIndex(entries) {
  const byId = new Map()
  for (const entry of entries) {
    const m = /^(@[^+@]+\+[^@]+|[^@+][^@]*)@([^_(]+)/.exec(entry)
    if (!m) continue
    const id = `${m[1].replace('+', '/')}@${m[2]}`
    if (!byId.has(id)) byId.set(id, entry)
  }
  return byId
}

/** The locked package.json for name@version, from the virtual store. */
function readManifest(byId, name, version) {
  const entry = byId.get(`${name}@${version}`)
  if (!entry) return undefined
  try {
    const file = path.join(
      root,
      'node_modules',
      '.pnpm',
      entry,
      'node_modules',
      name,
      'package.json',
    )
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return undefined
  }
}

/** Package names whose code lands in the browser chunks and the Worker bundle. */
async function shippedPackages() {
  const outDir = mkdtempSync(path.join(os.tmpdir(), 'wildferret-sbom-'))
  try {
    const { build } = await import('astro')
    await build({ root, outDir, logLevel: 'error', vite: { build: { sourcemap: true } } })
    const collect = (dir) => {
      const found = new Map()
      if (!existsSync(dir)) return []
      for (const file of readdirSync(dir, { recursive: true })) {
        if (!String(file).endsWith('.map')) continue
        const map = JSON.parse(readFileSync(path.join(dir, String(file)), 'utf8'))
        for (const source of map.sources ?? []) {
          const pkg = packageOfSource(source)
          if (pkg) found.set(`${pkg.name}@${pkg.version}`, pkg)
        }
      }
      return [...found.values()]
    }
    const browser = collect(path.join(outDir, 'client'))
    // Astro inlines its island loader (<astro-island> and the client:*
    // directive runtimes) straight into the page HTML. Inline scripts have no
    // sourcemap, so the scan above cannot see them — count Astro as shipped to
    // the browser whenever a built page carries an island.
    const htmlHasIsland = readdirSync(path.join(outDir, 'client'), { recursive: true }).some(
      (file) =>
        String(file).endsWith('.html') &&
        readFileSync(path.join(outDir, 'client', String(file)), 'utf8').includes('<astro-island'),
    )
    if (htmlHasIsland) browser.push({ name: 'astro', version: undefined })
    return { browser, worker: collect(path.join(outDir, 'server')) }
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
}

/** Direct dependencies whose installed version differs from the lockfile. */
function installDrift(direct) {
  return direct.flatMap(({ name, version }) => {
    const file = path.join(root, 'node_modules', name, 'package.json')
    const installed = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).version : 'missing'
    return installed === version ? [] : [{ name, locked: version, installed }]
  })
}

export function buildBom({ project, lock, lockHash, manifests, shipped }) {
  const prodRoots = lock.direct.filter((d) => d.group !== 'devDependencies')
  const prodReach = reachable(
    prodRoots.map((d) => `${d.name}@${d.version}`),
    lock.edges,
  )
  const allReach = reachable(
    lock.direct.map((d) => `${d.name}@${d.version}`),
    lock.edges,
  )

  const ids = [...allReach].filter((id) => lock.packages.has(id)).sort()
  const components = ids.map((id) => {
    const pkg = lock.packages.get(id)
    const manifest = manifests.get(id)
    const where = [shipped.browser.has(id) && 'browser', shipped.worker.has(id) && 'worker'].filter(
      Boolean,
    )
    const slash = pkg.name.startsWith('@') ? pkg.name.indexOf('/') : -1
    const repo =
      typeof manifest?.repository === 'string' ? manifest.repository : manifest?.repository?.url
    const hash = integrityToHash(pkg.integrity)
    const properties = [
      { name: 'wildferret:shipped', value: where.length ? where.join(',') : 'no' },
      !prodReach.has(id) && { name: 'cdx:npm:package:development', value: 'true' },
      lock.optional.has(id) && { name: 'wildferret:optional', value: 'true' },
      pkg.os && { name: 'wildferret:os', value: pkg.os.join(',') },
      pkg.cpu && { name: 'wildferret:cpu', value: pkg.cpu.join(',') },
      !manifest && { name: 'wildferret:manifest', value: 'not-in-local-store' },
    ].filter(Boolean)
    return {
      type: 'library',
      'bom-ref': purl(pkg.name, pkg.version),
      ...(slash > 0
        ? { group: pkg.name.slice(0, slash), name: pkg.name.slice(slash + 1) }
        : { name: pkg.name }),
      version: pkg.version,
      scope: where.length ? 'required' : 'excluded',
      ...(manifest?.description ? { description: manifest.description } : {}),
      ...(hash ? { hashes: [hash] } : {}),
      licenses: toLicenses(manifest),
      purl: purl(pkg.name, pkg.version),
      externalReferences: [
        pkg.tarball
          ? { type: 'distribution', url: pkg.tarball }
          : {
              type: 'distribution',
              url: `https://registry.npmjs.org/${pkg.name}/-/${pkg.name.split('/').pop()}-${pkg.version}.tgz`,
            },
        manifest?.homepage && { type: 'website', url: manifest.homepage },
        repo && { type: 'vcs', url: repo },
      ].filter(Boolean),
      properties,
    }
  })

  const rootRef = purl(project.name, project.version)
  const dependencies = [
    {
      ref: rootRef,
      dependsOn: [
        ...new Set([
          ...lock.direct.map((d) => purl(d.name, d.version)),
          ...EXTERNAL_COMPONENTS.map((c) => c['bom-ref']),
        ]),
      ].sort(),
    },
    ...ids.map((id) => {
      const { name, version } = lock.packages.get(id)
      return {
        ref: purl(name, version),
        dependsOn: [...(lock.edges.get(id) ?? [])]
          .filter((dep) => lock.packages.has(dep))
          .map((dep) => {
            const p = lock.packages.get(dep)
            return purl(p.name, p.version)
          })
          .sort(),
      }
    }),
  ]

  return {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    version: 1,
    metadata: {
      tools: { components: [{ type: 'application', name: 'scripts/sbom.mjs' }] },
      component: {
        type: 'application',
        'bom-ref': rootRef,
        name: project.name,
        version: project.version,
        purl: rootRef,
      },
      properties: [
        { name: 'wildferret:lockfile', value: 'pnpm-lock.yaml' },
        { name: 'wildferret:lockfile:sha256', value: lockHash },
        { name: 'wildferret:packageManager', value: project.packageManager ?? '' },
      ],
    },
    components: [...EXTERNAL_COMPONENTS, ...components],
    services: EXTERNAL_SERVICES,
    dependencies,
  }
}

/** The generated block in docs/sbom/README.md. */
export function summarize(bom) {
  // npm packages only; the CDN fonts and services get their own tables.
  const comps = bom.components.filter((c) => c.purl)
  const external = bom.components.filter((c) => !c.purl)
  const label = (c) => (c.group ? `${c.group}/${c.name}` : c.name)
  const prop = (c, n) => c.properties.find((p) => p.name === n)?.value
  const licenseOf = (c) =>
    c.licenses.map((l) => l.expression ?? l.license.id ?? l.license.name).join(' / ') ||
    (prop(c, 'wildferret:manifest') ? 'unknown — not in local store¹' : 'none declared')
  const shipped = comps.filter((c) => c.scope === 'required')
  const dev = comps.filter((c) => prop(c, 'cdx:npm:package:development') === 'true')

  const counts = new Map()
  for (const c of comps) {
    const key = licenseOf(c)
    const entry = counts.get(key) ?? { all: 0, shipped: 0 }
    entry.all += 1
    if (c.scope === 'required') entry.shipped += 1
    counts.set(key, entry)
  }

  const lines = [
    SUMMARY_START,
    '<!-- Generated by `pnpm sbom:write` — do not edit by hand. -->',
    '',
    `| | Packages |`,
    `| --- | ---: |`,
    `| Total resolved by the lockfile | ${comps.length} |`,
    `| Shipped to readers (browser or Worker) | ${shipped.length} |`,
    `| Reachable only from devDependencies | ${dev.length} |`,
    `| Toolchain reachable from \`dependencies\`, not shipped | ${comps.filter((c) => c.scope === 'excluded' && !dev.includes(c)).length} |`,
    '',
    '### Shipped npm packages',
    '',
    '| Package | Version | License | Ships in |',
    '| --- | --- | --- | --- |',
    ...shipped.map(
      (c) =>
        `| \`${label(c)}\` | ${c.version} | ${licenseOf(c)} | ${prop(c, 'wildferret:shipped')} |`,
    ),
    '',
    '### Loaded from a CDN at runtime',
    '',
    '| Asset | Version | License | Source |',
    '| --- | --- | --- | --- |',
    ...external.map(
      (c) =>
        `| ${c.name} | ${c.version ?? 'unversioned'} | ${licenseOf(c)} | ${c.externalReferences[0].url.split('/')[2]} |`,
    ),
    '',
    '### Services',
    '',
    '| Service | Provider | Used for |',
    '| --- | --- | --- |',
    ...(bom.services ?? []).map((sv) => `| ${sv.name} | ${sv.provider.name} | ${sv.description} |`),
    '',
    '### Licenses (npm packages)',
    '',
    '| License | All packages | Shipped |',
    '| --- | ---: | ---: |',
    ...[...counts.entries()]
      .sort((a, b) => b[1].all - a[1].all || a[0].localeCompare(b[0]))
      .map(([lic, n]) => `| ${lic} | ${n.all} | ${n.shipped} |`),
    '',
    '¹ Almost all are platform binaries for other operating systems (e.g. `@img/sharp-linux-x64`), which pnpm never downloads on the machine that ran `pnpm sbom:write`, so their package.json is not in the local store. The rest are lockfile versions that node_modules has drifted away from. They carry the `wildferret:manifest = not-in-local-store` property in the JSON.',
    '',
    SUMMARY_END,
  ]
  return lines.join('\n')
}

async function main() {
  const lockText = readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8')
  const project = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  const lock = parseLockfile(lockText)

  const drift = installDrift(lock.direct)
  if (drift.length) {
    console.warn(
      `warning: node_modules does not match pnpm-lock.yaml for ${drift.length} direct dependencies:\n` +
        drift.map((d) => `  ${d.name}: locked ${d.locked}, installed ${d.installed}`).join('\n') +
        '\nThe SBOM still follows the lockfile, but "shipped" is measured on the installed tree.' +
        '\nRun `pnpm install --frozen-lockfile` and re-run for an exact result.',
    )
  }

  const storeDir = path.join(root, 'node_modules', '.pnpm')
  const index = virtualStoreIndex(existsSync(storeDir) ? readdirSync(storeDir) : [])
  const manifests = new Map()
  for (const [id, pkg] of lock.packages) {
    const manifest = readManifest(index, pkg.name, pkg.version)
    if (manifest) manifests.set(id, manifest)
  }

  const found = await shippedPackages()
  const shipped = {
    browser: matchShipped(found.browser, lock.packages),
    worker: matchShipped(found.worker, lock.packages),
  }
  const lockHash = createHash('sha256').update(lockText).digest('hex')
  const bom = buildBom({ project, lock, lockHash, manifests, shipped })

  // Formatted with the repo's own Prettier config, so the pre-commit hook's
  // `prettier --write` is a no-op on these files and a re-run never diffs.
  const prettier = await import('prettier')
  const write = async (rel, text) => {
    const file = path.join(root, rel)
    const options = (await prettier.resolveConfig(file)) ?? {}
    writeFileSync(file, await prettier.format(text, { ...options, filepath: file }))
  }

  await write(OUT_JSON, JSON.stringify(bom, null, 2))

  const readme = readFileSync(path.join(root, OUT_README), 'utf8')
  const start = readme.indexOf(SUMMARY_START)
  const end = readme.indexOf(SUMMARY_END)
  if (start === -1 || end === -1) throw new Error(`${OUT_README} is missing the summary markers`)
  await write(
    OUT_README,
    readme.slice(0, start) + summarize(bom) + readme.slice(end + SUMMARY_END.length),
  )

  const missing = bom.components.filter((c) =>
    c.properties.some((p) => p.name === 'wildferret:manifest'),
  )
  console.log(
    `Wrote ${OUT_JSON}: ${bom.components.length} components, ` +
      `${bom.components.filter((c) => c.scope === 'required').length} shipped` +
      (missing.length ? `, ${missing.length} without license data in the local store` : ''),
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
