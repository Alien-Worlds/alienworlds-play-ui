/**
 * @fileoverview Asset stats and powers processing utilities
 *
 * This module handles the processing of asset statistics, powers, and game mechanics,
 * providing type-safe functions for calculating and formatting asset stats.
 */

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { AssetType, AssetElement, AssetProcess } from 'store/atomic/types'
import { NftRarity } from 'features/mining/utils/constants'
import { ELEMENT_ICON_MAPPINGS, PROCESS_ICON_MAPPINGS } from '../constants'
import _ from 'lodash'

/**
 * Interface for asset power/stat information
 */
export interface AssetPower {
  type: string
  value: number | string
  icon?: string
  label?: string
  elementType?: 'TEXT' | 'NODE'
  styleConfig?: Record<string, any>
}

/**
 * Interface for asset stats configuration
 */
export interface AssetStatsConfig {
  includePowers?: boolean
  includeElements?: boolean
  includeProcesses?: boolean
  formatValues?: boolean
}

/**
 * Gets the ease value for an asset (mining power)
 *
 * @param asset - The asset to get ease for
 * @returns The ease value or null
 *
 * @example
 * ```ts
 * const ease = getAssetEase(asset) // 2.5 or null
 * ```
 */
export const getAssetEase = (asset: IAsset): number | null => {
  const ease = _.get(asset, 'data.ease', null)
  return ease !== null && ease >= 0 ? ease / 10 : null
}

/**
 * Gets the difficulty value for an asset (power)
 *
 * @param asset - The asset to get difficulty for
 * @returns The difficulty value or null
 *
 * @example
 * ```ts
 * const difficulty = getAssetDifficulty(asset) // 150 or null
 * ```
 */
export const getAssetDifficulty = (asset: IAsset): number | null => {
  const difficulty = _.get(asset, 'data.difficulty', null)
  return difficulty !== null && difficulty >= 0 ? difficulty : null
}

/**
 * Gets the luck value for an asset (NFT power)
 *
 * @param asset - The asset to get luck for
 * @returns The luck value or null
 *
 * @example
 * ```ts
 * const luck = getAssetLuck(asset) // 1.5 or null
 * ```
 */
export const getAssetLuck = (asset: IAsset): number | null => {
  const luck = _.get(asset, 'data.luck', null)
  const rarity = _.get(asset, 'data.rarity', null)
  const schema = _.get(asset, 'schema.schema_name', null)

  if (luck === null || luck < 0) {
    return null
  }

  const luckValue = luck / 10

  // Set NFT Power to zero for Abundant Tools
  if (rarity === NftRarity.abundant && schema === 'tool.worlds') {
    return 0
  }

  return luckValue
}

/**
 * Gets the attack value for an asset
 *
 * @param asset - The asset to get attack for
 * @returns The attack value or null
 *
 * @example
 * ```ts
 * const attack = getAssetAttack(asset) // 75 or null
 * ```
 */
export const getAssetAttack = (asset: IAsset): number | null => {
  const attack = _.get(asset, 'data.attack', null)
  return attack !== null && attack >= 0 ? attack : null
}

/**
 * Gets the defense value for an asset
 *
 * @param asset - The asset to get defense for
 * @returns The defense value or null
 *
 * @example
 * ```ts
 * const defense = getAssetDefense(asset) // 60 or null
 * ```
 */
export const getAssetDefense = (asset: IAsset): number | null => {
  const defense = _.get(asset, 'data.defense', null)
  return defense !== null && defense >= 0 ? defense : null
}

/**
 * Gets the move cost for an asset
 *
 * @param asset - The asset to get move cost for
 * @returns The move cost value or null
 *
 * @example
 * ```ts
 * const moveCost = getAssetMoveCost(asset) // 3 or null
 * ```
 */
export const getAssetMoveCost = (asset: IAsset): number | null => {
  const moveCost = _.get(asset, 'data.movecost', null)
  return moveCost !== null && moveCost >= 0 ? moveCost : null
}

/**
 * Gets the element for an asset
 *
 * @param asset - The asset to get element for
 * @returns The element value or null
 *
 * @example
 * ```ts
 * const element = getAssetElement(asset) // 'fire' or null
 * ```
 */
export const getAssetElement = (asset: IAsset): string | null => {
  return _.get(asset, 'data.element', null)
}

/**
 * Gets the process for an asset
 *
 * @param asset - The asset to get process for
 * @returns The process value or null
 *
 * @example
 * ```ts
 * const process = getAssetProcess(asset) // 'catalyst' or null
 * ```
 */
export const getAssetProcess = (asset: IAsset): string | null => {
  return _.get(asset, 'data.process', null)
}

/**
 * Gets the affinity for an asset
 *
 * @param asset - The asset to get affinity for
 * @returns The affinity value or null
 *
 * @example
 * ```ts
 * const affinity = getAssetAffinity(asset) // 'combat' or null
 * ```
 */
export const getAssetAffinity = (asset: IAsset): string | null => {
  return _.get(asset, 'data.affinity', null)
}

/**
 * Gets the artifact type for an asset
 *
 * @param asset - The asset to get artifact type for
 * @returns The artifact type value or null
 *
 * @example
 * ```ts
 * const artifactType = getAssetArtifactType(asset) // 'weapon' or null
 * ```
 */
export const getAssetArtifactType = (asset: IAsset): string | null => {
  return _.get(asset, 'data.artifact_type', null)
}

/**
 * Gets the key for an asset
 *
 * @param asset - The asset to get key for
 * @returns The key value or null
 *
 * @example
 * ```ts
 * const key = getAssetKey(asset) // 'gold' or null
 * ```
 */
export const getAssetKey = (asset: IAsset): string | null => {
  return _.get(asset, 'data.key', null)
}

/**
 * Gets the class for an asset
 *
 * @param asset - The asset to get class for
 * @returns The class value or null
 *
 * @example
 * ```ts
 * const class = getAssetClass(asset) // 'warrior' or null
 * ```
 */
export const getAssetClass = (asset: IAsset): string | null => {
  return _.get(asset, 'data.class', null)
}

/**
 * Gets the level for an asset
 *
 * @param asset - The asset to get level for
 * @returns The level value or null
 *
 * @example
 * ```ts
 * const level = getAssetLevel(asset) // 5 or null
 * ```
 */
export const getAssetLevel = (asset: IAsset): number | null => {
  const level = _.get(asset, 'data.level', null)
  return level !== null && level >= 0 ? level : null
}

/**
 * Gets all powers/stats for an asset based on its type
 *
 * @param asset - The asset to get powers for
 * @param config - Configuration for what to include
 * @returns Array of power objects
 *
 * @example
 * ```ts
 * const powers = getAssetPowers(asset, { includePowers: true })
 * // [{ type: 'ease', value: 2.5, icon: 'MiningIcon' }, ...]
 * ```
 */
export const getAssetPowers = (asset: IAsset, config: AssetStatsConfig = {}): AssetPower[] => {
  const {
    includePowers = true,
    includeElements = true,
    includeProcesses = true,
    formatValues = true,
  } = config

  const powers: AssetPower[] = []
  const schema = _.get(asset, 'schema.schema_name', null)

  if (!includePowers) {
    return powers
  }

  // Add powers based on asset type
  switch (schema) {
    case AssetType.TOOL:
    case AssetType.LAND:
      const ease = getAssetEase(asset)
      if (ease !== null) {
        powers.push({
          type: 'ease',
          value: formatValues ? ease : ease * 10,
          icon: 'MiningIcon',
          label: 'Mining Power',
        })
      }

      const difficulty = getAssetDifficulty(asset)
      if (difficulty !== null) {
        powers.push({
          type: 'difficulty',
          value: difficulty,
          icon: 'LandIcon2',
          label: 'PWR',
        })
      }

      const luck = getAssetLuck(asset)
      if (luck !== null) {
        powers.push({
          type: 'luck',
          value: luck,
          icon: 'NFTOldIcon',
          label: 'NFT Power',
        })
      }
      break

    case AssetType.ARMS:
      const attack = getAssetAttack(asset)
      if (attack !== null) {
        powers.push({
          type: 'attack',
          value: attack,
          icon: 'AttackIcon2',
          label: 'Attack',
        })
      }

      const defense = getAssetDefense(asset)
      if (defense !== null) {
        powers.push({
          type: 'defense',
          value: defense,
          icon: 'DefenseIcon2',
          label: 'Defense',
        })
      }
      break

    case AssetType.CREW:
      const crewAttack = getAssetAttack(asset)
      if (crewAttack !== null) {
        powers.push({
          type: 'attack',
          value: crewAttack,
          icon: 'AttackIcon2',
          label: 'Attack',
        })
      }

      const moveCost = getAssetMoveCost(asset)
      if (moveCost !== null) {
        powers.push({
          type: 'moveCost',
          value: moveCost,
          icon: 'StackingIcon',
          label: 'Move Cost',
        })
      }

      const crewDefense = getAssetDefense(asset)
      if (crewDefense !== null) {
        powers.push({
          type: 'defense',
          value: crewDefense,
          icon: 'DefenseIcon2',
          label: 'Defense',
        })
      }
      break

    case AssetType.ITEMS:
      const affinity = getAssetAffinity(asset)
      if (affinity) {
        powers.push({
          type: 'affinity',
          value: affinity,
          label: 'Affinity',
        })
      }

      if (includeElements) {
        const element = getAssetElement(asset)
        if (element) {
          powers.push({
            type: 'element',
            value: element,
            icon: ELEMENT_ICON_MAPPINGS[element] || 'ElementIcon',
            label: 'Element',
          })
        }
      }

      const artifactType = getAssetArtifactType(asset)
      if (artifactType) {
        powers.push({
          type: 'artifactType',
          value: artifactType,
          label: 'Item Type',
        })
      }
      break

    case AssetType.LEVEL:
      const key = getAssetKey(asset)
      if (key) {
        powers.push({
          type: 'key',
          value: key,
          icon: 'CraftIcon',
          label: 'Key',
        })
      }

      if (includeElements) {
        const levelElement = getAssetElement(asset)
        if (levelElement) {
          powers.push({
            type: 'element',
            value: levelElement,
            icon: ELEMENT_ICON_MAPPINGS[levelElement] || 'ElementIcon',
            label: 'Element',
          })
        }
      }

      if (includeProcesses) {
        const process = getAssetProcess(asset)
        if (process) {
          powers.push({
            type: 'process',
            value: process,
            icon: PROCESS_ICON_MAPPINGS[process] || 'ProcessIcon',
            label: 'Process',
          })
        }
      }
      break
  }

  return powers
}

/**
 * Gets a summary of all stats for an asset
 *
 * @param asset - The asset to get stats summary for
 * @returns Object containing all available stats
 *
 * @example
 * ```ts
 * const stats = getAssetStatsSummary(asset)
 * // { ease: 2.5, difficulty: 150, luck: 1.5, attack: 75, ... }
 * ```
 */
export const getAssetStatsSummary = (asset: IAsset): Record<string, any> => {
  return {
    ease: getAssetEase(asset),
    difficulty: getAssetDifficulty(asset),
    luck: getAssetLuck(asset),
    attack: getAssetAttack(asset),
    defense: getAssetDefense(asset),
    moveCost: getAssetMoveCost(asset),
    element: getAssetElement(asset),
    process: getAssetProcess(asset),
    affinity: getAssetAffinity(asset),
    artifactType: getAssetArtifactType(asset),
    key: getAssetKey(asset),
    class: getAssetClass(asset),
    level: getAssetLevel(asset),
  }
}
