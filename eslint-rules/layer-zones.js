// Which layer may import which — the zones for local/no-cross-layer-import.
// Kept out of eslint.config.js so rules.test.js can test the real map rather
// than a copy of it. See the Layers section of CLAUDE.md and
// docs/adr/0001-layered-architecture.md.
const PRESENTATION = ['src/pages', 'src/layouts', 'src/components', 'src/copy']
export const layerZones = [
  {
    target: PRESENTATION,
    from: ['src/data'],
    reason: 'presentation reads content through src/content/service.ts, not the raw data.',
  },
  {
    // Islands and the browser client ship to the reader. Build-time content
    // and server code must never be bundled into them.
    target: ['src/components/*.tsx', 'src/client'],
    from: ['src/content', 'src/server', 'src/data'],
    reason: 'browser code reaches the server only over HTTP.',
  },
  {
    target: ['src/content'],
    from: [...PRESENTATION, 'src/client', 'src/server'],
    reason: 'the content layer sits below presentation and knows nothing about it.',
  },
  {
    target: ['src/server'],
    from: [...PRESENTATION, 'src/client'],
    reason: 'server code sits below presentation and knows nothing about it.',
  },
  {
    target: ['src/data'],
    from: [...PRESENTATION, 'src/client', 'src/content', 'src/server'],
    reason: 'src/data is pure data and depends on no other layer.',
  },
  {
    target: ['src/shared'],
    from: [...PRESENTATION, 'src/client', 'src/content', 'src/server', 'src/data'],
    reason: 'shared helpers are pure and importable from every layer, so they import none.',
  },
]
