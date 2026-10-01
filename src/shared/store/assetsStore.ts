import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { cloneDeep, toUpper } from 'lodash'
import { matchPath, matchRoutes } from 'react-router'
import { useMinerStore } from 'shared/store/minerStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { scheduleSync } from 'shared/store/syncScheduler'
import { getAssetById } from 'shared/util/atomicassets'
import { updateLandRating } from 'shared/util/landRating'
import { levelTemplateIdsAsOre } from 'shared/util/nft'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'
import {
  buildSetAvatarActions,
  buildSetBagActions,
  buildSetLandActions,
} from 'shared/wax/assetActions'
import { transact } from 'shared/wax/transact'
import { bindAssetsFilterView, getDefaultAssetsFilter } from 'store/atomic/helpers'
import { AssetSchema, AssetsFilter, SortBy } from 'store/atomic/types'
import { PagePath, Rarity } from 'store/main/types'
import { WaxBag } from 'store/wax/types'
import { create } from 'zustand'

// The player's NFTs and the asset filter over them: state used by more than one feature
// (inventory, mining, syndicates) and by shared UI. Formerly part of Overmind's `atomic` state.
// State only one feature uses lives in that feature's store (features/mining/store/miningStore,
// features/inventory/store/inventoryStore), so a feature can be removed without touching this.
//
// The loaders that fill it still run in Overmind (store/atomic/actions.ts) on main's sync tick,
// and write here through the setters.

export interface AssetsState {
  assets: IAsset[] | null
  avatarAsset: IAsset | null
  /** The land the player mines on. */
  landAsset: IAsset | null
  ownedLandsAssets: IAsset[] | null
  /** The player's bag row: the ids of the equipped tools. `undefined` until first loaded. */
  bag: WaxBag | null | undefined
  /** The tools equipped for mining. */
  bagAssets: IAsset[] | null
  assetsFilter: AssetsFilter | null
  filteredAndSortedAssets: IAsset[] | null
  /** Set when assets, the bag or the filter change; filterAndSortAssets clears it. */
  triggerFilterAndSortAssets: boolean
}

export interface AssetsStore extends AssetsState {
  setAssets: (assets: IAsset[] | null) => void
  setAvatarAsset: (avatarAsset: IAsset | null) => void
  setLandAsset: (landAsset: IAsset | null) => void
  setOwnedLandsAssets: (ownedLandsAssets: IAsset[] | null) => void
  setWaxBag: (bag: WaxBag | null | undefined) => void
  setBagAssets: (bagAssets: IAsset[] | null) => void
  setTriggerFilterAndSortAssets: (trigger: boolean) => void
  setAssetsFilter: (assetsFilter: AssetsFilter) => void
  /** Rebuilds filteredAndSortedAssets when triggered; called on main's sync tick. */
  filterAndSortAssets: (input: { isLoggedIn: boolean }) => void
  /** Copies a managed land's new rating onto the loaded assets. */
  syncLandRating: (landDetails: IAsset) => void
  /** Resets the asset filter to the default for the current page. */
  presetAssetsFilter: () => void
  /** Equips these tools (asset ids, in slot order). */
  setBag: (assetIds: string[]) => Promise<void>
  /** Makes this land the player's mining land. */
  setLand: (landId: string) => Promise<void>
  setAvatar: (avatarId: string) => Promise<void>
}

export const getInitialAssetsState = (): AssetsState => ({
  assets: null,
  avatarAsset: null,
  landAsset: null,
  ownedLandsAssets: null,
  bag: undefined,
  bagAssets: null,
  assetsFilter: null,
  filteredAndSortedAssets: null,
  triggerFilterAndSortAssets: false,
})

const ASSET_PAGES = [
  { path: PagePath.Inventory },
  { path: PagePath.Shining },
  { path: PagePath.Tools },
  { path: PagePath.LandMgtSubpage },
]

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

export const useAssetsStore = create<AssetsStore>((set, get) => ({
  ...getInitialAssetsState(),

  setAssets: (assets) => set({ assets }),
  setAvatarAsset: (avatarAsset) => set({ avatarAsset }),
  setLandAsset: (landAsset) => set({ landAsset }),
  setOwnedLandsAssets: (ownedLandsAssets) => set({ ownedLandsAssets }),
  setWaxBag: (bag) => set({ bag }),
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

  syncLandRating: (landDetails) => {
    const { assets, filteredAndSortedAssets } = get()
    set({
      ...(assets && { assets: updateLandRating(assets, landDetails) }),
      ...(filteredAndSortedAssets && {
        filteredAndSortedAssets: updateLandRating(filteredAndSortedAssets, landDetails),
      }),
    })
  },

  presetAssetsFilter: () => {
    const { pathname } = window.location
    const { assetsFilter, setAssetsFilter } = get()

    if (!assetsFilter) {
      setAssetsFilter(getDefaultAssetsFilter(pathname))
      return
    }

    const pageFilter: Pick<AssetsFilter, 'sortBy' | 'assetSchema'> | null = matchPath(
      PagePath.Inventory,
      pathname
    )
      ? { sortBy: SortBy.NAME, assetSchema: null }
      : matchPath(PagePath.Tools, pathname)
      ? { sortBy: SortBy.RARITY, assetSchema: AssetSchema.TOOL }
      : matchPath(PagePath.Shining, pathname)
      ? { sortBy: SortBy.NAME, assetSchema: null }
      : null

    setAssetsFilter(
      pageFilter
        ? { groupByTemplate: true, reversed: false, view: null, ...pageFilter }
        : { ...assetsFilter }
    )
  },

  setBag: async (assetIds) => {
    const { walletId } = useSessionStore.getState()
    if (!walletId) return

    try {
      await transact(buildSetBagActions(walletId, assetIds))
    } catch (error) {
      toastErrorMessage(error?.toString())
      return
    }

    const slot = useModalStore.getState().miningToolsDrawer.activeSlotIndex + 1
    const equipped = get().bag?.items?.length
    if (equipped < assetIds.length) toastMessage(`Tool Slot #${slot} equipped successfully.`)
    else if (equipped === assetIds.length) toastMessage(`Tool Slot #${slot} updated successfully.`)
    else if (equipped > assetIds.length) toastMessage(`Tool Slot #${slot} cleared successfully.`)

    const { bag } = get()
    if (bag) set({ bag: { ...bag, items: assetIds } })

    try {
      const bagAssets = await Promise.all(assetIds.map((id) => getAssetById(id)))
      set({ bagAssets, triggerFilterAndSortAssets: true })
    } catch (error) {
      console.error(error)
    }
    scheduleSync(['bag'], 5)
  },

  setLand: async (landId) => {
    const { walletId } = useSessionStore.getState()
    if (!walletId) return

    try {
      await transact(buildSetLandActions(walletId, landId))
    } catch (error) {
      toastErrorMessage(error?.toString())
      return
    }

    toastMessage('Mining Land updated successfully.')
    try {
      const landAsset = await getAssetById(landId)
      set({ landAsset })
      useMinerStore.getState().setPlanetSelectedForMining(landAsset)
    } catch (error) {
      console.error(error)
    }
    scheduleSync(['land'], 15)
  },

  setAvatar: async (avatarId) => {
    const { walletId } = useSessionStore.getState()
    if (!walletId) return

    try {
      await transact(buildSetAvatarActions(walletId, avatarId))
    } catch (error) {
      toastErrorMessage(error?.toString())
      return
    }

    toastMessage('Avatar updated successfully.')
    try {
      set({ avatarAsset: await getAssetById(avatarId) })
    } catch (error) {
      console.error(error)
    }
    scheduleSync(['avatar'], 15)
  },
}))
