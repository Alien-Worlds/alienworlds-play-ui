/**
 * @fileoverview Asset type processing utilities
 *
 * This module handles the processing and mapping of different asset types,
 * providing type-safe functions for determining asset categories and properties.
 */

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { AssetType } from 'store/atomic/types'
import { Constants } from 'shared/util/constants'
import { ASSET_TYPE_MAPPINGS, LEVEL_TEMPLATE_IDS_AS_ORE } from '../constants'
import _ from 'lodash'

/**
 * Determines if a template ID should be treated as Ore
 *
 * @param templateId - The template ID to check
 * @returns True if the template should be treated as Ore
 *
 * @example
 * ```ts
 * const isOre = isOreTemplate('515558') // true
 * const isNotOre = isOreTemplate('123456') // false
 * ```
 */
export const isOreTemplate = (templateId: string): boolean => {
  return LEVEL_TEMPLATE_IDS_AS_ORE.includes(templateId)
}

/**
 * Gets the display name for an asset type
 *
 * @param schema - The asset schema name
 * @param templateId - Optional template ID for special cases
 * @returns The display name for the asset type
 *
 * @example
 * ```ts
 * const typeName = getAssetTypeName('tool.worlds') // 'Tool'
 * const oreName = getAssetTypeName('level.worlds', '515558') // 'Ore'
 * ```
 */
export const getAssetTypeName = (schema: string, templateId?: string): string => {
  if (templateId && isOreTemplate(templateId)) {
    return 'Ore'
  }

  return ASSET_TYPE_MAPPINGS[schema] || 'Unknown'
}

/**
 * Determines if an asset should have its inner ring disabled
 *
 * @param asset - The asset to check
 * @returns True if the inner ring should be disabled
 *
 * @example
 * ```ts
 * const disableRing = shouldDisableInnerRing(landAsset) // true
 * const showRing = shouldDisableInnerRing(toolAsset) // false
 * ```
 */
export const shouldDisableInnerRing = (asset: IAsset): boolean => {
  const schema = _.get(asset, 'schema.schema_name', '')
  const collection = _.get(asset, 'collection.collection_name', '')
  const templateId = _.get(asset, 'template.template_id', _.get(asset, 'template_id', ''))

  const typeName = getAssetTypeName(schema, templateId)

  return (
    typeName === 'Ore' ||
    typeName === 'Land' ||
    typeName === 'Item' ||
    collection === Constants.CONTRACT_ALIEN_AVATARS
  )
}

/**
 * Gets the asset type information
 *
 * @param asset - The asset to process
 * @returns Object containing type information
 *
 * @example
 * ```ts
 * const typeInfo = getAssetTypeInfo(asset)
 * // { name: 'Tool', schema: 'tool.worlds', disableInnerRing: false }
 * ```
 */
export const getAssetTypeInfo = (asset: IAsset) => {
  const schema = _.get(asset, 'schema.schema_name', '')
  const templateId = _.get(asset, 'template.template_id', _.get(asset, 'template_id', ''))

  const name = getAssetTypeName(schema, templateId)
  const disableInnerRing = shouldDisableInnerRing(asset)

  return {
    name,
    schema,
    templateId,
    disableInnerRing,
  }
}

/**
 * Checks if an asset is of a specific type
 *
 * @param asset - The asset to check
 * @param type - The type to check against
 * @returns True if the asset is of the specified type
 *
 * @example
 * ```ts
 * const isTool = isAssetType(asset, AssetType.TOOL) // true/false
 * const isLand = isAssetType(asset, AssetType.LAND) // true/false
 * ```
 */
export const isAssetType = (asset: IAsset, type: AssetType): boolean => {
  const schema = _.get(asset, 'schema.schema_name', '')
  return schema === type
}

/**
 * Gets all asset types present in a collection of assets
 *
 * @param assets - Array of assets to analyze
 * @returns Array of unique asset types
 *
 * @example
 * ```ts
 * const types = getAssetTypesInCollection(assets)
 * // ['Tool', 'Land', 'Weapon', 'Minion']
 * ```
 */
export const getAssetTypesInCollection = (assets: IAsset[]): string[] => {
  const types = new Set<string>()

  assets.forEach((asset) => {
    const typeInfo = getAssetTypeInfo(asset)
    types.add(typeInfo.name)
  })

  return Array.from(types).sort()
}

/**
 * Filters assets by type
 *
 * @param assets - Array of assets to filter
 * @param type - The type to filter by
 * @returns Filtered array of assets
 *
 * @example
 * ```ts
 * const tools = filterAssetsByType(assets, AssetType.TOOL)
 * const lands = filterAssetsByType(assets, AssetType.LAND)
 * ```
 */
export const filterAssetsByType = (assets: IAsset[], type: AssetType): IAsset[] => {
  return assets.filter((asset) => isAssetType(asset, type))
}

/**
 * Groups assets by their type
 *
 * @param assets - Array of assets to group
 * @returns Object with type names as keys and asset arrays as values
 *
 * @example
 * ```ts
 * const grouped = groupAssetsByType(assets)
 * // { 'Tool': [...], 'Land': [...], 'Weapon': [...] }
 * ```
 */
export const groupAssetsByType = (assets: IAsset[]): Record<string, IAsset[]> => {
  const grouped: Record<string, IAsset[]> = {}

  assets.forEach((asset) => {
    const typeInfo = getAssetTypeInfo(asset)
    const typeName = typeInfo.name

    if (!grouped[typeName]) {
      grouped[typeName] = []
    }

    grouped[typeName].push(asset)
  })

  return grouped
}
