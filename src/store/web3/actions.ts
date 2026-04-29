import { WalletState } from '@web3-onboard/core'
import { DateTime } from 'luxon'
import { catchError, pipe } from 'overmind'
import { executeAfter } from 'store/main/helpers'

import { Context } from '..'
import { Constants } from '../../shared/util/constants'

export const onInitializeOvermind = async ({ state, effects, actions }: Context) => {
  effects.web3.api.initialize({
    onConnectionSuccess(account) {
      state.web3.account = account
      actions.missions.reloadMissions()
    },
    onAccountChanged(account) {
      state.web3.account = account
      actions.missions.reloadMissions()
    },
    onChainChanged() {
      actions.missions.reloadMissions()
      actions.wax.collectEvent({ name: Constants.GA_CHAIN_CHANGED })
    },
    onInOutTransfer() {
      executeAfter(state.main.syncAi.bscBalance, DateTime.now())
      executeAfter(state.main.syncAi.explorer, DateTime.now())
    },
    onDisconnect() {
      state.web3.account = null
      actions.missions.reloadMissions()
    },
    getSelectedMission() {
      return state.missions.selectedMission
    },
  })
}

export const updateTotalMissionsNfts = ({ state }: Context, totalMissionsNfts: number) => {
  state.web3.totalMissionsNfts = totalMissionsNfts
}

export const updateLoadedMissionsNfts = ({ state }: Context, loadedMissionsNfts: number) => {
  state.web3.loadedMissionsNfts = loadedMissionsNfts
}

export const setWallet = pipe(
  ({ state }: Context, missionsFilter: WalletState) => {
    state.web3.userWallet = missionsFilter
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const setIsAutoConnect = pipe(
  ({ state }: Context, value: boolean) => {
    state.web3.isAutoConnect = value
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setIsSync = pipe(
  ({ state }: Context, value: boolean) => {
    state.web3.isSync = value
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const initializeOrReloadBscBalance = pipe(
  async ({ state, effects }: Context) => {
    if (state.web3.userWallet === null) {
      state.web3.bscTlmBalance = null
      return
    }
    state.main.syncAi.bscBalance.isInProgress = true

    state.web3.bscTlmBalance = await effects.web3.api.getBscTlmBalance(
      state.web3.userWallet.provider,
      state.web3.userWallet.accounts[0].address
    )

    executeAfter(state.main.syncAi.bscBalance, DateTime.now().plus({ minutes: 1 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.bscBalance.isInProgress = false
  })
)

export const disconnectProvider = ({ state }: Context) => {
  state.web3.account = null
}
