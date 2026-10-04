import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cacheKey,
  canSummarize,
  chunkText,
  createPipeline,
  destroyModels,
  NeedsAnotherClick,
  pickRoute,
  readCachedSummary,
  summarizeArticle,
  toPlainText,
  toSentences,
  writeCachedSummary,
  type Models,
} from './summarizer'

describe('canSummarize', () => {
  it('shows the button unless the model cannot run at all', () => {
    expect(canSummarize('available')).toBe(true)
    expect(canSummarize('downloadable')).toBe(true)
    expect(canSummarize('downloading')).toBe(true)
    expect(canSummarize('unavailable')).toBe(false)
  })
})

describe('toSentences', () => {
  it('splits Korean and English sentences', () => {
    expect(toSentences('결제 오류가 1위입니다. AI가 바꿉니다.')).toEqual([
      '결제 오류가 1위입니다.',
      'AI가 바꿉니다.',
    ])
    expect(toSentences('One. Two? Three!')).toEqual(['One.', 'Two?', 'Three!'])
  })

  it('keeps a sentence still being streamed as the last item', () => {
    expect(toSentences('Done. Still wri')).toEqual(['Done.', 'Still wri'])
  })

  it('does not split decimals', () => {
    expect(toSentences('Churn is 32.2% on Play.')).toEqual(['Churn is 32.2% on Play.'])
  })
})

describe('chunkText', () => {
  it('packs paragraphs up to the limit', () => {
    expect(chunkText('aaa\n\nbbb\n\nccc', 8)).toEqual(['aaa\n\nbbb', 'ccc'])
  })

  it('cuts a paragraph longer than the limit on its own', () => {
    expect(chunkText('ab\n\ncdefgh', 4)).toEqual(['ab', 'cdef', 'gh'])
  })

  it('keeps short text whole', () => {
    expect(chunkText('one\n\ntwo', 100)).toEqual(['one\n\ntwo'])
  })
})

describe('toPlainText', () => {
  it('drops a "here is the summary" opener', () => {
    expect(toPlainText("Here's a TL;DR of the post: Payments fail. Fix retries.")).toBe(
      'Payments fail. Fix retries.',
    )
    expect(toPlainText('Here is a summary of MGS 2026. Payments fail.')).toBe('Payments fail.')
  })

  it('keeps a first sentence that only mentions a summary in passing', () => {
    expect(toPlainText('Payments fail more than teams expect.')).toBe(
      'Payments fail more than teams expect.',
    )
  })

  it('strips the markdown Gemini Nano writes anyway', () => {
    const raw =
      '## Summary\n\n**Payment failures** drive churn.\n\n* Fix retries\n- Ship `server-side` flows'
    expect(toPlainText(raw)).toBe(
      'Summary\n\nPayment failures drive churn.\n\nFix retries\nShip server-side flows',
    )
  })

  it('leaves plain prose alone', () => {
    expect(toPlainText('One sentence. Two sentences.')).toBe('One sentence. Two sentences.')
  })
})

function stream(parts: string[]): ReadableStream<string> {
  return new ReadableStream({
    start(c) {
      parts.forEach((p) => c.enqueue(p))
      c.close()
    },
  })
}

/** A LanguageModel whose answer is `sum(<prompt body>)`, streamed in two pieces. */
function fakeModel(opts: { contextWindow: number; usagePerChar: number }) {
  const prompts: string[] = []
  const clones: string[] = []
  const answer = (prompt: string) => `sum(${prompt.split('Blog post:\n\n')[1]})`
  const model = {
    contextWindow: opts.contextWindow,
    measureContextUsage: async (p: string) => p.length * opts.usagePerChar,
    clone: async () => {
      clones.push('clone')
      return {
        promptStreaming: (p: string) => {
          prompts.push(p)
          const a = answer(p)
          return stream([a.slice(0, 4), a.slice(4)])
        },
        destroy: () => clones.pop(),
      }
    },
    destroy: () => {},
  }
  return { model: model as unknown as LanguageModel, prompts, clones }
}

describe('summarizeArticle', () => {
  it('streams a post that fits the context window in one pass', async () => {
    const { model, prompts, clones } = fakeModel({ contextWindow: 1000, usagePerChar: 1 })
    const seen: string[] = []
    const result = await summarizeArticle(model, 'short post', 'Title', (t) => seen.push(t))
    expect(result).toBe('sum(short post)')
    expect(seen).toEqual(['sum(', 'sum(short post)'])
    expect(prompts).toEqual(['Title: Title\n\nBlog post:\n\nshort post'])
    expect(clones).toEqual([]) // every clone destroyed
  })

  it('summarizes an over-window post in pieces, then the joined pieces', async () => {
    const { model, prompts } = fakeModel({ contextWindow: 40, usagePerChar: 1 })
    const text = ['a'.repeat(6), 'b'.repeat(6), 'c'.repeat(6)].join('\n\n')
    await summarizeArticle(model, text, 'T', () => {})
    const bodies = prompts.map((p) => p.split('Blog post:\n\n')[1])
    const pieces = bodies.slice(0, -1)
    expect(pieces.length).toBeGreaterThan(1)
    expect(bodies.at(-1)).toBe(pieces.map((p) => `sum(${p})`).join('\n\n'))
  })

  it('strips markdown from the streamed text too', async () => {
    const model = {
      contextWindow: 1000,
      measureContextUsage: async () => 1,
      clone: async () => ({
        promptStreaming: () => stream(['## Head\n\n', '**bold** end']),
        destroy: () => {},
      }),
    } as unknown as LanguageModel
    const seen: string[] = []
    expect(await summarizeArticle(model, 'x', 'T', (t) => seen.push(t))).toBe('Head\n\nbold end')
    expect(seen.at(-1)).toBe('Head\n\nbold end')
  })
})

describe('summary cache', () => {
  it('keys by version, language and slug', () => {
    expect(cacheKey('en', 'my-post')).toBe('ai-summary:v2:en:my-post')
  })

  it('round-trips through a store', () => {
    const map = new Map<string, string>()
    const store = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    }
    writeCachedSummary('k', 'summary', store)
    expect(readCachedSummary('k', store)).toBe('summary')
  })

  it('treats a missing or throwing store as a miss', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readCachedSummary('k', null)).toBeNull()
    expect(readCachedSummary('k', throwing)).toBeNull()
    expect(() => writeCachedSummary('k', 'v', throwing)).not.toThrow()
  })
})

// --- route + pipeline, against stubbed LanguageModel/Translator globals -------

type Avail = Record<string, Availability>

function stubApis(opts: { model: Avail; translator?: Avail; needsGesture?: string[] }) {
  const created: string[] = []
  const destroyed: string[] = []
  // Like Chrome: a click pays for one download, and a second is refused.
  let gestureUsed = false
  const gate = (name: string) => {
    if (!opts.needsGesture?.includes(name)) return
    if (gestureUsed) throw new DOMException('Requires a user gesture', 'NotAllowedError')
    gestureUsed = true
  }
  const langOf = (o: LanguageModelCreateCoreOptions) => o.expectedOutputs?.[0]?.languages?.[0] ?? ''
  const LanguageModel = {
    availability: async (o: LanguageModelCreateCoreOptions) =>
      opts.model[langOf(o)] ?? 'unavailable',
    create: async (o: LanguageModelCreateOptions) => {
      const name = `model:${langOf(o)}`
      gate(name)
      created.push(name)
      return {
        contextWindow: 1e6,
        measureContextUsage: async () => 1,
        clone: async () => ({
          promptStreaming: (p: string) => stream([`sum(${p.split('Blog post:\n\n')[1]})`]),
          destroy: () => {},
        }),
        destroy: () => destroyed.push(name),
      }
    },
  }
  const pair = (o: TranslatorCreateCoreOptions) => `${o.sourceLanguage}>${o.targetLanguage}`
  const Translator = {
    availability: async (o: TranslatorCreateCoreOptions) =>
      opts.translator?.[pair(o)] ?? 'unavailable',
    create: async (o: TranslatorCreateOptions) => {
      gate(`translator:${pair(o)}`)
      created.push(`translator:${pair(o)}`)
      return {
        translate: async (t: string) => `${o.targetLanguage}[${t}]`,
        translateStreaming: (t: string) => stream([`${o.targetLanguage}[`, `${t}]`]),
        destroy: () => destroyed.push(`translator:${pair(o)}`),
      }
    },
  }
  vi.stubGlobal('self', { LanguageModel, ...(opts.translator ? { Translator } : {}) })
  vi.stubGlobal('LanguageModel', LanguageModel)
  if (opts.translator) vi.stubGlobal('Translator', Translator)
  const nextClick = () => {
    gestureUsed = false
  }
  return { created, destroyed, nextClick }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pickRoute', () => {
  it('summarizes directly when the model takes the language', async () => {
    stubApis({ model: { ko: 'available', en: 'available' } })
    expect(await pickRoute('ko')).toBe('direct')
  })

  it('goes through English when only the translators take the language', async () => {
    stubApis({
      model: { en: 'available' },
      translator: { 'ko>en': 'downloadable', 'en>ko': 'downloadable' },
    })
    expect(await pickRoute('ko')).toBe('via-en')
  })

  it('hides the button when any step of the detour is unavailable', async () => {
    stubApis({ model: { en: 'available' }, translator: { 'ko>en': 'downloadable' } })
    expect(await pickRoute('ko')).toBeNull()
  })

  it('never detours for English', async () => {
    stubApis({ model: {}, translator: { 'en>en': 'available' } })
    expect(await pickRoute('en')).toBeNull()
  })

  it('hides the button without the API', async () => {
    vi.stubGlobal('self', {})
    expect(await pickRoute('ko')).toBeNull()
  })
})

describe('createPipeline', () => {
  it('translates to English, summarizes, and streams the translation back', async () => {
    const { created, destroyed } = stubApis({
      model: { en: 'available' },
      translator: { 'ko>en': 'available', 'en>ko': 'available' },
    })
    const models: Models = {}
    const pipeline = await createPipeline('ko', 'via-en', models, () => {})
    expect(created).toEqual(['translator:ko>en', 'translator:en>ko', 'model:en'])

    const seen: string[] = []
    const result = await pipeline.run('하나\n\n둘', '제목', (t) => seen.push(t))
    expect(result).toBe('ko[sum(en[하나]\n\nen[둘])]')
    expect(seen.at(-1)).toBe(result)
    expect(seen.length).toBeGreaterThan(1)

    destroyModels(models)
    expect(destroyed).toHaveLength(3)
  })

  it('uses only the model on the direct route', async () => {
    const { created } = stubApis({ model: { en: 'available' } })
    const pipeline = await createPipeline('en', 'direct', {}, () => {})
    expect(created).toEqual(['model:en'])
    expect(await pipeline.run('post', 'Title', () => {})).toBe('sum(post)')
  })

  it('spends one click per download and resumes on the next click', async () => {
    const { created, nextClick } = stubApis({
      model: { en: 'downloadable' },
      translator: { 'ko>en': 'downloadable', 'en>ko': 'downloadable' },
      needsGesture: ['translator:ko>en', 'model:en'],
    })
    const models: Models = {}
    await expect(createPipeline('ko', 'via-en', models, () => {})).rejects.toBeInstanceOf(
      NeedsAnotherClick,
    )
    expect(created).toEqual(['translator:ko>en', 'translator:en>ko'])

    nextClick()
    await createPipeline('ko', 'via-en', models, () => {})
    // The translators from the first click are reused, not created again.
    expect(created).toEqual(['translator:ko>en', 'translator:en>ko', 'model:en'])
  })

  it('passes other failures through', async () => {
    stubApis({ model: { en: 'available' } })
    vi.stubGlobal('LanguageModel', {
      create: async () => {
        throw new Error('boom')
      },
    })
    await expect(createPipeline('en', 'direct', {}, () => {})).rejects.toThrow('boom')
  })
})
