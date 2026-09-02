import { NftRarity } from 'features/mining/utils/constants'
import { AssetElement, AssetProcess, AssetType } from 'store/atomic/types'

import {
  getAssetAffinity,
  getAssetArtifactType,
  getAssetAttack,
  getAssetClass,
  getAssetDefense,
  getAssetDifficulty,
  getAssetEase,
  getAssetElement,
  getAssetKey,
  getAssetLevel,
  getAssetLuck,
  getAssetMoveCost,
  getAssetPowers,
  getAssetProcess,
  getAssetStatsSummary,
} from './assetStatsProcessor'

describe('single-stat getters', () => {
  it('getAssetEase divides raw ease by 10', () => {
    expect(getAssetEase({ data: { ease: 25 } } as any)).toBe(2.5)
  })

  it('getAssetEase returns null when absent or negative', () => {
    expect(getAssetEase({ data: {} } as any)).toBeNull()
    expect(getAssetEase({ data: { ease: -1 } } as any)).toBeNull()
  })

  it('getAssetDifficulty passes through non-negative values', () => {
    expect(getAssetDifficulty({ data: { difficulty: 150 } } as any)).toBe(150)
    expect(getAssetDifficulty({ data: { difficulty: -1 } } as any)).toBeNull()
  })

  it('getAssetLuck divides raw luck by 10', () => {
    const asset: any = {
      data: { luck: 15, rarity: NftRarity.rare },
      schema: { schema_name: 'tool.worlds' },
    }
    expect(getAssetLuck(asset)).toBe(1.5)
  })

  it('getAssetLuck zeroes NFT power for Abundant tools', () => {
    const asset: any = {
      data: { luck: 15, rarity: NftRarity.abundant },
      schema: { schema_name: 'tool.worlds' },
    }
    expect(getAssetLuck(asset)).toBe(0)
  })

  it('getAssetLuck keeps the value for Abundant non-tool schemas', () => {
    const asset: any = {
      data: { luck: 15, rarity: NftRarity.abundant },
      schema: { schema_name: 'land.worlds' },
    }
    expect(getAssetLuck(asset)).toBe(1.5)
  })

  it('getAssetLuck returns null for negative luck', () => {
    expect(getAssetLuck({ data: { luck: -1 } } as any)).toBeNull()
  })

  it('getAssetAttack/getAssetDefense/getAssetMoveCost/getAssetLevel pass through non-negative values', () => {
    expect(getAssetAttack({ data: { attack: 75 } } as any)).toBe(75)
    expect(getAssetAttack({ data: { attack: -1 } } as any)).toBeNull()
    expect(getAssetDefense({ data: { defense: 60 } } as any)).toBe(60)
    expect(getAssetMoveCost({ data: { movecost: 3 } } as any)).toBe(3)
    expect(getAssetLevel({ data: { level: 5 } } as any)).toBe(5)
  })

  it('getAssetElement/getAssetProcess/getAssetAffinity/getAssetArtifactType/getAssetKey/getAssetClass read from data', () => {
    const asset: any = {
      data: {
        element: AssetElement.FIRE,
        process: AssetProcess.CATALYST,
        affinity: 'combat',
        artifact_type: 'weapon',
        key: 'gold',
        class: 'warrior',
      },
    }
    expect(getAssetElement(asset)).toBe(AssetElement.FIRE)
    expect(getAssetProcess(asset)).toBe(AssetProcess.CATALYST)
    expect(getAssetAffinity(asset)).toBe('combat')
    expect(getAssetArtifactType(asset)).toBe('weapon')
    expect(getAssetKey(asset)).toBe('gold')
    expect(getAssetClass(asset)).toBe('warrior')
  })
})

describe('getAssetPowers', () => {
  it('returns ease/difficulty/luck powers for Tool and Land schemas', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      data: { ease: 25, difficulty: 150, luck: 15, rarity: NftRarity.rare },
    }

    const powers = getAssetPowers(asset)
    expect(powers).toEqual([
      { type: 'ease', value: 2.5, icon: 'MiningIcon', label: 'Mining Power' },
      { type: 'difficulty', value: 150, icon: 'LandIcon2', label: 'PWR' },
      { type: 'luck', value: 1.5, icon: 'NFTOldIcon', label: 'NFT Power' },
    ])
  })

  it('un-formats ease when formatValues is false', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { ease: 25 } }
    const powers = getAssetPowers(asset, { formatValues: false })
    expect(powers[0]).toEqual({
      type: 'ease',
      value: 25,
      icon: 'MiningIcon',
      label: 'Mining Power',
    })
  })

  it('returns attack/defense powers for Arms schema', () => {
    const asset: any = {
      schema: { schema_name: AssetType.ARMS },
      data: { attack: 75, defense: 60 },
    }

    expect(getAssetPowers(asset)).toEqual([
      { type: 'attack', value: 75, icon: 'AttackIcon2', label: 'Attack' },
      { type: 'defense', value: 60, icon: 'DefenseIcon2', label: 'Defense' },
    ])
  })

  it('returns attack/moveCost/defense powers for Crew schema', () => {
    const asset: any = {
      schema: { schema_name: AssetType.CREW },
      data: { attack: 10, movecost: 3, defense: 5 },
    }

    expect(getAssetPowers(asset)).toEqual([
      { type: 'attack', value: 10, icon: 'AttackIcon2', label: 'Attack' },
      { type: 'moveCost', value: 3, icon: 'StackingIcon', label: 'Move Cost' },
      { type: 'defense', value: 5, icon: 'DefenseIcon2', label: 'Defense' },
    ])
  })

  it('returns affinity/element/artifactType powers for Items schema', () => {
    const asset: any = {
      schema: { schema_name: AssetType.ITEMS },
      data: { affinity: 'combat', element: AssetElement.FIRE, artifact_type: 'weapon' },
    }

    expect(getAssetPowers(asset)).toEqual([
      { type: 'affinity', value: 'combat', label: 'Affinity' },
      { type: 'element', value: AssetElement.FIRE, icon: 'ElementFireIcon', label: 'Element' },
      { type: 'artifactType', value: 'weapon', label: 'Item Type' },
    ])
  })

  it('omits element for Items schema when includeElements is false', () => {
    const asset: any = {
      schema: { schema_name: AssetType.ITEMS },
      data: { element: AssetElement.FIRE },
    }

    expect(getAssetPowers(asset, { includeElements: false })).toEqual([])
  })

  it('returns key/element/process powers for Level schema', () => {
    const asset: any = {
      schema: { schema_name: AssetType.LEVEL },
      data: { key: 'gold', element: AssetElement.METAL, process: AssetProcess.FUSION },
    }

    expect(getAssetPowers(asset)).toEqual([
      { type: 'key', value: 'gold', icon: 'CraftIcon', label: 'Key' },
      { type: 'element', value: AssetElement.METAL, icon: 'ElementMetalIcon', label: 'Element' },
      { type: 'process', value: AssetProcess.FUSION, icon: 'FusionIcon3', label: 'Process' },
    ])
  })

  it('omits process for Level schema when includeProcesses is false', () => {
    const asset: any = {
      schema: { schema_name: AssetType.LEVEL },
      data: { process: AssetProcess.FUSION },
    }

    expect(getAssetPowers(asset, { includeProcesses: false })).toEqual([])
  })

  it('returns an empty array when includePowers is false', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL }, data: { ease: 25 } }
    expect(getAssetPowers(asset, { includePowers: false })).toEqual([])
  })

  it('returns an empty array for an unrecognized schema', () => {
    const asset: any = { schema: { schema_name: 'unknown.schema' }, data: {} }
    expect(getAssetPowers(asset)).toEqual([])
  })
})

describe('getAssetStatsSummary', () => {
  it('collects every stat getter into one object', () => {
    const asset: any = {
      schema: { schema_name: 'tool.worlds' },
      data: {
        ease: 25,
        difficulty: 150,
        luck: 15,
        rarity: NftRarity.rare,
        attack: 75,
        defense: 60,
        movecost: 3,
        element: AssetElement.FIRE,
        process: AssetProcess.CATALYST,
        affinity: 'combat',
        artifact_type: 'weapon',
        key: 'gold',
        class: 'warrior',
        level: 5,
      },
    }

    expect(getAssetStatsSummary(asset)).toEqual({
      ease: 2.5,
      difficulty: 150,
      luck: 1.5,
      attack: 75,
      defense: 60,
      moveCost: 3,
      element: AssetElement.FIRE,
      process: AssetProcess.CATALYST,
      affinity: 'combat',
      artifactType: 'weapon',
      key: 'gold',
      class: 'warrior',
      level: 5,
    })
  })
})
