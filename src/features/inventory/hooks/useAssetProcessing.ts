/**
 * @fileoverview Custom hook for asset data processing
 *
 * This hook encapsulates all asset data transformation logic,
 * providing a clean interface for converting raw asset data
 * into display-ready NFT card data.
 */

import { useCallback } from 'react'

import {
  StackingIcon,
  ElementAirIcon,
  ElementFireIcon,
  ElementGemIcon,
  ElementMetalIcon,
  ElementNatureIcon,
  ElementNeutralIcon,
  CatalystIcon2,
  MaterialIcon3,
  FusionIcon3,
} from '@alien-worlds/icons'
import mappingImages from 'assets/data/cardImgMappings.json'
import mappingPortraits from 'assets/data/cardPortraitImgMappings.json'
import templateMappings from 'assets/data/templateImageMappings.json'
import MegaBoostImg from 'assets/images/boosts/megaboost.gif'
import SuperBoostImg from 'assets/images/boosts/superboost.gif'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { NftRarity } from 'features/mining/utils/constants'
import _, { find, toLower, divide, get } from 'lodash'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { Constants } from 'shared/util/constants'
import { AssetType, AssetProcess, AssetElement, AssetSchema } from 'store/atomic/types'

import {
  ASSET_TYPE_MAPPINGS,
  LEVEL_TEMPLATE_IDS_AS_ORE,
  BOOST_CARD_IDS,
  ASSET_PROCESSING,
} from '../constants'
import { NFTCardData, AssetProcessingConfig, UseAssetProcessingReturn, TextElement } from '../types'

/**
 * Custom hook for processing asset data
 *
 * @returns Asset processing functions and utilities
 *
 * @example
 * ```tsx
 * const { processAsset, processAssets, getAssetImage } = useAssetProcessing()
 *
 * // Process single asset
 * const cardData = processAsset(asset, { walletId, bagAssets })
 *
 * // Process multiple assets
 * const cardsData = processAssets(assets, { includeImages: true })
 *
 * // Get asset image URL
 * const imageUrl = getAssetImage(asset)
 * ```
 */
export const useAssetProcessing = (): UseAssetProcessingReturn => {
  /**
   * Creates a text element with consistent styling
   */
  const createTextElement = useCallback(
    (name: string, styleConfig: Record<string, any> = {}): TextElement => ({
      name,
      elementType: 'TEXT' as any,
      styleConfig,
    }),
    []
  )

  /**
   * Creates an extended text element with label
   */
  const createExtendedTextElement = useCallback(
    (name: string, label?: string, styleConfig: Record<string, any> = {}): any => ({
      name,
      label,
      element: 'TEXT',
      elementType: 'TEXT' as any,
      styleConfig,
    }),
    []
  )

  /**
   * Determines asset type and creates type element
   */
  const processAssetType = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', 'null')
      const templateId = _.get(asset, 'template.template_id', _.get(asset, 'template_id', null))

      const isOreTemplate = LEVEL_TEMPLATE_IDS_AS_ORE.includes(templateId)
      const typeName = isOreTemplate ? 'Ore' : ASSET_TYPE_MAPPINGS[schema]

      return typeName ? createTextElement(typeName) : null
    },
    [createTextElement]
  )

  /**
   * Processes asset title
   */
  const processAssetTitle = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', 'null')
      const data = _.get(asset, 'data', _.get(asset, 'immutable_data'))

      let title = ''
      switch (schema) {
        case AssetType.LAND:
          title = data.name
            .split(' ')
            .splice(0, data.name.split(' ').length - 2)
            .join(' ')
          break
        default:
          title = data.name || ''
      }

      return title ? createTextElement(title) : null
    },
    [createTextElement]
  )

  /**
   * Processes asset description/subtitle
   */
  const processAssetDescription = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', null)
      const data = _.get(asset, 'data', _.get(asset, 'immutable_data'))
      const collection = _.get(asset, 'collection.collection_name', null)

      let description = ''

      if (collection === Constants.CONTRACT_ALIEN_AVATARS) {
        description = `${data.top}, ${data.head}, ${data.legs}, ${data.torso}, ${data.equipment}, ${data.background}`
      } else {
        switch (schema) {
          case AssetType.TOOL:
            description = data.type || ''
            break
          case AssetType.LAND:
            description = data.name.split(' ')[data.name.split(' ')?.length - 1] || ''
            break
          default:
            description = data.description || ''
        }
      }

      return description ? createTextElement(description) : null
    },
    [createTextElement]
  )

  /**
   * Processes asset image URL
   */
  const getAssetImage = useCallback((asset: IAsset): string => {
    // Handle special boost images
    if (asset?.data?.cardid === BOOST_CARD_IDS.MEGA_BOOST) {
      return MegaBoostImg
    }
    if (asset?.data?.cardid === BOOST_CARD_IDS.SUPER_BOOST) {
      return SuperBoostImg
    }

    let mappedImg
    let hash = null

    // Handle portrait mappings for specific tools
    if (
      asset?.schema?.schema_name === 'tool.worlds' &&
      asset?.data?.cardid > 31 &&
      asset?.data?.cardid < 42
    ) {
      mappedImg = find(
        mappingPortraits,
        (item) => item.Cardid === asset?.data?.cardid && item.Shine === asset?.data?.shine
      )
      hash = mappedImg?.PortraitImage
    } else {
      // Handle regular image mappings
      mappedImg = find(
        mappingImages,
        (item) => item.Cardid === asset?.data?.cardid && item.Schema === asset?.schema?.schema_name
      )

      if (mappedImg && mappedImg.IPFSHash) {
        if (mappedImg.IPFSHash === 'templateLookup') {
          const assetTemplateId = parseInt(`${asset?.template_id}` ?? '0', 10)
          const templateTemplateId = parseInt(`${asset?.template?.template_id}` ?? '0', 10)
          hash = find(
            templateMappings,
            (item) => item.Template === assetTemplateId || item.Template === templateTemplateId
          )?.IPFSHash
        } else {
          hash = mappedImg?.IPFSHash
        }
      }
    }

    if (hash) {
      return `${config.IpfsApiUrl}/${hash}`
    }

    return asset?.data?.img
      ? `${config.IpfsApiUrl}/${asset.data.img}`
      : ASSET_PROCESSING.DEFAULT_IMAGE_FALLBACK
  }, [])

  /**
   * Processes asset powers/stats
   */
  const getAssetPowers = useCallback((asset: IAsset): any[] => {
    const schema = _.get(asset, 'schema.schema_name', null)
    const data = _.get(asset, 'data', {}) as any

    // This is a simplified version - the full implementation would be more complex
    const powers = []

    if (data.ease !== undefined) {
      powers.push({
        type: 'ease',
        value: data.ease / 10,
        icon: 'MiningIcon',
      })
    }

    if (data.difficulty !== undefined) {
      powers.push({
        type: 'difficulty',
        value: data.difficulty,
        icon: 'LandIcon2',
      })
    }

    if (data.luck !== undefined) {
      const luckValue = data.luck / 10
      // Set NFT Power to zero for Abundant Tools
      const finalLuck =
        data.rarity === NftRarity.abundant && schema === 'tool.worlds' ? 0 : luckValue
      powers.push({
        type: 'luck',
        value: finalLuck,
        icon: 'NFTOldIcon',
      })
    }

    return powers
  }, [])

  /**
   * Processes asset rarity
   */
  const processAssetRarity = useCallback((asset: IAsset): any => {
    const rarity = toLower(_.get(asset, 'data.rarity', 'common'))
    return { name: rarity, element: 'TEXT', styleConfig: {} }
  }, [])

  /**
   * Processes asset shine
   */
  const processAssetShine = useCallback((asset: IAsset): any => {
    const shine = toLower(_.get(asset, 'data.shine', 'stone'))
    return { name: shine, element: 'TEXT', styleConfig: {} }
  }, [])

  /**
   * Processes asset charge value
   */
  const processChargeValue = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', null)
      if (schema !== AssetType.TOOL && schema !== AssetType.LAND) {
        return null
      }

      const data = _.get(asset, 'data', _.get(asset, 'immutable_data'))
      const result = schema === AssetType.LAND ? `${data.delay / 10}x` : `${data.delay}`

      return result ? createTextElement(result) : null
    },
    [createTextElement]
  )

  /**
   * Processes asset mod information
   */
  const processAssetMod = useCallback((asset: IAsset): any[] | null => {
    const schema = _.get(asset, 'schema.schema_name', null)
    const landMod = `${asset.data.x || 0}:${asset.data.y || 0}`
    const armsMod = _.get(asset, 'data.class', '')
    const crewModOrLevel = _.get(asset, 'data.element', '')
    const itemsMod = _.get(asset, 'data.element', '')

    const textStyle = { fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, letterSpacing: 2 }

    const mappings = {
      [AssetType.TOOL]: null,
      [AssetType.FACES]: null,
      [AssetType.LAND]: [
        { name: landMod, elementType: 'TEXT', styleConfig: textStyle },
        {
          name: StackingIcon,
          elementType: 'NODE',
          styleConfig: {
            fill: Colors.SNOW_WHITE,
            boxSize: 24,
            ml: 2,
          },
        },
      ],
      [AssetType.ITEMS]: [{ name: itemsMod, elementType: 'TEXT', styleConfig: textStyle }],
      [AssetType.ARMS]: [{ name: armsMod, elementType: 'TEXT', styleConfig: textStyle }],
      [AssetType.CREW]: [{ name: crewModOrLevel, elementType: 'TEXT', styleConfig: textStyle }],
      [AssetType.LEVEL]: [{ name: crewModOrLevel, elementType: 'TEXT', styleConfig: textStyle }],
    }

    return mappings[schema] && mappings[schema].length > 0 ? mappings[schema] : null
  }, [])

  /**
   * Processes land commission
   */
  const processLandCommission = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', null)
      const currentCommission = divide(_.get(asset, 'mutable_data.commission', 0), 100)

      if (schema === AssetType.LAND && currentCommission !== null) {
        return createTextElement(currentCommission.toFixed(1).toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes land rating
   */
  const processLandRating = useCallback(
    (asset: IAsset): TextElement | null => {
      const schema = _.get(asset, 'schema.schema_name', null)
      const landrating = _.get(asset, 'mutable_data.landrating', Constants.DEFAULT_LAND_RATING)

      if (schema === AssetType.LAND) {
        return createTextElement(landrating.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Gets element icon
   */
  const getElementIcon = useCallback((asset: IAsset) => {
    const schema = _.get(asset, 'data.element', null)
    const mappings = {
      [AssetElement.AIR]: ElementAirIcon,
      [AssetElement.FIRE]: ElementFireIcon,
      [AssetElement.GEM]: ElementGemIcon,
      [AssetElement.METAL]: ElementMetalIcon,
      [AssetElement.NATURE]: ElementNatureIcon,
      [AssetElement.NEUTRAL]: ElementNeutralIcon,
    }
    return mappings[schema]
  }, [])

  /**
   * Gets process icon
   */
  const getProcessIcon = useCallback((asset: IAsset) => {
    const schema = _.get(asset, 'data.process', null)
    const mappings = {
      [AssetProcess.CATALYST]: CatalystIcon2,
      [AssetProcess.FUSION]: FusionIcon3,
      [AssetProcess.MATERIAL]: MaterialIcon3,
    }
    return mappings[schema]
  }, [])

  /**
   * Processes element icon
   */
  const processElementIcon = useCallback(
    (asset: IAsset): any => {
      const icon = getElementIcon(asset)

      if (icon) {
        return {
          name: icon,
          element: 'NODE',
          styleConfig: { boxSize: 20, color: Colors.DARK_YELLOW },
        }
      }
      return null
    },
    [getElementIcon]
  )

  /**
   * Processes process icon
   */
  const processProcessIcon = useCallback(
    (asset: IAsset): any => {
      const icon = getProcessIcon(asset)

      if (icon) {
        return {
          name: icon,
          element: 'NODE',
          styleConfig: { boxSize: 20, color: Colors.DARK_YELLOW },
        }
      }
      return null
    },
    [getProcessIcon]
  )

  /**
   * Processes asset ease
   */
  const processAssetEase = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.ease', null)
      if (result !== null && result >= 0) {
        return createTextElement(divide(result, 10).toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset difficulty
   */
  const processAssetDifficulty = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.difficulty', null)
      if (result !== null && result >= 0) {
        return createTextElement(result.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset luck
   */
  const processAssetLuck = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.luck', null)
      const rarity = _.get(asset, 'data.rarity', null)
      const schema = _.get(asset, 'schema.schema_name', null)

      if (result !== null && result >= 0) {
        let luckValue = divide(result, 10)
        // Set NFT Power to zero for Abundant Tools
        if (rarity === NftRarity.abundant && schema === AssetSchema.TOOL) {
          luckValue = 0
        }
        return createTextElement(luckValue.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset attack
   */
  const processAssetAttack = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.attack', null)
      if (result !== null && result >= 0) {
        return createTextElement(result.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset defense
   */
  const processAssetDefense = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.defense', null)
      if (result !== null && result >= 0) {
        return createTextElement(result.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset move cast
   */
  const processAssetMoveCast = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.movecost', null)
      if (result !== null && result >= 0) {
        return createTextElement(result.toString())
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset key
   */
  const processAssetKey = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.key', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset class
   */
  const processAssetClass = useCallback(
    (asset: IAsset): any => {
      const result = _.get(asset, 'data.class', null)
      if (result) {
        return createExtendedTextElement(result, 'Class')
      }
      return null
    },
    [createExtendedTextElement]
  )

  /**
   * Processes asset level
   */
  const processAssetLevel = useCallback(
    (asset: IAsset): any => {
      const result = _.get(asset, 'data.level', null)
      if (result) {
        return createExtendedTextElement(result, 'Level')
      }
      return null
    },
    [createExtendedTextElement]
  )

  /**
   * Processes asset element
   */
  const processAssetElement = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.element', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset affinity
   */
  const processAssetAffinity = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.affinity', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset artifact type
   */
  const processAssetArtifactType = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.artifact_type', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset process
   */
  const processAssetProcess = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.process', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset sub type
   */
  const processAssetSubType = useCallback(
    (asset: IAsset): any => {
      const result = _.get(asset, 'data.type', null)
      if (result) {
        return createExtendedTextElement(result, 'Type')
      }
      return null
    },
    [createExtendedTextElement]
  )

  /**
   * Processes asset issued supply
   */
  const processAssetIssuedSupply = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'issued_supply', '')
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset max supply
   */
  const processAssetMaxSupply = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'max_supply', '')
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset artist name
   */
  const processAssetArtist = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = _.get(asset, 'data.artist', null)
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset collection name
   */
  const processAssetCollectionName = useCallback(
    (asset: IAsset): TextElement | null => {
      const result = toLower(_.get(asset, 'collection.collection_name', ''))
      if (result) {
        return createTextElement(result)
      }
      return null
    },
    [createTextElement]
  )

  /**
   * Processes asset multiple mint types
   */
  const processAssetMultipleMintTypes = useCallback((asset: IAsset): boolean => {
    const result = _.get(asset, 'total_of_type', 1)
    return result > 1
  }, [])

  /**
   * Processes single asset into NFT card data
   */
  const processAsset = useCallback(
    (asset: IAsset, config: AssetProcessingConfig = {}): NFTCardData => {
      const {
        walletId,
        bagAssets = [],
        includeImages = true,
        includePowers = true,
        includeMetadata = true,
      } = config

      const cardData: NFTCardData = {
        // Basic identification
        assetId: createTextElement(_.get(asset, 'asset_id', '')),
        templateId: _.get(asset, 'template.template_id', null),

        // Core properties
        type: processAssetType(asset) || createTextElement('Unknown'),
        title: processAssetTitle(asset) || createTextElement(''),
        description: processAssetDescription(asset) || createTextElement(''),

        // Visual properties
        rarity: processAssetRarity(asset),
        shine: processAssetShine(asset),
        disableInnerRing: false,

        // Additional properties
        subType: processAssetSubType(asset),
        chargeValue: processChargeValue(asset),
        mod: processAssetMod(asset),
        commission: processLandCommission(asset),
        landrating: processLandRating(asset),
        elementIcon: processElementIcon(asset),
        processIcon: processProcessIcon(asset),
        ease: processAssetEase(asset),
        difficulty: processAssetDifficulty(asset),
        luck: processAssetLuck(asset),
        attack: processAssetAttack(asset),
        defense: processAssetDefense(asset),
        moveCast: processAssetMoveCast(asset),
        key: processAssetKey(asset),
        class: processAssetClass(asset),
        level: processAssetLevel(asset),
        element: processAssetElement(asset),
        affinity: processAssetAffinity(asset),
        artifactType: processAssetArtifactType(asset),
        process: processAssetProcess(asset),
        issuedSupply: processAssetIssuedSupply(asset),
        maxSupply: processAssetMaxSupply(asset),
        artist: processAssetArtist(asset),
        collectionName: processAssetCollectionName(asset),
        multipleMintTypes: processAssetMultipleMintTypes(asset),
      }

      // Add image if requested
      if (includeImages) {
        cardData.nftImage = { name: getAssetImage(asset), elementType: 'TEXT', styleConfig: {} }
      }

      // Add powers if requested
      if (includePowers) {
        cardData.cardPowers = getAssetPowers(asset)
      }

      // Add metadata if requested
      if (includeMetadata) {
        // Add ownership information
        if (walletId) {
          const owner = toLower(_.get(asset, 'owner', ''))
          cardData.owner = createTextElement(owner)
          cardData.isUserOwner = owner === walletId
        }

        // Add bag status
        if (get(bagAssets, 'length', 0) > 0) {
          cardData.isInBag = bagAssets.some(
            (bagAsset) => bagAsset.template?.template_id === asset?.template?.template_id
          )
        }

        // Add mint information
        const mint = Number(_.get(asset, 'template_mint', 0))
        if (mint > 0) {
          cardData.mints = createTextElement(mint.toString())
        }

        // Add copies information
        const copies = _.get(asset, 'total_of_type', 0)
        if (copies > 1) {
          cardData.cardcopies = copies.toString()
        }
      }

      return cardData
    },
    [
      createTextElement,
      createExtendedTextElement,
      processAssetType,
      processAssetTitle,
      processAssetDescription,
      processAssetRarity,
      processAssetShine,
      processAssetSubType,
      processChargeValue,
      processAssetMod,
      processLandCommission,
      processLandRating,
      processElementIcon,
      processProcessIcon,
      processAssetEase,
      processAssetDifficulty,
      processAssetLuck,
      processAssetAttack,
      processAssetDefense,
      processAssetMoveCast,
      processAssetKey,
      processAssetClass,
      processAssetLevel,
      processAssetElement,
      processAssetAffinity,
      processAssetArtifactType,
      processAssetProcess,
      processAssetIssuedSupply,
      processAssetMaxSupply,
      processAssetArtist,
      processAssetCollectionName,
      processAssetMultipleMintTypes,
      getAssetImage,
      getAssetPowers,
    ]
  )

  /**
   * Processes multiple assets into NFT card data array
   */
  const processAssets = useCallback(
    (assets: IAsset[], config: AssetProcessingConfig = {}): NFTCardData[] => {
      return assets.map((asset) => processAsset(asset, config))
    },
    [processAsset]
  )

  return {
    processAsset,
    processAssets,
    getAssetImage,
    getAssetPowers,
  }
}
