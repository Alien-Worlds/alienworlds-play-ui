import { updateLandRating } from './landownerUtils'

const assets: any[] = [
  { asset_id: '1', mutable_data: { landrating: '10', commission: 500 } },
  { asset_id: '2', mutable_data: { landrating: '20' } },
]

describe('updateLandRating', () => {
  it('copies the managed land rating onto the matching asset only', () => {
    const result = updateLandRating(assets, {
      asset_id: '1',
      mutable_data: { landrating: '99' },
    } as any)

    expect(result).toEqual([
      { asset_id: '1', mutable_data: { landrating: '99', commission: 500 } },
      assets[1],
    ])
    expect(assets[0].mutable_data.landrating).toBe('10')
  })

  it('returns the assets unchanged when the land has no rating', () => {
    expect(updateLandRating(assets, { asset_id: '1', mutable_data: {} } as any)).toBe(assets)
    expect(updateLandRating(assets, null)).toBe(assets)
  })
})
