import { config } from 'shared/util/config'
import { create } from 'zustand'

export interface SessionStore {
  walletId: string | null
  isDemoUser: boolean
  setWalletId: (walletId: string | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  walletId: null,
  isDemoUser: false,

  setWalletId: (walletId) => {
    set({ walletId, isDemoUser: walletId === config.DemoUserWaxAccount })
  },
}))
