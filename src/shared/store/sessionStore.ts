import { Session } from '@wharfkit/session'
import { config } from 'shared/util/config'
import { WaxPlayer } from 'store/wax/types'
import { create } from 'zustand'

export interface SessionStore {
  walletId: string | null
  isDemoUser: boolean
  isLoggedIn: boolean
  currentWallet: string | null
  isAuthenticating: boolean | null
  /** Wharf session that signs transactions. Mirrored from Overmind's `main.currentSession`. */
  currentSession: Session | null
  /** The account's row in the players table (tag, avatar); null when logged out or not set. */
  player: WaxPlayer | null
  setWalletId: (walletId: string | null) => void
  setCurrentWallet: (currentWallet: string | null) => void
  setIsAuthenticating: (isAuthenticating: boolean | null) => void
  setCurrentSession: (currentSession: Session | null) => void
  setPlayer: (player: WaxPlayer | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  walletId: null,
  isDemoUser: false,
  isLoggedIn: false,
  currentWallet: null,
  isAuthenticating: null,
  currentSession: null,
  player: null,

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

  setCurrentSession: (currentSession) => {
    set({ currentSession })
  },

  setPlayer: (player) => {
    set({ player })
  },
}))
