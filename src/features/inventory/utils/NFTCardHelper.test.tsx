jest.mock('shared/util/config', () => ({
  config: { IpfsApiUrl: 'https://ipfs.example/ipfs' },
}))

jest.mock(
  'assets/data/cardImgMappings.json',
  () => [{ Cardid: 10, Schema: 'tool.worlds', IPFSHash: 'QmRegularHash' }],
  { virtual: true }
)
jest.mock('assets/data/cardPortraitImgMappings.json', () => [], { virtual: true })
jest.mock('assets/data/templateImageMappings.json', () => [], { virtual: true })
jest.mock('assets/images/boosts/megaboost.gif', () => 'mega-boost.gif', { virtual: true })
jest.mock('assets/images/boosts/superboost.gif', () => 'super-boost.gif', { virtual: true })

import { NftRarity } from 'features/mining/utils/constants'
import { AssetType } from 'store/atomic/types'

import {
  CommunityNftCardDataPreparation,
  ELEMENTTYPES,
  getPlanetGradient,
  levelTemplateIdsAsOre,
  NFTCardDataPreparation,
  NFTCardSingleCardPrep,
  setCardPowers,
} from './NFTCardHelper'

describe('NFTCardDataPreparation', () => {
  it('returns an empty array for empty/undefined input', () => {
    expect(NFTCardDataPreparation([])).toEqual([])
    expect(NFTCardDataPreparation(undefined)).toEqual([])
  })

  it('processes a Tool asset', () => {
    const asset: any = {
      asset_id: '1',
      schema: { schema_name: AssetType.TOOL },
      data: {
        name: 'Pickaxe',
        type: 'Mining',
        ease: 25,
        difficulty: 150,
        luck: 15,
        rarity: 'Rare',
        shine: 'Gold',
      },
    }

    const [card] = NFTCardDataPreparation([asset])

    expect(card.type).toEqual({ name: 'Tool', element: ELEMENTTYPES.TEXT, styleConfig: {} })
    expect(card.title).toEqual({ name: 'Pickaxe', element: ELEMENTTYPES.TEXT, styleConfig: {} })
    expect(card.rarity).toEqual({ name: 'rare', element: ELEMENTTYPES.TEXT, styleConfig: {} })
    expect(card.disableInnerRing).toBe(false)
    expect(card.ease.name).toBe(2.5)
    expect(card.difficulty.name).toBe(150)
    expect(card.luck.name).toBe(1.5)
  })

  it('processes a Land asset title/description/mod/commission/rating and disables the inner ring', () => {
    const asset: any = {
      schema: { schema_name: AssetType.LAND },
      data: { name: 'Naron Region One Planet', delay: 30, x: 3, y: 4 },
      mutable_data: { commission: 250, landrating: 42 },
    }

    const [card] = NFTCardDataPreparation([asset])

    expect(card.title.name).toBe('Naron Region')
    expect(card.description.name).toBe('Planet')
    expect(card.chargeValue.name).toBe('3x')
    expect(card.commission.name).toBe(2.5)
    expect(card.landrating.name).toBe(42)
    expect(card.disableInnerRing).toBe(true)
    expect(card.mod).toEqual([
      { name: '3:4', elementType: ELEMENTTYPES.TEXT, styleConfig: expect.any(Object) },
      expect.objectContaining({ elementType: ELEMENTTYPES.NODE }),
    ])
  })

  it('flags Ore for level assets on the ore template id list', () => {
    const asset: any = {
      schema: { schema_name: AssetType.LEVEL },
      template: { template_id: levelTemplateIdsAsOre[0] },
      data: { name: 'Ore Chunk' },
    }

    const [card] = NFTCardDataPreparation([asset])
    expect(card.type.name).toBe('Ore')
    expect(card.disableInnerRing).toBe(true)
  })

  it('describes an alien avatar by its trait fields', () => {
    const asset: any = {
      schema: { schema_name: AssetType.FACES },
      collection: { collection_name: 'alienavatars' },
      data: {
        name: 'Avatar',
        top: 'hat',
        head: 'green',
        legs: 'boots',
        torso: 'shirt',
        equipment: 'sword',
        background: 'forest',
      },
    }

    const [card] = NFTCardDataPreparation([asset])
    expect(card.description.name).toBe('hat, green, boots, shirt, sword, forest')
    expect(card.disableInnerRing).toBe(true)
  })

  it('adds ownership metadata and marks assets present in the bag', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      owner: 'Wallet.WAM',
      template: { template_id: '42' },
    }

    const [card] = NFTCardDataPreparation([asset], 'wallet.wam', [
      { template: { template_id: '42' } },
    ])
    expect(card.owner).toEqual({ name: 'wallet.wam', element: ELEMENTTYPES.TEXT, styleConfig: {} })
    expect(card.isUserOwner).toBe(true)
    expect(card.isInBag).toBe(true)
  })

  it('skips bag-status processing when no bagAssets are given', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { name: 'Pickaxe' } }
    const [card] = NFTCardDataPreparation([asset])
    expect(card.isInBag).toBeUndefined()
  })

  it('sets multipleMintTypes when more than one copy exists', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      total_of_type: 3,
    }
    const [card] = NFTCardDataPreparation([asset])
    expect(card.multipleMintTypes).toBe(true)
    expect(card.cardcopies).toEqual({ name: 3, element: ELEMENTTYPES.TEXT, styleConfig: {} })
  })
})

describe('NFTCardSingleCardPrep', () => {
  it('processes a single asset the same way as the batch preparation', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { name: 'Pickaxe' } }
    const card = NFTCardSingleCardPrep(asset, 'wallet.wam')
    expect(card.title.name).toBe('Pickaxe')
    expect(card.type.name).toBe('Tool')
  })
})

describe('CommunityNftCardDataPreparation', () => {
  it('only sets title, image, rarity, and artist', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Community Pick', rarity: 'Epic', artist: 'Some Artist' },
    }

    const card = CommunityNftCardDataPreparation(asset)
    expect(card.title.name).toBe('Community Pick')
    expect(card.rarity.name).toBe('epic')
    expect(card.artist.name).toBe('Some Artist')
    expect(card.type).toBeUndefined()
  })
})

describe('setCardPowers', () => {
  it('derives Tool powers from a raw IAsset (has data)', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { ease: 25, difficulty: 150, luck: 15 },
    }
    const temp: any = {}
    setCardPowers(asset, temp)

    expect(temp.cardPowers[0][1]).toEqual(
      expect.objectContaining({ name: 2.5, elementType: ELEMENTTYPES.TEXT })
    )
    expect(temp.cardPowers[1][1]).toEqual(expect.objectContaining({ name: 150 }))
    expect(temp.cardPowers[2][0]).toEqual(expect.objectContaining({ name: 1.5 }))
  })

  it('zeroes luck for Abundant tools from a raw IAsset', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { luck: 15, rarity: NftRarity.abundant },
    }
    const temp: any = {}
    setCardPowers(asset, temp)

    expect(temp.cardPowers[2][0]).toEqual(expect.objectContaining({ name: 0 }))
  })

  it('derives powers from an already-processed NFTCardTypes object (no data field)', () => {
    const alreadyProcessed: any = {
      type: { name: 'Tool' },
      ease: { name: 25 },
      difficulty: { name: 150 },
      luck: { name: 1.5 },
      rarity: { name: 'rare' },
    }
    const temp: any = {}
    setCardPowers(alreadyProcessed, temp)

    expect(temp.cardPowers[0][1]).toEqual(expect.objectContaining({ name: 25 }))
    expect(temp.cardPowers[2][0]).toEqual(expect.objectContaining({ name: 1.5 }))
  })

  it('zeroes luck for Abundant tools from an already-processed object', () => {
    const alreadyProcessed: any = {
      type: { name: 'Tool' },
      luck: { name: 1.5 },
      rarity: { name: 'abundant' },
    }
    const temp: any = {}
    setCardPowers(alreadyProcessed, temp)

    expect(temp.cardPowers[2][0]).toEqual(expect.objectContaining({ name: 0 }))
  })
})

describe('getPlanetGradient', () => {
  it('returns the gradient for a known planet name, case-insensitively', () => {
    expect(getPlanetGradient('Naron')).toBe(
      'linear-gradient(133deg, rgb(180,187,231) 50%, rgb(76,122,32) 100%)'
    )
    expect(getPlanetGradient('  naron  ')).toBe(
      'linear-gradient(133deg, rgb(180,187,231) 50%, rgb(76,122,32) 100%)'
    )
  })

  it('returns undefined for an unknown planet name', () => {
    expect(getPlanetGradient('mars')).toBeUndefined()
  })
})
