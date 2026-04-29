import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoostsDay } from 'features/mining/types/LandownerTypes'
import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import {
  AssetsFilter,
  FilterByToolType,
  filterByToolTypeDefaultOption,
  filterByToolTypeOptions,
  LandAssetsFilter,
} from 'store/atomic/types'

export type AtomicState = {
  assets: IAsset[]
  avatarAsset: IAsset
  landAsset: IAsset
  ownedLandsAssets: IAsset[]
  ownedLandsAssetsDayBoosts: LandBoostsDay[]
  ownedLandBoostsAssets: IAsset[]
  landAssetsFilter: LandAssetsFilter
  bagAssets: IAsset[]
  assetsFilter: AssetsFilter
  filteredAndSortedAssets: IAsset[]
  triggerFilterAndSortAssets: boolean
  filterByToolType: FilterByToolType
}

export const defaultState: AtomicState = {
  assets: null,
  avatarAsset: null,
  landAsset: null,
  ownedLandsAssets: null,
  ownedLandsAssetsDayBoosts: null,
  ownedLandBoostsAssets: null,
  landAssetsFilter: getDefaultLandAssetsFilter(),
  bagAssets: null,
  assetsFilter: null,
  filteredAndSortedAssets: null,
  triggerFilterAndSortAssets: false,
  filterByToolType: {
    filterByOptions: filterByToolTypeOptions,
    selectedFilterByOption: filterByToolTypeDefaultOption,
  },
}

export const state: AtomicState = {
  ...defaultState,
}
