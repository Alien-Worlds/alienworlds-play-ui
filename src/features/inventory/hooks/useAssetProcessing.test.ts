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

import { renderHook } from '@testing-library/react'
import { NftRarity } from 'features/mining/utils/constants'
import { AssetElement, AssetProcess, AssetType } from 'store/atomic/types'

import { useAssetProcessing } from './useAssetProcessing'

const setup = () => renderHook(() => useAssetProcessing()).result.current

describe('processAsset', () => {
  it('processes a Tool asset', () => {
    const { processAsset } = setup()
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

    const card = processAsset(asset)

    expect(card.assetId.name).toBe('1')
    expect(card.type.name).toBe('Tool')
    expect(card.title.name).toBe('Pickaxe')
    expect(card.rarity).toEqual({ name: 'rare', element: 'TEXT', styleConfig: {} })
    expect(card.shine).toEqual({ name: 'gold', element: 'TEXT', styleConfig: {} })
    expect(card.ease.name).toBe('2.5')
    expect(card.difficulty.name).toBe('150')
    expect(card.luck.name).toBe('1.5')
    expect(card.subType).toEqual({
      name: 'Mining',
      label: 'Type',
      element: 'TEXT',
      elementType: 'TEXT',
      styleConfig: {},
    })
  })

  it('zeroes displayed luck for Abundant tools', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe', luck: 15, rarity: NftRarity.abundant },
    }

    expect(processAsset(asset).luck.name).toBe('0')
  })

  it('processes a Land asset title/description/mod/commission/rating', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.LAND },
      data: { name: 'Naron Region One Planet', delay: 30, x: 3, y: 4 },
      mutable_data: { commission: 250, landrating: 42 },
    }

    const card = processAsset(asset)

    expect(card.title.name).toBe('Naron Region')
    expect(card.description.name).toBe('Planet')
    expect(card.chargeValue.name).toBe('3x')
    expect(card.mod).toEqual([
      {
        name: '3:4',
        elementType: 'TEXT',
        styleConfig: { fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, letterSpacing: 2 },
      },
      expect.objectContaining({ elementType: 'NODE' }),
    ])
    expect(card.commission.name).toBe('2.5')
    expect(card.landrating.name).toBe('42')
  })

  it('describes an alien avatar by its trait fields', () => {
    const { processAsset } = setup()
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

    expect(processAsset(asset).description.name).toBe('hat, green, boots, shirt, sword, forest')
  })

  it('processes Arms attack/defense and class mod', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.ARMS },
      data: { name: 'Sword', attack: 75, defense: 60, class: 'melee' },
    }

    const card = processAsset(asset)
    expect(card.attack.name).toBe('75')
    expect(card.defense.name).toBe('60')
    expect(card.mod).toEqual([expect.objectContaining({ name: 'melee', elementType: 'TEXT' })])
  })

  it('processes Crew attack/moveCast/defense', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.CREW },
      data: { name: 'Alien', attack: 10, movecost: 3, defense: 5 },
    }

    const card = processAsset(asset)
    expect(card.attack.name).toBe('10')
    expect(card.moveCast.name).toBe('3')
    expect(card.defense.name).toBe('5')
  })

  it('processes element and process icons/text when present', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.LEVEL },
      data: {
        name: 'Ore',
        key: 'gold',
        element: AssetElement.FIRE,
        process: AssetProcess.CATALYST,
      },
    }

    const card = processAsset(asset)
    expect(card.key.name).toBe('gold')
    expect(card.element.name).toBe(AssetElement.FIRE)
    expect(card.process.name).toBe(AssetProcess.CATALYST)
    expect(card.elementIcon).toEqual(
      expect.objectContaining({ element: 'NODE', styleConfig: expect.any(Object) })
    )
    expect(card.processIcon).toEqual(
      expect.objectContaining({ element: 'NODE', styleConfig: expect.any(Object) })
    )
  })

  it('omits element/process icons when the asset has no element/process', () => {
    const { processAsset } = setup()
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { name: 'Pickaxe' } }

    const card = processAsset(asset)
    expect(card.elementIcon).toBeNull()
    expect(card.processIcon).toBeNull()
  })

  it('adds ownership metadata when walletId is provided', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      owner: 'Wallet.WAM',
    }

    const card = processAsset(asset, { walletId: 'wallet.wam' })
    expect(card.owner.name).toBe('wallet.wam')
    expect(card.isUserOwner).toBe(true)
  })

  it('flags isUserOwner false when the owner does not match walletId', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      owner: 'someoneelse.wam',
    }

    expect(processAsset(asset, { walletId: 'wallet.wam' }).isUserOwner).toBe(false)
  })

  it('flags isInBag when a matching template is present in bagAssets', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      template: { template_id: '42' },
    }
    const bagAssets = [{ template: { template_id: '42' } }]

    expect(processAsset(asset, { bagAssets }).isInBag).toBe(true)
  })

  it('includes mint and copies metadata when present', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      template_mint: '5',
      total_of_type: 3,
    }

    const card = processAsset(asset)
    expect(card.mints.name).toBe('5')
    expect(card.cardcopies).toBe('3')
    expect(card.multipleMintTypes).toBe(true)
  })

  it('resolves the boost image for boost cardids', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Boost', cardid: 45 },
    }

    expect(processAsset(asset).nftImage.name).toBe('mega-boost.gif')
  })

  it('resolves the portrait image for cardids in the portrait range', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { name: 'Pickaxe', cardid: 35, shine: 1 },
    }

    expect(processAsset(asset).nftImage.name).toBe('https://ipfs.example/ipfs/QmPortraitHash')
  })

  it('resolves a templateLookup image via the template mapping', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { name: 'Pickaxe', cardid: 11 },
      template: { template_id: 999 },
    }

    expect(processAsset(asset).nftImage.name).toBe('https://ipfs.example/ipfs/QmTemplateHash')
  })

  it('falls back to the asset own image when nothing maps', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { name: 'Pickaxe', cardid: 999, img: 'QmOwn' },
    }

    expect(processAsset(asset).nftImage.name).toBe('https://ipfs.example/ipfs/QmOwn')
  })

  it('skips image processing when includeImages is false', () => {
    const { processAsset } = setup()
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { name: 'Pickaxe' } }

    expect(processAsset(asset, { includeImages: false }).nftImage).toBeUndefined()
  })

  it('skips power processing when includePowers is false', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe', ease: 25 },
    }

    expect(processAsset(asset, { includePowers: false }).cardPowers).toBeUndefined()
  })

  it('skips metadata processing when includeMetadata is false', () => {
    const { processAsset } = setup()
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { name: 'Pickaxe' },
      owner: 'wallet.wam',
      template_mint: '5',
    }

    const card = processAsset(asset, { includeMetadata: false, walletId: 'wallet.wam' })
    expect(card.owner).toBeUndefined()
    expect(card.mints).toBeUndefined()
  })
})

describe('getAssetPowers', () => {
  it('derives ease/difficulty/luck powers from raw data', () => {
    const { getAssetPowers } = setup()
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { ease: 25, difficulty: 150, luck: 15 },
    }

    expect(getAssetPowers(asset)).toEqual([
      { type: 'ease', value: 2.5, icon: 'MiningIcon' },
      { type: 'difficulty', value: 150, icon: 'LandIcon2' },
      { type: 'luck', value: 1.5, icon: 'NFTOldIcon' },
    ])
  })

  it('zeroes luck for Abundant tools', () => {
    const { getAssetPowers } = setup()
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: { luck: 15, rarity: NftRarity.abundant },
    }

    expect(getAssetPowers(asset)).toEqual([{ type: 'luck', value: 0, icon: 'NFTOldIcon' }])
  })
})

describe('getAssetImage', () => {
  it('returns the fallback default image when nothing matches', () => {
    const { getAssetImage } = setup()
    const asset: any = { schema: { schema_name: 'unknown.schema' }, data: { cardid: 999 } }

    expect(getAssetImage(asset)).toBe('/images/alienworlds-profile-sample01.jpg')
  })
})

describe('processAssets', () => {
  it('maps processAsset over every asset in the array', () => {
    const { processAssets } = setup()
    const assets: any[] = [
      { schema: { schema_name: AssetType.TOOL }, data: { name: 'A' } },
      { schema: { schema_name: AssetType.TOOL }, data: { name: 'B' } },
    ]

    const cards = processAssets(assets)
    expect(cards).toHaveLength(2)
    expect(cards.map((c) => c.title.name)).toEqual(['A', 'B'])
  })
})
