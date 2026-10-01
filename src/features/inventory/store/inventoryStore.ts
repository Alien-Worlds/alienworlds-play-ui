import { LandBoostsDay } from 'features/mining/types/LandownerTypes'
import { create } from 'zustand'

import { PAGINATION } from '../constants'

interface InventoryStore {
  visibleCount: number
  /** Today's boosts on each land the player owns, shown on the land cards. */
  ownedLandsAssetsDayBoosts: LandBoostsDay[] | null
  reset: () => void
  loadMore: (total: number) => void
  setOwnedLandsAssetsDayBoosts: (boosts: LandBoostsDay[] | null) => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
  ownedLandsAssetsDayBoosts: null,
  reset: () => set({ visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE }),
  loadMore: (total) =>
    set((state) => ({
      visibleCount: Math.min(state.visibleCount + PAGINATION.DEFAULT_ITEMS_PER_PAGE, total),
    })),
  setOwnedLandsAssetsDayBoosts: (ownedLandsAssetsDayBoosts) => set({ ownedLandsAssetsDayBoosts }),
}))
