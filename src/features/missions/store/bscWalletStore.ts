import { WalletState } from '@web3-onboard/core'
import { BigNumber } from 'ethers'
import { commify, formatUnits } from 'ethers/lib/utils'
import { create } from 'zustand'

// The player's BSC wallet (web3-onboard) and its missions balances. The missions store's loaders
// fill the balances and NFT progress. Formerly Overmind's web3 namespace; the formatted balances
// and NFT progress, derived there, are fields here recomputed on change.

export interface BscWalletState {
  /** The connected BSC wallet, or null (missions then show the demo data). */
  userWallet: WalletState | null
  /** Reconnect the last wallet when the missions pages open. Off once no wallet is connected. */
  isAutoConnect: boolean
  /** Whether any missions data has loaded. Until then the loaders don't wait for their schedule. */
  isSync: boolean
  /** TLM on BSC, 4 decimals on chain. */
  bscTlmBalance: BigNumber | null
  bscTlmBalanceFormatted: string | null
  /** TLM locked on missions not yet claimed, 4 decimals. */
  bscStakedTlmBalance: number | null
  bscStakedTlmBalanceFormatted: string | null
  /** Mission NFTs in the wallet, and how many have loaded so far. */
  totalMissionsNfts: number
  loadedMissionsNfts: number
  loadingProgressMissionsNfts: number
}

export interface BscWalletStore extends BscWalletState {
  setWallet: (userWallet: WalletState | null) => void
  setIsAutoConnect: (isAutoConnect: boolean) => void
  setIsSync: (isSync: boolean) => void
  setBscTlmBalance: (bscTlmBalance: BigNumber | null) => void
  setBscStakedTlmBalance: (bscStakedTlmBalance: number | null) => void
  setTotalMissionsNfts: (totalMissionsNfts: number) => void
  setLoadedMissionsNfts: (loadedMissionsNfts: number) => void
}

const formatTlm = (value: BigNumber | number | null) =>
  value !== null ? commify(formatUnits(value, 4)) : null

const derive = (
  state: Pick<
    BscWalletState,
    'bscTlmBalance' | 'bscStakedTlmBalance' | 'totalMissionsNfts' | 'loadedMissionsNfts'
  >
) => ({
  bscTlmBalanceFormatted: formatTlm(state.bscTlmBalance),
  bscStakedTlmBalanceFormatted: formatTlm(state.bscStakedTlmBalance),
  loadingProgressMissionsNfts: (state.loadedMissionsNfts / state.totalMissionsNfts) * 100,
})

const initialBalances = {
  bscTlmBalance: null,
  bscStakedTlmBalance: null,
  totalMissionsNfts: 0,
  loadedMissionsNfts: 0,
}

export const getInitialBscWalletState = (): BscWalletState => ({
  userWallet: null,
  isAutoConnect: true,
  isSync: false,
  ...initialBalances,
  ...derive(initialBalances),
})

/** The connected wallet's first address, or undefined. */
export const getBscAddress = (userWallet: WalletState | null): string | undefined =>
  userWallet?.accounts?.[0]?.address

export const useBscWalletStore = create<BscWalletStore>((set, get) => {
  const update = (patch: Partial<BscWalletState>) => {
    set({ ...patch, ...derive({ ...get(), ...patch }) })
  }

  return {
    ...getInitialBscWalletState(),

    setWallet: (userWallet) => set({ userWallet }),
    setIsAutoConnect: (isAutoConnect) => set({ isAutoConnect }),
    setIsSync: (isSync) => set({ isSync }),
    setBscTlmBalance: (bscTlmBalance) => update({ bscTlmBalance }),
    setBscStakedTlmBalance: (bscStakedTlmBalance) => update({ bscStakedTlmBalance }),
    setTotalMissionsNfts: (totalMissionsNfts) => update({ totalMissionsNfts }),
    setLoadedMissionsNfts: (loadedMissionsNfts) => update({ loadedMissionsNfts }),
  }
})
