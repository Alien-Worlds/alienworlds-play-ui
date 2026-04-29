/**
 * @fileoverview Type definitions for the Inventory feature
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the inventory feature, providing a centralized location for type definitions
 * and ensuring type safety across components.
 */

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { AssetType, AssetProcess, AssetElement } from 'store/atomic/types'

/**
 * Element types for rendering different UI components
 */
export enum ElementType {
  ICON = 'ICON',
  TEXT = 'TEXT',
  IMG = 'IMG',
  NODE = 'NODE',
}

/**
 * Base interface for all text-based UI elements
 */
export interface TextElement {
  name: string
  elementType: ElementType
  styleConfig: Record<string, any>
}

/**
 * Extended text element with additional properties
 */
export interface ExtendedTextElement extends TextElement {
  label?: string
}

/**
 * Icon element configuration
 */
export interface IconElement {
  name: any // React component
  elementType: ElementType.NODE
  styleConfig: {
    boxSize?: number
    color?: string
    fill?: string
    ml?: number | string
    [key: string]: any
  }
}

/**
 * NFT Card data structure after processing
 */
export interface NFTCardData {
  // Basic identification
  assetId?: TextElement
  templateId?: string

  // Core properties
  type: TextElement
  subType?: ExtendedTextElement
  title: TextElement
  description: TextElement

  // Visual properties
  nftImage?: any
  rarity: any
  shine?: any
  disableInnerRing?: boolean

  // Game mechanics
  chargeValue?: TextElement
  cardPowers?: any
  ease?: TextElement
  difficulty?: TextElement
  luck?: TextElement
  attack?: TextElement
  defense?: TextElement
  moveCast?: TextElement

  // Additional properties
  key?: TextElement
  class?: ExtendedTextElement
  level?: ExtendedTextElement
  element?: TextElement
  affinity?: TextElement
  artifactType?: TextElement
  process?: TextElement

  // Minting information
  cardcopies?: string
  mints?: TextElement
  mintTypes?: TextElement
  multipleMintTypes?: boolean

  // Land-specific properties
  commission?: TextElement
  landrating?: TextElement

  // Supply information
  issuedSupply?: TextElement
  maxSupply?: TextElement

  // Ownership
  owner?: TextElement
  isUserOwner?: boolean
  isInBag?: boolean

  // Collection information
  collectionName?: TextElement
  artist?: TextElement

  // Modifiers and icons
  mod?: Array<TextElement | IconElement>
  elementIcon?: IconElement
  processIcon?: IconElement
}

/**
 * Configuration for NFT card rendering
 */
export interface NFTCardRenderConfig {
  showZoom?: boolean
  showActions?: boolean
  isNFTCard?: boolean
  zoomCallback?: () => void
}

/**
 * Filter options for inventory
 */
export interface InventoryFilter {
  assetSchema: string
  sortBy: string
  reversed: boolean
  groupByTemplate: boolean
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  itemsPerPage: number
  hasMore: boolean
  currentPage: number
}

/**
 * Inventory state interface
 */
export interface InventoryState {
  assets: IAsset[]
  filteredAssets: IAsset[]
  processedAssets: NFTCardData[]
  loading: boolean
  error: string | null
  filter: InventoryFilter
  pagination: PaginationConfig
}

/**
 * Props for NFT card components
 */
export interface NFTCardProps {
  asset: NFTCardData
  config?: NFTCardRenderConfig
  onAction?: (action: string, data: any) => void
}

/**
 * Props for inventory components
 */
export interface InventoryComponentProps {
  assets?: IAsset[]
  loading?: boolean
  error?: string | null
  onAssetSelect?: (asset: NFTCardData) => void
  onFilterChange?: (filter: InventoryFilter) => void
}

/**
 * Asset processing configuration
 */
export interface AssetProcessingConfig {
  walletId?: string
  bagAssets?: any[]
  includeImages?: boolean
  includePowers?: boolean
  includeMetadata?: boolean
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: any) => void
}

/**
 * Hook return types
 */
export interface UseInventoryReturn {
  assets: NFTCardData[]
  loading: boolean
  error: string | null
  filter: InventoryFilter
  pagination: PaginationConfig
  actions: {
    setFilter: (filter: Partial<InventoryFilter>) => void
    loadMore: () => void
    refresh: () => void
    selectAsset: (asset: NFTCardData) => void
  }
}

export interface UseAssetProcessingReturn {
  processAsset: (asset: IAsset, config?: AssetProcessingConfig) => NFTCardData
  processAssets: (assets: IAsset[], config?: AssetProcessingConfig) => NFTCardData[]
  getAssetImage: (asset: IAsset) => string
  getAssetPowers: (asset: IAsset) => any[]
}

/**
 * Constants for asset types and mappings
 */
export interface AssetTypeMapping {
  [key: string]: string
}

export interface ElementMapping {
  [key: string]: any
}

export interface ProcessMapping {
  [key: string]: any
}

/**
 * Template ID constants
 */
export interface TemplateConstants {
  levelTemplateIdsAsOre: string[]
  boostCardIds: {
    megaBoost: number
    superBoost: number
  }
}

/**
 * Style configuration types
 */
export interface StyleConfig {
  textStyle: Record<string, any>
  iconStyle: Record<string, any>
  collectionStyle: Record<string, any>
}

/**
 * Planet gradient mapping
 */
export interface PlanetGradient {
  [planetName: string]: string
}

/**
 * Export all types for easy importing
 */
export type { IAsset, AssetType, AssetProcess, AssetElement }
