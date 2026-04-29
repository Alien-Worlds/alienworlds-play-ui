/**
 * @fileoverview Asset image processing utilities
 *
 * This module handles the processing and URL generation for asset images,
 * including special cases for boost images and IPFS hash resolution.
 */

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { BOOST_CARD_IDS, ASSET_PROCESSING } from '../constants'
import { config } from 'shared/util/config'
import mappingImages from 'assets/data/cardImgMappings.json'
import mappingPortraits from 'assets/data/cardPortraitImgMappings.json'
import templateMappings from 'assets/data/templateImageMappings.json'
import MegaBoostImg from 'assets/images/boosts/megaboost.gif'
import SuperBoostImg from 'assets/images/boosts/superboost.gif'
import _, { find } from 'lodash'

/**
 * Checks if an asset is a special boost card
 *
 * @param asset - The asset to check
 * @returns True if the asset is a boost card
 *
 * @example
 * ```ts
 * const isBoost = isBoostCard(asset) // true/false
 * ```
 */
export const isBoostCard = (asset: IAsset): boolean => {
  const cardId = asset?.data?.cardid
  return cardId === BOOST_CARD_IDS.MEGA_BOOST || cardId === BOOST_CARD_IDS.SUPER_BOOST
}

/**
 * Gets the boost image for special boost cards
 *
 * @param asset - The asset to get boost image for
 * @returns The boost image URL or null if not a boost card
 *
 * @example
 * ```ts
 * const boostImg = getBoostImage(asset) // '/path/to/boost.gif' or null
 * ```
 */
export const getBoostImage = (asset: IAsset): string | null => {
  const cardId = asset?.data?.cardid

  if (cardId === BOOST_CARD_IDS.MEGA_BOOST) {
    return MegaBoostImg
  }

  if (cardId === BOOST_CARD_IDS.SUPER_BOOST) {
    return SuperBoostImg
  }

  return null
}

/**
 * Checks if an asset should use portrait mapping
 *
 * @param asset - The asset to check
 * @returns True if the asset should use portrait mapping
 *
 * @example
 * ```ts
 * const usePortrait = shouldUsePortraitMapping(asset) // true/false
 * ```
 */
export const shouldUsePortraitMapping = (asset: IAsset): boolean => {
  return (
    asset?.schema?.schema_name === 'tool.worlds' &&
    asset?.data?.cardid > 31 &&
    asset?.data?.cardid < 42
  )
}

/**
 * Gets the portrait image hash for an asset
 *
 * @param asset - The asset to get portrait for
 * @returns The portrait image hash or null
 *
 * @example
 * ```ts
 * const portraitHash = getPortraitImageHash(asset) // 'QmHash...' or null
 * ```
 */
export const getPortraitImageHash = (asset: IAsset): string | null => {
  if (!shouldUsePortraitMapping(asset)) {
    return null
  }

  const mappedImg = find(
    mappingPortraits,
    (item) => item.Cardid === asset?.data?.cardid && item.Shine === asset?.data?.shine
  )

  return mappedImg?.PortraitImage || null
}

/**
 * Gets the regular image hash for an asset
 *
 * @param asset - The asset to get image hash for
 * @returns The image hash or null
 *
 * @example
 * ```ts
 * const imageHash = getRegularImageHash(asset) // 'QmHash...' or null
 * ```
 */
export const getRegularImageHash = (asset: IAsset): string | null => {
  const mappedImg = find(
    mappingImages,
    (item) => item.Cardid === asset?.data?.cardid && item.Schema === asset?.schema?.schema_name
  )

  if (!mappedImg || !mappedImg.IPFSHash) {
    return null
  }

  if (mappedImg.IPFSHash === 'templateLookup') {
    return getTemplateImageHash(asset)
  }

  return mappedImg.IPFSHash
}

/**
 * Gets the template image hash for an asset
 *
 * @param asset - The asset to get template image for
 * @returns The template image hash or null
 *
 * @example
 * ```ts
 * const templateHash = getTemplateImageHash(asset) // 'QmHash...' or null
 * ```
 */
export const getTemplateImageHash = (asset: IAsset): string | null => {
  const assetTemplateId = parseInt(`${asset?.template_id}` ?? '0', 10)
  const templateTemplateId = parseInt(`${asset?.template?.template_id}` ?? '0', 10)

  const templateMapping = find(
    templateMappings,
    (item) => item.Template === assetTemplateId || item.Template === templateTemplateId
  )

  return templateMapping?.IPFSHash || null
}

/**
 * Constructs the full IPFS URL for an image hash
 *
 * @param hash - The IPFS hash
 * @returns The full IPFS URL
 *
 * @example
 * ```ts
 * const url = buildIPFSUrl('QmHash...') // 'https://ipfs.io/ipfs/QmHash...'
 * ```
 */
export const buildIPFSUrl = (hash: string): string => {
  return `${config.IpfsApiUrl}/${hash}`
}

/**
 * Gets the fallback image URL for an asset
 *
 * @param asset - The asset to get fallback for
 * @returns The fallback image URL
 *
 * @example
 * ```ts
 * const fallback = getFallbackImageUrl(asset) // '/images/fallback.jpg'
 * ```
 */
export const getFallbackImageUrl = (asset: IAsset): string => {
  if (asset?.data?.img) {
    return buildIPFSUrl(asset.data.img)
  }

  return ASSET_PROCESSING.DEFAULT_IMAGE_FALLBACK
}

/**
 * Gets the complete image URL for an asset
 *
 * @param asset - The asset to get image URL for
 * @returns The complete image URL
 *
 * @example
 * ```ts
 * const imageUrl = getAssetImageUrl(asset) // 'https://ipfs.io/ipfs/QmHash...'
 * ```
 */
export const getAssetImageUrl = (asset: IAsset): string => {
  // Check for boost cards first
  const boostImage = getBoostImage(asset)
  if (boostImage) {
    return boostImage
  }

  // Check for portrait mapping
  const portraitHash = getPortraitImageHash(asset)
  if (portraitHash) {
    return buildIPFSUrl(portraitHash)
  }

  // Check for regular image mapping
  const regularHash = getRegularImageHash(asset)
  if (regularHash) {
    return buildIPFSUrl(regularHash)
  }

  // Fall back to asset's own image or default
  return getFallbackImageUrl(asset)
}

/**
 * Validates if an image URL is accessible
 *
 * @param url - The image URL to validate
 * @returns Promise that resolves to true if accessible
 *
 * @example
 * ```ts
 * const isValid = await validateImageUrl('https://ipfs.io/ipfs/QmHash...')
 * ```
 */
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Gets image URLs with fallback validation
 *
 * @param asset - The asset to get image URLs for
 * @returns Promise that resolves to the best available image URL
 *
 * @example
 * ```ts
 * const bestUrl = await getValidatedImageUrl(asset)
 * ```
 */
export const getValidatedImageUrl = async (asset: IAsset): Promise<string> => {
  const primaryUrl = getAssetImageUrl(asset)

  // For now, just return the primary URL
  // In a real implementation, you might want to validate and fallback
  return primaryUrl
}
