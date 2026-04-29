/**
 * @fileoverview Constants for the Inventory feature
 *
 * This file contains all constants, mappings, and configuration values
 * used throughout the inventory feature. Centralizing these values
 * makes the code more maintainable and easier to update.
 */

import { AssetType, AssetElement, AssetProcess } from 'store/atomic/types'

import {
  AssetTypeMapping,
  ElementMapping,
  ProcessMapping,
  TemplateConstants,
  StyleConfig,
  PlanetGradient,
} from '../types'

/**
 * Template IDs that should be treated as Ore instead of Level
 */
export const LEVEL_TEMPLATE_IDS_AS_ORE: string[] = [
  '515558',
  '515559',
  '515560',
  '515561',
  '516018',
  '516019',
  '516020',
  '516021',
  '516022',
]

/**
 * Special card IDs for boost images
 */
export const BOOST_CARD_IDS = {
  MEGA_BOOST: 45,
  SUPER_BOOST: 46,
} as const

/**
 * Asset type to display name mappings
 */
export const ASSET_TYPE_MAPPINGS: AssetTypeMapping = {
  [AssetType.TOOL]: 'Tool',
  [AssetType.FACES]: 'Avatar',
  [AssetType.LAND]: 'Land',
  [AssetType.ARMS]: 'Weapon',
  [AssetType.CREW]: 'Minion',
  [AssetType.ITEMS]: 'Item',
  [AssetType.LEVEL]: 'Level', // Will be overridden for ore templates
}

/**
 * Element to icon mappings
 */
export const ELEMENT_ICON_MAPPINGS: ElementMapping = {
  [AssetElement.AIR]: 'ElementAirIcon',
  [AssetElement.FIRE]: 'ElementFireIcon',
  [AssetElement.GEM]: 'ElementGemIcon',
  [AssetElement.METAL]: 'ElementMetalIcon',
  [AssetElement.NATURE]: 'ElementNatureIcon',
  [AssetElement.NEUTRAL]: 'ElementNeutralIcon',
}

/**
 * Process to icon mappings
 */
export const PROCESS_ICON_MAPPINGS: ProcessMapping = {
  [AssetProcess.CATALYST]: 'CatalystIcon2',
  [AssetProcess.FUSION]: 'FusionIcon3',
  [AssetProcess.MATERIAL]: 'MaterialIcon3',
}

/**
 * Planet gradient color mappings
 */
export const PLANET_GRADIENTS: PlanetGradient = {
  eyeke: 'linear-gradient(133deg, rgb(15,85,129) 50%, rgb(211,192,3) 100%)',
  veles: 'linear-gradient(133deg, rgb(236,184,82) 50%, rgb(171,196,30) 100%)',
  neri: 'linear-gradient(133deg, rgb(230,184,118) 50%, rgb(179,65,16) 100%)',
  kavian: 'linear-gradient(133deg, rgb(133,56,17) 50%, rgb(246,133,25) 100%)',
  naron: 'linear-gradient(133deg, rgb(180,187,231) 50%, rgb(76,122,32) 100%)',
}

/**
 * Default style configurations
 */
export const DEFAULT_STYLES: StyleConfig = {
  textStyle: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: 'white',
    fontWeight: 700,
    letterSpacing: 2,
  },
  iconStyle: {
    boxSize: 20,
    color: 'Colors.DARK_YELLOW',
    fill: 'Colors.DARK_YELLOW',
  },
  collectionStyle: {
    fontSize: 12,
    color: 'white',
    fontWeight: 500,
    letterSpacing: 2,
    fontFamily: 'Orbitron',
  },
}

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_ITEMS_PER_PAGE: 30,
  MAX_ITEMS_PER_PAGE: 100,
  MIN_ITEMS_PER_PAGE: 10,
} as const

/**
 * Asset processing configuration
 */
export const ASSET_PROCESSING = {
  DEFAULT_IMAGE_FALLBACK: '/images/alienworlds-profile-sample01.jpg',
  IPFS_BASE_URL: 'config.IpfsApiUrl', // Will be replaced with actual config
  ENABLE_IMAGE_CACHING: true,
  ENABLE_POWER_CALCULATION: true,
} as const

/**
 * Filter and sort options
 */
export const FILTER_OPTIONS = {
  DEFAULT_SORT_BY: 'name',
  DEFAULT_REVERSED: false,
  DEFAULT_GROUP_BY_TEMPLATE: false,
  SUPPORTED_SORT_OPTIONS: ['name', 'rarity', 'type', 'mint', 'date'] as const,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  ASSET_PROCESSING_FAILED: 'Failed to process asset data',
  IMAGE_LOAD_FAILED: 'Failed to load asset image',
  FILTER_APPLICATION_FAILED: 'Failed to apply filters',
  PAGINATION_ERROR: 'Error loading more items',
  NETWORK_ERROR: 'Network error occurred',
} as const

/**
 * Component dimensions and spacing
 */
export const LAYOUT = {
  CARD_WIDTH: 280,
  CARD_HEIGHT: 400,
  GRID_GAP: 20,
  CONTAINER_PADDING: 24,
  MOBILE_BREAKPOINT: 768,
} as const

/**
 * Animation configurations
 */
export const ANIMATIONS = {
  CARD_ENTER_DURATION: 0.3,
  CARD_ENTER_DELAY: 0.1,
  CARD_EXIT_DURATION: 0.15,
  CARD_STAGGER_DELAY: 0.05,
} as const

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_ASSET_ID: 1,
  MAX_ASSET_ID: 999999999,
  REQUIRED_FIELDS: ['asset_id', 'template_id', 'data'] as const,
} as const

/**
 * Export template constants object
 */
export const TEMPLATE_CONSTANTS: TemplateConstants = {
  levelTemplateIdsAsOre: LEVEL_TEMPLATE_IDS_AS_ORE,
  boostCardIds: {
    megaBoost: BOOST_CARD_IDS.MEGA_BOOST,
    superBoost: BOOST_CARD_IDS.SUPER_BOOST,
  },
}

// Re-export types for convenience
export type {
  AssetTypeMapping,
  ElementMapping,
  ProcessMapping,
  TemplateConstants,
  StyleConfig,
  PlanetGradient,
}
