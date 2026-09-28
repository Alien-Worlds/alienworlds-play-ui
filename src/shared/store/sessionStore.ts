import { config } from 'shared/util/config'
import { create } from 'zustand'

export interface SessionStore {
  walletId: string | null
  isDemoUser: boolean
  isLoggedIn: boolean
  currentWallet: string | null
  isAuthenticating: boolean | null
  setWalletId: (walletId: string | null) => void
  setCurrentWallet: (currentWallet: string | null) => void
  setIsAuthenticating: (isAuthenticating: boolean | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  walletId: null,
  isDemoUser: false,
  isLoggedIn: false,
  currentWallet: null,
  isAuthenticating: null,

  setWalletId: (walletId) => {
    set({
      walletId,
      isDemoUser: walletId === config.DemoUserWaxAccount,
      isLoggedIn: walletId !== null,
    })
  },

  setCurrentWallet: (currentWallet) => {
    set({ currentWallet })
  },

  setIsAuthenticating: (isAuthenticating) => {
    set({ isAuthenticating })
  },
}))
