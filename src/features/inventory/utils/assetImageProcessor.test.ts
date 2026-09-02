jest.mock('shared/util/config', () => ({
  config: { IpfsApiUrl: 'https://ipfs.example/ipfs' },
}))

jest.mock(
  'assets/data/cardImgMappings.json',
  () => [
    { Cardid: 10, Schema: 'tool.worlds', IPFSHash: 'QmRegularHash' },
    { Cardid: 11, Schema: 'tool.worlds', IPFSHash: 'templateLookup' },
  ],
  { virtual: true }
)

jest.mock(
  'assets/data/cardPortraitImgMappings.json',
  () => [{ Cardid: 35, Shine: 1, PortraitImage: 'QmPortraitHash' }],
  { virtual: true }
)

jest.mock(
  'assets/data/templateImageMappings.json',
  () => [{ Template: 999, IPFSHash: 'QmTemplateHash' }],
  { virtual: true }
)

jest.mock('assets/images/boosts/megaboost.gif', () => 'mega-boost.gif', { virtual: true })
jest.mock('assets/images/boosts/superboost.gif', () => 'super-boost.gif', { virtual: true })

import {
  buildIPFSUrl,
  getAssetImageUrl,
  getBoostImage,
  getFallbackImageUrl,
  getPortraitImageHash,
  getRegularImageHash,
  getTemplateImageHash,
  isBoostCard,
  shouldUsePortraitMapping,
  validateImageUrl,
} from './assetImageProcessor'

describe('isBoostCard', () => {
  it('identifies mega boost and super boost card ids', () => {
    expect(isBoostCard({ data: { cardid: 45 } } as any)).toBe(true)
    expect(isBoostCard({ data: { cardid: 46 } } as any)).toBe(true)
  })

  it('rejects a regular card id', () => {
    expect(isBoostCard({ data: { cardid: 1 } } as any)).toBe(false)
  })
})

describe('getBoostImage', () => {
  it('returns the mega boost image', () => {
    expect(getBoostImage({ data: { cardid: 45 } } as any)).toBe('mega-boost.gif')
  })

  it('returns the super boost image', () => {
    expect(getBoostImage({ data: { cardid: 46 } } as any)).toBe('super-boost.gif')
  })

  it('returns null for a non-boost card', () => {
    expect(getBoostImage({ data: { cardid: 1 } } as any)).toBeNull()
  })
})

describe('shouldUsePortraitMapping', () => {
  it('is true for tool cards in the portrait cardid range', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 35 } }
    expect(shouldUsePortraitMapping(asset)).toBe(true)
  })

  it('is false outside the cardid range', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 50 } }
    expect(shouldUsePortraitMapping(asset)).toBe(false)
  })

  it('is false for a non-tool schema', () => {
    const asset: any = { schema: { schema_name: 'land.worlds' }, data: { cardid: 35 } }
    expect(shouldUsePortraitMapping(asset)).toBe(false)
  })
})

describe('getPortraitImageHash', () => {
  it('returns the mapped portrait hash for a matching cardid/shine pair', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 35, shine: 1 } }
    expect(getPortraitImageHash(asset)).toBe('QmPortraitHash')
  })

  it('returns null when the asset does not use portrait mapping', () => {
    const asset: any = { schema: { schema_name: 'land.worlds' }, data: { cardid: 35, shine: 1 } }
    expect(getPortraitImageHash(asset)).toBeNull()
  })
})

describe('getRegularImageHash', () => {
  it('returns the mapped IPFS hash', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 10 } }
    expect(getRegularImageHash(asset)).toBe('QmRegularHash')
  })

  it('falls through to template lookup when marked templateLookup', () => {
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { cardid: 11 },
      template: { template_id: 999 },
    }
    expect(getRegularImageHash(asset)).toBe('QmTemplateHash')
  })

  it('returns null when there is no mapping', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 999 } }
    expect(getRegularImageHash(asset)).toBeNull()
  })
})

describe('getTemplateImageHash', () => {
  it('matches by the asset template_id', () => {
    const asset: any = { template_id: 999 }
    expect(getTemplateImageHash(asset)).toBe('QmTemplateHash')
  })

  it('matches by template.template_id when template_id is absent', () => {
    const asset: any = { template: { template_id: 999 } }
    expect(getTemplateImageHash(asset)).toBe('QmTemplateHash')
  })

  it('returns null when no template matches', () => {
    const asset: any = { template_id: 1 }
    expect(getTemplateImageHash(asset)).toBeNull()
  })
})

describe('buildIPFSUrl', () => {
  it('joins the configured IPFS base url with the hash', () => {
    expect(buildIPFSUrl('QmHash')).toBe('https://ipfs.example/ipfs/QmHash')
  })
})

describe('getFallbackImageUrl', () => {
  it("uses the asset's own image when present", () => {
    const asset: any = { data: { img: 'QmOwnImage' } }
    expect(getFallbackImageUrl(asset)).toBe('https://ipfs.example/ipfs/QmOwnImage')
  })

  it('falls back to the default image when the asset has none', () => {
    const asset: any = { data: {} }
    expect(getFallbackImageUrl(asset)).toBe('/images/alienworlds-profile-sample01.jpg')
  })
})

describe('getAssetImageUrl', () => {
  it('prioritizes boost images', () => {
    const asset: any = { data: { cardid: 45, img: 'QmOwnImage' } }
    expect(getAssetImageUrl(asset)).toBe('mega-boost.gif')
  })

  it('falls to portrait mapping when not a boost card', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 35, shine: 1 } }
    expect(getAssetImageUrl(asset)).toBe('https://ipfs.example/ipfs/QmPortraitHash')
  })

  it('falls to regular mapping when not a boost or portrait card', () => {
    const asset: any = { schema: { schema_name: 'tool.worlds' }, data: { cardid: 10 } }
    expect(getAssetImageUrl(asset)).toBe('https://ipfs.example/ipfs/QmRegularHash')
  })

  it('falls all the way to the asset own image when nothing maps', () => {
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { cardid: 999, img: 'QmOwn' },
    }
    expect(getAssetImageUrl(asset)).toBe('https://ipfs.example/ipfs/QmOwn')
  })
})

describe('validateImageUrl', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('resolves true when the response is ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any
    await expect(validateImageUrl('https://example.com/img.png')).resolves.toBe(true)
  })

  it('resolves false when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any
    await expect(validateImageUrl('https://example.com/img.png')).resolves.toBe(false)
  })

  it('resolves false when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as any
    await expect(validateImageUrl('https://example.com/img.png')).resolves.toBe(false)
  })
})
