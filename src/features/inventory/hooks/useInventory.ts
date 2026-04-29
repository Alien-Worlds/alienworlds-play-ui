/**
 * @fileoverview Custom hook for inventory management
 *
 * This hook encapsulates all inventory-related state management and business logic,
 * providing a clean interface for components to interact with inventory data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'

import { useAssetProcessing } from './useAssetProcessing'
import { PAGINATION, FILTER_OPTIONS } from '../constants'
import { InventoryState, InventoryFilter, UseInventoryReturn, NFTCardData } from '../types'

/**
 * Custom hook for managing inventory state and operations
 *
 * @param initialAssets - Initial array of assets to display
 * @param walletId - User's wallet ID for ownership checks
 * @param bagAssets - Assets currently in user's bag
 * @returns Inventory state and actions
 *
 * @example
 * ```tsx
 * const { assets, loading, filter, actions } = useInventory(
 *   userAssets,
 *   walletId,
 *   bagAssets
 * )
 *
 * // Update filter
 * actions.setFilter({ sortBy: 'rarity' })
 *
 * // Load more items
 * actions.loadMore()
 * ```
 */
export const useInventory = (
  initialAssets: IAsset[] = [],
  walletId?: string,
  bagAssets: any[] = []
): UseInventoryReturn => {
  // State management
  const [state, setState] = useState<InventoryState>({
    assets: initialAssets,
    filteredAssets: initialAssets,
    processedAssets: [],
    loading: false,
    error: null,
    filter: {
      assetSchema: 'all',
      sortBy: FILTER_OPTIONS.DEFAULT_SORT_BY,
      reversed: FILTER_OPTIONS.DEFAULT_REVERSED,
      groupByTemplate: FILTER_OPTIONS.DEFAULT_GROUP_BY_TEMPLATE,
    },
    pagination: {
      itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
      hasMore: true,
      currentPage: 1,
    },
  })

  // Asset processing hook
  const { processAssets } = useAssetProcessing()

  // Memoized processed assets
  const processedAssets = useMemo(() => {
    if (!state.filteredAssets.length) return []

    try {
      return processAssets(state.filteredAssets, {
        walletId,
        bagAssets,
        includeImages: true,
        includePowers: true,
        includeMetadata: true,
      })
    } catch (error) {
      console.error('Error processing assets:', error)
      return []
    }
  }, [state.filteredAssets, walletId, bagAssets, processAssets])

  // Paginated assets
  const paginatedAssets = useMemo(() => {
    const startIndex = 0
    const endIndex = state.pagination.currentPage * state.pagination.itemsPerPage
    return processedAssets.slice(startIndex, endIndex)
  }, [processedAssets, state.pagination])

  // Update hasMore based on pagination
  useEffect(() => {
    const hasMore = paginatedAssets.length < processedAssets.length
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, hasMore },
    }))
  }, [paginatedAssets.length, processedAssets.length])

  // Filter and sort assets
  const applyFilters = useCallback((assets: IAsset[], filter: InventoryFilter): IAsset[] => {
    let filtered = [...assets]

    // Filter by asset schema
    if (filter.assetSchema !== 'all') {
      filtered = filtered.filter((asset) => asset.schema?.schema_name === filter.assetSchema)
    }

    // Sort assets
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filter.sortBy) {
        case 'name':
          comparison = (a.data?.name || '').localeCompare(b.data?.name || '')
          break
        case 'rarity':
          comparison = (a.data?.rarity || '').localeCompare(b.data?.rarity || '')
          break
        case 'type':
          comparison = (a.schema?.schema_name || '').localeCompare(b.schema?.schema_name || '')
          break
        case 'mint':
          comparison = (Number(a.template_mint) || 0) - (Number(b.template_mint) || 0)
          break
        case 'date':
          const dateA = new Date((a as any).transferred_at || 0).getTime()
          const dateB = new Date((b as any).transferred_at || 0).getTime()
          comparison = dateA - dateB
          break
        default:
          comparison = 0
      }

      return filter.reversed ? -comparison : comparison
    })

    return filtered
  }, [])

  // Actions
  const setFilter = useCallback(
    (newFilter: Partial<InventoryFilter>) => {
      setState((prev) => {
        const updatedFilter = { ...prev.filter, ...newFilter }
        const filteredAssets = applyFilters(prev.assets, updatedFilter)

        return {
          ...prev,
          filter: updatedFilter,
          filteredAssets,
          pagination: {
            ...prev.pagination,
            currentPage: 1, // Reset to first page when filter changes
            hasMore: filteredAssets.length > prev.pagination.itemsPerPage,
          },
        }
      })
    },
    [applyFilters]
  )

  const loadMore = useCallback(() => {
    if (!state.pagination.hasMore) return

    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: prev.pagination.currentPage + 1,
      },
    }))
  }, [state.pagination.hasMore])

  const refresh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }))

    // Simulate refresh - in real app, this would fetch new data
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        loading: false,
        filteredAssets: applyFilters(prev.assets, prev.filter),
        pagination: {
          ...prev.pagination,
          currentPage: 1,
        },
      }))
    }, 500)
  }, [applyFilters])

  const selectAsset = useCallback((asset: NFTCardData) => {
    // Handle asset selection logic
    console.log('Asset selected:', asset)
  }, [])

  // Update filtered assets when assets or filter changes
  useEffect(() => {
    const filteredAssets = applyFilters(state.assets, state.filter)
    setState((prev) => ({
      ...prev,
      filteredAssets,
      pagination: {
        ...prev.pagination,
        hasMore: filteredAssets.length > prev.pagination.itemsPerPage,
      },
    }))
  }, [state.assets, state.filter, applyFilters])

  return {
    assets: paginatedAssets,
    loading: state.loading,
    error: state.error,
    filter: state.filter,
    pagination: state.pagination,
    actions: {
      setFilter,
      loadMore,
      refresh,
      selectAsset,
    },
  }
}

/**
 * Hook for managing inventory assets updates
 *
 * @param assets - Array of assets to monitor
 * @returns Updated assets array
 */
export const useInventoryAssets = (assets: IAsset[]) => {
  const [inventoryAssets, setInventoryAssets] = useState<IAsset[]>(assets)

  useEffect(() => {
    setInventoryAssets(assets)
  }, [assets])

  return inventoryAssets
}

/**
 * Hook for managing inventory loading states
 *
 * @param initialLoading - Initial loading state
 * @returns Loading state and controls
 */
export const useInventoryLoading = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])

  return {
    loading,
    startLoading,
    stopLoading,
  }
}
