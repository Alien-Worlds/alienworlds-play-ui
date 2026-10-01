import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoost, LandSlot } from 'features/mining/types/LandownerTypes'
import { fetchLandBoostsByDay, getLandBoostSlots } from 'features/mining/utils/landBoosts'
import {
  buildApplyMainBoostActions,
  buildBoostSlotActions,
  buildSetCommissionActions,
  buildSetMinBoostActions,
  buildShineActions,
  buildUnlockSlotActions,
} from 'features/mining/utils/miningActions'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { scheduleSync } from 'shared/store/syncScheduler'
import { getAssetById } from 'shared/util/atomicassets'
import { PrepareTlmAmountWithPrecision, today25hDay } from 'shared/util/helpers'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'
import { transact } from 'shared/wax/transact'
import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import {
  FilterByToolType,
  filterByToolTypeDefaultOption,
  filterByToolTypeOptions,
  LandAssetsFilter,
} from 'store/atomic/types'
import { ShineData } from 'store/wax/types'
import { create } from 'zustand'

// State only mining uses: the Land page filter, the tools drawer's tool type, the land being
// managed (LandMgt) with its boosts, and shining. The player's NFTs, bag and mining land are
// shared with other features and live in shared/store/assetsStore; the miner and mining planet
// in shared/store/minerStore.

export interface MiningState {
  /** MEGA/SUPER land boost NFTs the player owns. */
  ownedLandBoostsAssets: IAsset[] | null
  /** Tool type chosen in the tools drawer. */
  filterByToolType: FilterByToolType
  /** Filters and sort for the Land page. */
  landAssetsFilter: LandAssetsFilter
  /** The land open in LandMgt or the boost drawer. */
  managingLandId: string | null
  managingLandDetails: IAsset | null
  /** Today's boosts on the managed land. */
  managingLandBoosts: LandBoost[]
  /** The managed land's 15 boost slots, derived from its boosts and open slots. */
  managingLandBoostFullSlots: LandSlot[]
  isLoadingManagingLandBoosts: boolean
  /** The managed land prepared as an NFT card. */
  nftLandCardProperties: Record<string, any> | null
  isShining: boolean
  /** The shining video shown after a successful shine. */
  shiningUrl: string | null
}

export interface MiningStore extends MiningState {
  setOwnedLandBoostsAssets: (ownedLandBoostsAssets: IAsset[] | null) => void
  setFilterByToolType: (filterByToolType: FilterByToolType) => void
  setLandAssetsFilter: (landAssetsFilter: LandAssetsFilter) => void
  resetLandAssetsFilter: () => void
  setLandAssetsFilterLoading: (isLoading: boolean) => void
  setLandId: (landId: string | null) => void
  setNftLandCardProperties: (card: Record<string, any> | null) => void
  setShiningUrl: (url: string | null) => void
  /** Loads the managed land and today's boosts on it. */
  loadManagingLandDetailsAndBoosts: () => Promise<void>
  /** Same, after a 6s wait for a transaction to reach the chain. */
  loadManagingLandDetailsAndBoostsWithDelay: () => Promise<void>
  /** Shines `itemIds`. Resolves true on success. */
  tryShine: (input: { itemIds: string[]; shineData: ShineData }) => Promise<boolean>
  /** `commission` is the on-chain integer (percent * 100) as a string. */
  trySetCommission: (input: { landId: string; commission: string }) => Promise<void>
  boostSlot: (input: { landId: string; price: number }) => Promise<boolean>
  unlockSlot: (input: { landId: string; cost: number }) => Promise<boolean>
  applyMainBoost: (input: { landId: string; boost: IAsset }) => Promise<boolean>
  setMinBoost: (input: { landId: string; levelPrice: number }) => Promise<boolean>
}

export const getInitialMiningState = (): MiningState => ({
  ownedLandBoostsAssets: null,
  filterByToolType: {
    filterByOptions: filterByToolTypeOptions,
    selectedFilterByOption: filterByToolTypeDefaultOption,
  },
  landAssetsFilter: getDefaultLandAssetsFilter(),
  managingLandId: null,
  managingLandDetails: null,
  managingLandBoosts: [],
  managingLandBoostFullSlots: [],
  isLoadingManagingLandBoosts: false,
  nftLandCardProperties: null,
  isShining: false,
  shiningUrl: null,
})

// How long the land filter reports isLoading after a change, as the Overmind debounce did.
const LAND_FILTER_LOADING_MS = 200

// Wait before reloading a land after a transaction, so the chain has it.
const LAND_RELOAD_DELAY_MS = 6000

const ON_CHAIN_MESSAGE =
  'Executing transaction on the chain. This process may take a few seconds to complete..'

let landFilterLoadingTimer: ReturnType<typeof setTimeout> | undefined

/** Signs `actions`, toasting the error and resolving false if it fails. */
const signOrToast = async (actions: Parameters<typeof transact>[0]) => {
  try {
    await transact(actions)
    return true
  } catch (error) {
    toastErrorMessage(error?.toString())
    return false
  }
}

const walletId = () => useSessionStore.getState().walletId

export const useMiningStore = create<MiningStore>((set, get) => {
  const setLandFilterWithLoading = (landAssetsFilter: LandAssetsFilter) => {
    set({ landAssetsFilter: { ...landAssetsFilter, isLoading: true } })
    clearTimeout(landFilterLoadingTimer)
    landFilterLoadingTimer = setTimeout(() => {
      set({ landAssetsFilter: { ...get().landAssetsFilter, isLoading: false } })
    }, LAND_FILTER_LOADING_MS)
  }

  const setManagingLand = (
    patch: Partial<Pick<MiningState, 'managingLandDetails' | 'managingLandBoosts'>>
  ) => {
    const { managingLandDetails, managingLandBoosts } = { ...get(), ...patch }
    set({
      ...patch,
      managingLandBoostFullSlots: getLandBoostSlots(managingLandBoosts, managingLandDetails),
    })
  }

  return {
    ...getInitialMiningState(),

    setOwnedLandBoostsAssets: (ownedLandBoostsAssets) => set({ ownedLandBoostsAssets }),
    setFilterByToolType: (filterByToolType) => set({ filterByToolType }),
    setLandAssetsFilter: (landAssetsFilter) => setLandFilterWithLoading(landAssetsFilter),
    resetLandAssetsFilter: () => setLandFilterWithLoading(getDefaultLandAssetsFilter()),
    setLandAssetsFilterLoading: (isLoading) =>
      set({ landAssetsFilter: { ...get().landAssetsFilter, isLoading } }),
    setLandId: (managingLandId) => set({ managingLandId }),
    setNftLandCardProperties: (nftLandCardProperties) => set({ nftLandCardProperties }),
    setShiningUrl: (shiningUrl) => set({ shiningUrl }),

    loadManagingLandDetailsAndBoosts: async () => {
      set({ isLoadingManagingLandBoosts: true })
      const { managingLandId } = get()
      try {
        if (managingLandId) {
          const managingLandDetails = await getAssetById(managingLandId)
          setManagingLand({ managingLandDetails })
          useAssetsStore.getState().syncLandRating(managingLandDetails)

          const boosts = await fetchLandBoostsByDay(managingLandId, today25hDay())
          if (boosts) setManagingLand({ managingLandBoosts: boosts })
        }
      } catch (error) {
        console.error(error)
      }
      set({ isLoadingManagingLandBoosts: false })
    },

    loadManagingLandDetailsAndBoostsWithDelay: async () => {
      await new Promise((resolve) => setTimeout(resolve, LAND_RELOAD_DELAY_MS))
      await get().loadManagingLandDetailsAndBoosts()
    },

    tryShine: async ({ itemIds, shineData }) => {
      set({ isShining: true })
      toastMessage('Shining in progress..')
      const isSuccess = await signOrToast(buildShineActions(walletId(), itemIds, shineData))
      // Overmind left isShining set after a rejected transaction, which locked the page.
      set({ isShining: false })
      if (!isSuccess) return false

      scheduleSync(['assets', 'avatar', 'bag'], 15)
      return true
    },

    trySetCommission: async ({ landId, commission }) => {
      if (!(await signOrToast(buildSetCommissionActions(walletId(), landId, commission)))) return

      toastMessage('Land Commission updated successfully.')
      scheduleSync(['planets', 'land', 'assets'], 15)
    },

    boostSlot: async ({ landId, price }) => {
      const cost = PrepareTlmAmountWithPrecision(price)
      if (!(await signOrToast(buildBoostSlotActions(walletId(), landId, cost)))) return false

      toastMessage(ON_CHAIN_MESSAGE)
      return true
    },

    unlockSlot: async ({ landId, cost }) => {
      const amount = PrepareTlmAmountWithPrecision(cost)
      if (!(await signOrToast(buildUnlockSlotActions(walletId(), landId, amount)))) return false

      toastMessage(ON_CHAIN_MESSAGE)
      return true
    },

    applyMainBoost: async ({ landId, boost }) => {
      if (!(await signOrToast(buildApplyMainBoostActions(walletId(), landId, boost)))) return false

      toastMessage(ON_CHAIN_MESSAGE)
      return true
    },

    setMinBoost: async ({ landId, levelPrice }) => {
      const minBoost = PrepareTlmAmountWithPrecision(levelPrice)
      if (!(await signOrToast(buildSetMinBoostActions(walletId(), landId, minBoost)))) return false

      toastMessage(ON_CHAIN_MESSAGE)
      return true
    },
  }
})
