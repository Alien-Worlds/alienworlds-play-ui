// import { WalletState } from '@web3-onboard/core'
import { BigNumber } from 'ethers'
import { commify, formatUnits } from 'ethers/lib/utils'
import { derived } from 'overmind'

type Web3State = {
  account: string
  userWallet: any
  isSync: boolean
  isAutoConnect: boolean
  bscTlmBalance: BigNumber
  bscTlmBalanceFormatted: string
  bscStakedTlmBalance: number
  bscStakedTlmBalanceFormatted: string
  totalMissionsNfts: number
  loadedMissionsNfts: number
  loadingProgressMissionsNfts: number
}

export const defaultState: Web3State = {
  account: null,
  bscStakedTlmBalance: null,
  bscTlmBalance: null,
  bscTlmBalanceFormatted: derived((state: Web3State) =>
    state.bscTlmBalance !== null ? commify(formatUnits(state.bscTlmBalance, 4)) : null
  ),
  bscStakedTlmBalanceFormatted: derived((state: Web3State) =>
    state.bscStakedTlmBalance !== null ? commify(formatUnits(state.bscStakedTlmBalance, 4)) : null
  ),
  totalMissionsNfts: 0,
  loadedMissionsNfts: 0,
  loadingProgressMissionsNfts: derived(
    (state: Web3State) => (state.loadedMissionsNfts / state.totalMissionsNfts) * 100
  ),
  userWallet: null,
  isAutoConnect: true,
  isSync: false,
}

export const state: Web3State = {
  ...defaultState,
}
