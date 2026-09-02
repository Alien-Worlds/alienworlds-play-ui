import { AssetType } from 'store/atomic/types'

import {
  filterAssetsByType,
  getAssetTypeInfo,
  getAssetTypeName,
  getAssetTypesInCollection,
  groupAssetsByType,
  isAssetType,
  isOreTemplate,
  shouldDisableInnerRing,
} from './assetTypeProcessor'

describe('isOreTemplate', () => {
  it('identifies known ore template ids', () => {
    expect(isOreTemplate('515558')).toBe(true)
  })

  it('rejects unknown template ids', () => {
    expect(isOreTemplate('123456')).toBe(false)
  })
})

describe('getAssetTypeName', () => {
  it('maps a schema to its display name', () => {
    expect(getAssetTypeName(AssetType.TOOL)).toBe('Tool')
    expect(getAssetTypeName(AssetType.LAND)).toBe('Land')
  })

  it('returns Ore when the level template id is an ore template', () => {
    expect(getAssetTypeName(AssetType.LEVEL, '515558')).toBe('Ore')
  })

  it('returns the plain Level name when the template id is not an ore template', () => {
    expect(getAssetTypeName(AssetType.LEVEL, '999999')).toBe('Level')
  })

  it('returns Unknown for an unmapped schema', () => {
    expect(getAssetTypeName('nonexistent.schema')).toBe('Unknown')
  })
})

describe('shouldDisableInnerRing', () => {
  it('disables the ring for Ore assets', () => {
    const asset: any = {
      schema: { schema_name: AssetType.LEVEL },
      template: { template_id: '515558' },
    }
    expect(shouldDisableInnerRing(asset)).toBe(true)
  })

  it('disables the ring for Land assets', () => {
    const asset: any = { schema: { schema_name: AssetType.LAND }, template: { template_id: '1' } }
    expect(shouldDisableInnerRing(asset)).toBe(true)
  })

  it('disables the ring for Item assets', () => {
    const asset: any = { schema: { schema_name: AssetType.ITEMS }, template: { template_id: '1' } }
    expect(shouldDisableInnerRing(asset)).toBe(true)
  })

  it('disables the ring for alienavatars collection assets', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      collection: { collection_name: 'alienavatars' },
      template: { template_id: '1' },
    }
    expect(shouldDisableInnerRing(asset)).toBe(true)
  })

  it('keeps the ring for a regular Tool asset', () => {
    const asset: any = {
      schema: { schema_name: AssetType.TOOL },
      collection: { collection_name: 'other' },
      template: { template_id: '1' },
    }
    expect(shouldDisableInnerRing(asset)).toBe(false)
  })
})

describe('getAssetTypeInfo', () => {
  it('returns name, schema, templateId, and disableInnerRing', () => {
    const asset: any = { schema: { schema_name: AssetType.LAND }, template: { template_id: '1' } }

    expect(getAssetTypeInfo(asset)).toEqual({
      name: 'Land',
      schema: AssetType.LAND,
      templateId: '1',
      disableInnerRing: true,
    })
  })

  it('falls back to top-level template_id when template.template_id is missing', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL }, template_id: '42' }

    expect(getAssetTypeInfo(asset).templateId).toBe('42')
  })
})

describe('isAssetType', () => {
  it('matches when the schema equals the given type', () => {
    const asset: any = { schema: { schema_name: AssetType.TOOL } }
    expect(isAssetType(asset, AssetType.TOOL)).toBe(true)
    expect(isAssetType(asset, AssetType.LAND)).toBe(false)
  })
})

describe('filterAssetsByType', () => {
  it('returns only assets matching the given type', () => {
    const assets: any[] = [
      { id: 1, schema: { schema_name: AssetType.TOOL } },
      { id: 2, schema: { schema_name: AssetType.LAND } },
      { id: 3, schema: { schema_name: AssetType.TOOL } },
    ]

    const tools = filterAssetsByType(assets, AssetType.TOOL) as any[]
    expect(tools).toHaveLength(2)
    expect(tools.map((a) => a.id)).toEqual([1, 3])
  })
})

describe('getAssetTypesInCollection', () => {
  it('returns a sorted list of unique type names present', () => {
    const assets: any[] = [
      { schema: { schema_name: AssetType.TOOL }, template: { template_id: '1' } },
      { schema: { schema_name: AssetType.LAND }, template: { template_id: '1' } },
      { schema: { schema_name: AssetType.TOOL }, template: { template_id: '1' } },
    ]

    expect(getAssetTypesInCollection(assets)).toEqual(['Land', 'Tool'])
  })
})

describe('groupAssetsByType', () => {
  it('groups assets under their type name', () => {
    const toolA: any = {
      id: 1,
      schema: { schema_name: AssetType.TOOL },
      template: { template_id: '1' },
    }
    const toolB: any = {
      id: 2,
      schema: { schema_name: AssetType.TOOL },
      template: { template_id: '1' },
    }
    const land: any = {
      id: 3,
      schema: { schema_name: AssetType.LAND },
      template: { template_id: '1' },
    }

    expect(groupAssetsByType([toolA, toolB, land])).toEqual({
      Tool: [toolA, toolB],
      Land: [land],
    })
  })
})
