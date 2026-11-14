import { describe, expect, it } from 'vitest'
import {
  buildBom,
  integrityToHash,
  manifestsFromBom,
  matchShipped,
  packageOfSource,
  parseLockfile,
  purl,
  resolveDep,
  splitKey,
  toLicenses,
  virtualStoreIndex,
} from './sbom.mjs'

// A trimmed v9 lockfile: one runtime dep (react-dom → scheduler), one dev dep,
// one platform-only optional binary, and a peer-suffixed snapshot key.
const LOCK = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

importers:

  .:
    dependencies:
      react-dom:
        specifier: ^19.2.4
        version: 19.2.8(react@19.2.8)
    devDependencies:
      '@types/node':
        specifier: ^26.4.1
        version: 26.4.1

packages:

  '@types/node@26.4.1':
    resolution: {integrity: sha512-AAAA}

  react-dom@19.2.8:
    resolution: {integrity: sha512-qrvW}
    peerDependencies:
      react: ^19.2.8

  react@19.2.8:
    resolution: {integrity: sha512-3q2+7w==}

  scheduler@0.27.0:
    resolution: {integrity: sha512-BBBB}

  '@img/sharp-linux-x64@0.35.4':
    resolution: {integrity: sha512-CCCC}
    cpu: [x64]
    os: [linux]

snapshots:

  '@types/node@26.4.1': {}

  react-dom@19.2.8(react@19.2.8):
    dependencies:
      react: 19.2.8
      scheduler: 0.27.0
    optionalDependencies:
      '@img/sharp-linux-x64': 0.35.4

  react@19.2.8: {}

  scheduler@0.27.0: {}

  '@img/sharp-linux-x64@0.35.4':
    optional: true
`

describe('splitKey / resolveDep', () => {
  it('splits scoped names and drops the peer suffix', () => {
    expect(splitKey('@astrojs/check@0.9.10(prettier@3.9.9)')).toEqual({
      name: '@astrojs/check',
      version: '0.9.10',
    })
  })

  it('resolves an npm alias to the real package', () => {
    expect(resolveDep('string-width-cjs', 'string-width@4.2.3')).toEqual({
      name: 'string-width',
      version: '4.2.3',
    })
    expect(resolveDep('react', '19.2.8')).toEqual({ name: 'react', version: '19.2.8' })
  })
})

describe('purl / integrityToHash / toLicenses', () => {
  it('percent-encodes the scope in a purl', () => {
    expect(purl('@astrojs/react', '6.0.2')).toBe('pkg:npm/%40astrojs/react@6.0.2')
  })

  it('turns an SRI integrity into a hex SHA-512', () => {
    expect(integrityToHash('sha512-3q2+7w==')).toEqual({ alg: 'SHA-512', content: 'deadbeef' })
    expect(integrityToHash(undefined)).toBeUndefined()
  })

  it('uses an SPDX id, an expression, or a plain name as appropriate', () => {
    expect(toLicenses({ license: 'MIT' })).toEqual([{ license: { id: 'MIT' } }])
    expect(toLicenses({ license: '(MIT OR Apache-2.0)' })).toEqual([
      { expression: 'MIT OR Apache-2.0' },
    ])
    expect(toLicenses({ license: 'BSD' })).toEqual([{ license: { name: 'BSD' } }])
    expect(toLicenses({ licenses: [{ type: 'MIT' }] })).toEqual([{ license: { id: 'MIT' } }])
    expect(toLicenses(undefined)).toEqual([])
  })
})

describe('parseLockfile', () => {
  const lock = parseLockfile(LOCK)

  it('reads the direct dependencies by group', () => {
    expect(lock.direct).toEqual([
      { name: 'react-dom', version: '19.2.8', group: 'dependencies' },
      { name: '@types/node', version: '26.4.1', group: 'devDependencies' },
    ])
  })

  it('reads integrity and platform restrictions', () => {
    expect(lock.packages.get('react@19.2.8').integrity).toBe('sha512-3q2+7w==')
    expect(lock.packages.get('@img/sharp-linux-x64@0.35.4')).toMatchObject({
      os: ['linux'],
      cpu: ['x64'],
    })
  })

  it('unions edges onto name@version, optional ones included', () => {
    expect([...lock.edges.get('react-dom@19.2.8')].sort()).toEqual([
      '@img/sharp-linux-x64@0.35.4',
      'react@19.2.8',
      'scheduler@0.27.0',
    ])
    expect(lock.optional.has('@img/sharp-linux-x64@0.35.4')).toBe(true)
  })

  it('reads the project document of a pnpm 11+ lockfile, not the env document', () => {
    const ENV = `---
lockfileVersion: '9.0'

importers:

  .:
    configDependencies: {}
    packageManagerDependencies:
      pnpm:
        specifier: 12.16.1
        version: 12.16.1

packages:

  pnpm@12.16.1:
    resolution: {integrity: sha512-DDDD}

snapshots:

  pnpm@12.16.1: {}

---
`
    const multi = parseLockfile(ENV + LOCK)
    expect(multi.direct).toEqual(lock.direct)
    expect([...multi.packages.keys()]).toEqual([...lock.packages.keys()])
    expect(multi.packages.has('pnpm@12.16.1')).toBe(false)
  })

  it('refuses a lockfile format it was not written for', () => {
    expect(() => parseLockfile("lockfileVersion: '6.0'\n")).toThrow(/lockfileVersion 9/)
  })
})

describe('virtualStoreIndex', () => {
  it('maps virtual-store folders to name@version, peer suffixes and hashes dropped', () => {
    const byId = virtualStoreIndex([
      'react@19.3.1',
      'react-dom@19.3.1_react@19.3.1',
      '@astryxdesign+core@0.7.5_@stylexjs+stylex@0.19.1_react-dom@19.3.1_react@19.3.1__react@19.3.1',
      '@astrojs+cloudflare@14.4.3_@types+node@26.6.6_astro@7.4.4_ff00a53e41e83445d607428ec664b676',
      'node_modules',
      'lock.yaml',
    ])
    expect([...byId.keys()].sort()).toEqual([
      '@astrojs/cloudflare@14.4.3',
      '@astryxdesign/core@0.7.5',
      'react-dom@19.3.1',
      'react@19.3.1',
    ])
    expect(byId.get('react-dom@19.3.1')).toBe('react-dom@19.3.1_react@19.3.1')
  })
})

describe('manifestsFromBom', () => {
  const lock = parseLockfile(LOCK)
  const manifests = new Map([
    ['react@19.2.8', { license: 'MIT', homepage: 'https://react.dev/', description: 'React' }],
    ['react-dom@19.2.8', { license: '(MIT OR Apache-2.0)' }],
  ])
  const shipped = { browser: new Set(), worker: new Set() }
  const first = buildBom({
    project: { name: 'p', version: '1' },
    lock,
    lockHash: 'x',
    manifests,
    shipped,
  })

  it('reproduces the same components on a machine without those manifests', () => {
    const carried = manifestsFromBom(first, lock.packages)
    expect([...carried.keys()].sort()).toEqual(['react-dom@19.2.8', 'react@19.2.8'])
    const again = buildBom({
      project: { name: 'p', version: '1' },
      lock,
      lockHash: 'x',
      manifests: carried,
      shipped,
    })
    expect(again).toEqual(first)
  })

  it('does not carry an entry whose hash no longer matches the lockfile', () => {
    const changed = parseLockfile(LOCK.replace('sha512-3q2+7w==', 'sha512-AAAAAA=='))
    expect(manifestsFromBom(first, changed.packages).has('react@19.2.8')).toBe(false)
    expect(manifestsFromBom(first, changed.packages).has('react-dom@19.2.8')).toBe(true)
  })

  it('does not carry an entry that was itself unknown', () => {
    expect(manifestsFromBom(first, lock.packages).has('scheduler@0.27.0')).toBe(false)
    expect(manifestsFromBom(undefined, lock.packages).size).toBe(0)
  })
})

describe('packageOfSource / matchShipped', () => {
  it('reads name and installed version out of a pnpm path', () => {
    expect(
      packageOfSource(
        '../../node_modules/.pnpm/react-dom@19.3.0_react@19.3.0/node_modules/react-dom/cjs/x.js',
      ),
    ).toEqual({ name: 'react-dom', version: '19.3.0' })
    expect(
      packageOfSource(
        '../node_modules/.pnpm/@astrojs+react@6.0.2_x/node_modules/@astrojs/react/client.js',
      ),
    ).toEqual({ name: '@astrojs/react', version: '6.0.2' })
    expect(packageOfSource('../../src/components/AiSummary.tsx')).toBeUndefined()
  })

  it('marks the exact locked version, or every locked version on drift', () => {
    const packages = new Map([
      ['cookie@1.1.1', { name: 'cookie', version: '1.1.1' }],
      ['cookie@2.0.1', { name: 'cookie', version: '2.0.1' }],
    ])
    expect([...matchShipped([{ name: 'cookie', version: '2.0.1' }], packages)]).toEqual([
      'cookie@2.0.1',
    ])
    expect([...matchShipped([{ name: 'cookie', version: '9.9.9' }], packages)].sort()).toEqual([
      'cookie@1.1.1',
      'cookie@2.0.1',
    ])
  })
})

describe('buildBom', () => {
  const lock = parseLockfile(LOCK)
  const bom = buildBom({
    project: { name: 'wildferret-blog', version: '0.1.0' },
    lock,
    lockHash: 'abc',
    manifests: new Map([['react@19.2.8', { license: 'MIT', homepage: 'https://react.dev/' }]]),
    shipped: { browser: new Set(['react@19.2.8', 'react-dom@19.2.8']), worker: new Set() },
  })
  const byRef = (ref) => bom.components.find((c) => c['bom-ref'] === ref)
  const prop = (c, name) => c.properties.find((p) => p.name === name)?.value

  it('scopes by what ships, not by dependencies vs devDependencies', () => {
    expect(byRef('pkg:npm/react@19.2.8').scope).toBe('required')
    expect(byRef('pkg:npm/scheduler@0.27.0').scope).toBe('excluded')
    expect(prop(byRef('pkg:npm/scheduler@0.27.0'), 'cdx:npm:package:development')).toBeUndefined()
    expect(prop(byRef('pkg:npm/%40types/node@26.4.1'), 'cdx:npm:package:development')).toBe('true')
  })

  it('flags a package with no manifest instead of claiming it is unlicensed', () => {
    expect(byRef('pkg:npm/react@19.2.8').licenses).toEqual([{ license: { id: 'MIT' } }])
    expect(prop(byRef('pkg:npm/scheduler@0.27.0'), 'wildferret:manifest')).toBe(
      'not-in-local-store',
    )
  })

  it('has no dangling dependency refs', () => {
    const refs = new Set([bom.metadata.component, ...bom.components].map((c) => c['bom-ref']))
    for (const { ref, dependsOn } of bom.dependencies) {
      expect(refs.has(ref)).toBe(true)
      for (const target of dependsOn) expect(refs.has(target)).toBe(true)
    }
  })
})
