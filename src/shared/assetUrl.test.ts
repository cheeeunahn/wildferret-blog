import { describe, expect, it } from 'vitest'
import { resolveAssetUrl } from './assetUrl'

describe('resolveAssetUrl', () => {
  it('puts site paths under the base and leaves absolute URLs alone', () => {
    expect(resolveAssetUrl('/assets/a.png')).toBe(`${import.meta.env.BASE_URL}assets/a.png`)
    expect(resolveAssetUrl('https://example.com/x')).toBe('https://example.com/x')
  })

  it('leaves a fragment on the current page', () => {
    expect(resolveAssetUrl('#지시-파일-정리-기준')).toBe('#지시-파일-정리-기준')
  })
})
