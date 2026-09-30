import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import {
  FilterByToolType,
  filterByToolTypeDefaultOption,
  filterByToolTypeOptions,
  LandAssetsFilter,
} from 'store/atomic/types'
import { create } from 'zustand'

// State only mining uses. The player's NFTs, bag and mining land are shared with other features
// and live in shared/store/assetsStore.

export interface MiningState {
  /** MEGA/SUPER land boost NFTs the player owns. */
  ownedLandBoostsAssets: IAsset[] | null
  /** Tool type chosen in the tools drawer. */
  filterByToolType: FilterByToolType
  /** Filters and sort for the Land page. */
  landAssetsFilter: LandAssetsFilter
}

export interface MiningStore extends MiningState {
  setOwnedLandBoostsAssets: (ownedLandBoostsAssets: IAsset[] | null) => void
  setFilterByToolType: (filterByToolType: FilterByToolType) => void
  setLandAssetsFilter: (landAssetsFilter: LandAssetsFilter) => void
  resetLandAssetsFilter: () => void
  setLandAssetsFilterLoading: (isLoading: boolean) => void
}

export const getInitialMiningState = (): MiningState => ({
  ownedLandBoostsAssets: null,
  filterByToolType: {
    filterByOptions: filterByToolTypeOptions,
    selectedFilterByOption: filterByToolTypeDefaultOption,
  },
  landAssetsFilter: getDefaultLandAssetsFilter(),
})

// How long the land filter reports isLoading after a change, as the Overmind debounce did.
const LAND_FILTER_LOADING_MS = 200

let landFilterLoadingTimer: ReturnType<typeof setTimeout> | undefined

export const useMiningStore = create<MiningStore>((set, get) => {
  const setLandFilterWithLoading = (landAssetsFilter: LandAssetsFilter) => {
    set({ landAssetsFilter: { ...landAssetsFilter, isLoading: true } })
    clearTimeout(landFilterLoadingTimer)
    landFilterLoadingTimer = setTimeout(() => {
      set({ landAssetsFilter: { ...get().landAssetsFilter, isLoading: false } })
    }, LAND_FILTER_LOADING_MS)
  }

  return {
    ...getInitialMiningState(),

    setOwnedLandBoostsAssets: (ownedLandBoostsAssets) => set({ ownedLandBoostsAssets }),
    setFilterByToolType: (filterByToolType) => set({ filterByToolType }),
    setLandAssetsFilter: (landAssetsFilter) => setLandFilterWithLoading(landAssetsFilter),
    resetLandAssetsFilter: () => setLandFilterWithLoading(getDefaultLandAssetsFilter()),
    setLandAssetsFilterLoading: (isLoading) =>
      set({ landAssetsFilter: { ...get().landAssetsFilter, isLoading } }),
  }
})
