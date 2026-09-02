import { create } from 'zustand'

import { PAGINATION } from '../constants'

interface InventoryStore {
  visibleCount: number
  reset: () => void
  loadMore: (total: number) => void
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
  reset: () => set({ visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE }),
  loadMore: (total) =>
    set((state) => ({
      visibleCount: Math.min(state.visibleCount + PAGINATION.DEFAULT_ITEMS_PER_PAGE, total),
    })),
}))
