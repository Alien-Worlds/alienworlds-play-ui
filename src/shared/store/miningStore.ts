import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoostsDay } from 'features/mining/types/LandownerTypes'
import { updateLandRating } from 'features/mining/utils/landownerUtils'
import { cloneDeep, toUpper } from 'lodash'
import { matchRoutes } from 'react-router'
import { levelTemplateIdsAsOre } from 'shared/util/nft'
import { bindAssetsFilterView, getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import {
  AssetSchema,
  AssetsFilter,
  FilterByToolType,
  filterByToolTypeDefaultOption,
  filterByToolTypeOptions,
  LandAssetsFilter,
  SortBy,
} from 'store/atomic/types'
import { PagePath, Rarity } from 'store/main/types'
import { create } from 'zustand'

// The player's NFTs and the filters over them, shared by mining, inventory and the shared UI.
// Formerly Overmind's `atomic` state. The loaders that fill it still run in Overmind
// (store/atomic/actions.ts) on main's sync tick, and write here through the setters.

export interface MiningState {
  assets: IAsset[] | null
  avatarAsset: IAsset | null
  /** The land the player mines on. */
  landAsset: IAsset | null
  ownedLandsAssets: IAsset[] | null
  ownedLandsAssetsDayBoosts: LandBoostsDay[] | null
  ownedLandBoostsAssets: IAsset[] | null
  bagAssets: IAsset[] | null
  assetsFilter: AssetsFilter | null
  filteredAndSortedAssets: IAsset[] | null
  /** Set when assets, the bag or the filter change; filterAndSortAssets clears it. */
  triggerFilterAndSortAssets: boolean
  filterByToolType: FilterByToolType
  landAssetsFilter: LandAssetsFilter
}

export interface MiningStore extends MiningState {
  setAssets: (assets: IAsset[] | null) => void
  setAvatarAsset: (avatarAsset: IAsset | null) => void
  setLandAsset: (landAsset: IAsset | null) => void
  setOwnedLandsAssets: (ownedLandsAssets: IAsset[] | null) => void
  setOwnedLandsAssetsDayBoosts: (boosts: LandBoostsDay[] | null) => void
  setOwnedLandBoostsAssets: (ownedLandBoostsAssets: IAsset[] | null) => void
  setBagAssets: (bagAssets: IAsset[] | null) => void
  setTriggerFilterAndSortAssets: (trigger: boolean) => void
  setAssetsFilter: (assetsFilter: AssetsFilter) => void
  setFilterByToolType: (filterByToolType: FilterByToolType) => void
  /** Rebuilds filteredAndSortedAssets when triggered; called on main's sync tick. */
  filterAndSortAssets: (input: { isLoggedIn: boolean }) => void
  setLandAssetsFilter: (landAssetsFilter: LandAssetsFilter) => void
  resetLandAssetsFilter: () => void
  setLandAssetsFilterLoading: (isLoading: boolean) => void
  /** Copies a managed land's new rating onto the loaded assets. */
  syncLandRating: (landDetails: IAsset) => void
}

export const getInitialMiningState = (): MiningState => ({
  assets: null,
  avatarAsset: null,
  landAsset: null,
  ownedLandsAssets: null,
  ownedLandsAssetsDayBoosts: null,
  ownedLandBoostsAssets: null,
  bagAssets: null,
  assetsFilter: null,
  filteredAndSortedAssets: null,
  triggerFilterAndSortAssets: false,
  filterByToolType: {
    filterByOptions: filterByToolTypeOptions,
    selectedFilterByOption: filterByToolTypeDefaultOption,
  },
  landAssetsFilter: getDefaultLandAssetsFilter(),
})

const ASSET_PAGES = [
  { path: PagePath.Inventory },
  { path: PagePath.Shining },
  { path: PagePath.Tools },
  { path: PagePath.LandMgtSubpage },
]

// How long the land filter reports isLoading after a change, as the Overmind debounce did.
const LAND_FILTER_LOADING_MS = 200

// Assets without a stat sort after the others, in either direction.
const statOrMissing = (value: number | string | undefined, reversed: boolean, pad = true) => {
  if (!value) return reversed ? '000' : '100'
  return pad ? value.toString().padStart(3, '0') : value.toString()
}

const sortValue = (asset: IAsset, other: IAsset, filter: AssetsFilter): [string, string] => {
  const a = asset.data
  const b = other.data
  const { reversed } = filter

  switch (filter.sortBy) {
    case SortBy.NAME:
      return [a?.name, b?.name]
    case SortBy.RARITY:
      return [
        Rarity[toUpper(a?.rarity) ?? 0]?.toString(),
        Rarity[toUpper(b?.rarity) ?? 0]?.toString(),
      ]
    case SortBy.SHINE:
      return [statOrMissing(a?.shine, reversed, false), statOrMissing(b?.shine, reversed, false)]
    case SortBy.AFFINITY:
      return [a?.affinity ?? '', b?.affinity ?? '']
    case SortBy.ARTIFACT_TYPE:
      return [a?.artifact_type ?? '', b?.artifact_type ?? '']
    // Delay can go up to 4 digits, so comparing it as strings would put '100' before '20'.
    case SortBy.DELAY:
      return [
        a?.delay ? (a.delay > b?.delay ? '1' : '0') : '0',
        a?.delay ? (a.delay < b?.delay ? '1' : '0') : '1',
      ]
    case SortBy.EASE:
      return [statOrMissing(a?.ease, reversed), statOrMissing(b?.ease, reversed)]
    case SortBy.LUCK:
      return [statOrMissing(a?.luck, reversed), statOrMissing(b?.luck, reversed)]
    case SortBy.ATTACK:
      return [statOrMissing(a?.attack, reversed), statOrMissing(b?.attack, reversed)]
    case SortBy.DEFENSE:
      return [statOrMissing(a?.defense, reversed), statOrMissing(b?.defense, reversed)]
    case SortBy.MOVE_COST:
      return [statOrMissing(a?.movecost, reversed), statOrMissing(b?.movecost, reversed)]
    case SortBy.KEY:
      return [(toUpper(a?.key) ?? 0).toString(), (toUpper(b?.key) ?? 0).toString()]
    case SortBy.ELEMENT:
      return [
        statOrMissing(a?.element, reversed, false),
        statOrMissing(b?.element, reversed, false),
      ]
    case SortBy.PROCESS:
      return [
        statOrMissing(a?.process, reversed, false),
        statOrMissing(b?.process, reversed, false),
      ]
    default:
      return ['', '']
  }
}

/**
 * Filters assets to the selected schema, optionally groups copies of a template into one card
 * (counted in `total_of_type`), and sorts them. On the tools page, tools already in the bag are
 * kept out of the groups and shown one by one.
 */
export const filterAndSortAssetList = (
  assets: IAsset[],
  filter: AssetsFilter,
  bagAssets: IAsset[] | null,
  isToolsPage: boolean
): IAsset[] => {
  let result = assets.filter(
    (x) =>
      filter.assetSchema === null ||
      filter.assetSchema === x.schema.schema_name ||
      // Some LEVEL NFTs are shown as ORE.
      (filter.assetSchema === AssetSchema.ORE &&
        x.schema.schema_name === AssetSchema.LEVEL &&
        levelTemplateIdsAsOre.includes(x.template.template_id))
  )

  const excludedAssets: IAsset[] = []
  const excludeBag = isToolsPage && bagAssets
  if (excludeBag) {
    const bagAssetIds = bagAssets.map((x) => x.asset_id)
    result = result.filter((x) => {
      if (!bagAssetIds.includes(x.asset_id)) return true
      excludedAssets.push({ ...x, total_of_type: 1 } as IAsset)
      return false
    })
  }

  if (filter.groupByTemplate) {
    result = result.reduce<IAsset[]>((grouped, asset) => {
      const index = grouped.findIndex((x) => x.template.template_id === asset.template.template_id)

      if (index < 0 || asset.schema.schema_name === AssetSchema.LAND) {
        const groupedAsset: IAsset = cloneDeep(asset)
        groupedAsset.total_of_type = 1
        grouped.push(groupedAsset)
      } else {
        grouped[index].total_of_type += 1
      }

      return grouped
    }, [])
  }

  if (excludeBag) {
    result = result.concat(excludedAssets)
  }

  result = [...result].sort((a, b) => {
    const [aValue, bValue] = sortValue(a, b, filter)
    return aValue.localeCompare(bValue)
  })

  return filter.reversed ? result.reverse() : result
}

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

    setAssets: (assets) => set({ assets }),
    setAvatarAsset: (avatarAsset) => set({ avatarAsset }),
    setLandAsset: (landAsset) => set({ landAsset }),
    setOwnedLandsAssets: (ownedLandsAssets) => set({ ownedLandsAssets }),
    setOwnedLandsAssetsDayBoosts: (ownedLandsAssetsDayBoosts) => set({ ownedLandsAssetsDayBoosts }),
    setOwnedLandBoostsAssets: (ownedLandBoostsAssets) => set({ ownedLandBoostsAssets }),
    setBagAssets: (bagAssets) => set({ bagAssets }),
    setTriggerFilterAndSortAssets: (triggerFilterAndSortAssets) =>
      set({ triggerFilterAndSortAssets }),

    setAssetsFilter: (assetsFilter) => {
      set({
        filteredAndSortedAssets: null,
        assetsFilter: bindAssetsFilterView({ ...assetsFilter }, window.location.pathname),
        triggerFilterAndSortAssets: true,
      })
    },

    setFilterByToolType: (filterByToolType) => set({ filterByToolType }),

    filterAndSortAssets: ({ isLoggedIn }) => {
      const { pathname } = window.location

      if (!isLoggedIn) {
        set({ filteredAndSortedAssets: null })
      }

      const { triggerFilterAndSortAssets, assets, assetsFilter, bagAssets } = get()
      if (!triggerFilterAndSortAssets || !matchRoutes(ASSET_PAGES, pathname) || !isLoggedIn) {
        return
      }

      if (!assets || !assetsFilter) {
        set({ filteredAndSortedAssets: null })
        return
      }

      set({
        triggerFilterAndSortAssets: false,
        filteredAndSortedAssets: filterAndSortAssetList(
          assets,
          assetsFilter,
          bagAssets,
          pathname === PagePath.Tools
        ),
      })
    },

    setLandAssetsFilter: (landAssetsFilter) => setLandFilterWithLoading(landAssetsFilter),

    resetLandAssetsFilter: () => setLandFilterWithLoading(getDefaultLandAssetsFilter()),

    setLandAssetsFilterLoading: (isLoading) =>
      set({ landAssetsFilter: { ...get().landAssetsFilter, isLoading } }),

    syncLandRating: (landDetails) => {
      const { assets, filteredAndSortedAssets } = get()
      set({
        ...(assets && { assets: updateLandRating(assets, landDetails) }),
        ...(filteredAndSortedAssets && {
          filteredAndSortedAssets: updateLandRating(filteredAndSortedAssets, landDetails),
        }),
      })
    },
  }
})
