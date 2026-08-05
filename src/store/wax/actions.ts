import { IAsset, ITemplate } from 'atomicassets/build/API/Explorer/Objects'
import { LooseObject } from 'features/inventory/utils/NFTCardHelper'
import { LandBoost } from 'features/mining/types/LandownerTypes'
import { BoostLevels } from 'features/mining/utils/constants'
import { updateLandRating } from 'features/mining/utils/landownerUtils'
import {
  CandidacyProposalType,
  ProposalExecutionPayload,
  ProposalSubmission,
  ProposalCancel,
  ClaimBudgetProposal,
  ProposalType,
  ProposalsSortBy,
  ProposalApprovalPayload,
  DaoChangeConfigs,
  DaoDTAPPayload,
  DaoElectionPeriodPayload,
} from 'features/syndicates/types/governanceTypes'
import {
  Candidate,
  DaoDetailsResponse,
  DaoGlobalsResponse,
  DaoWalletDetailsResponse,
} from 'graphql/types'
import { queryClient } from 'index'
import { find, filter, map, join, get, split, last, lowerCase } from 'lodash'
import { DateTime } from 'luxon'
import { catchError, parallel, pipe, wait, waitUntil } from 'overmind'
import { generatePath } from 'react-router'
import { matchPath } from 'react-router-dom'
import { router } from 'routes'
import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/useLoadUserPoints'
import { collectGAEvent } from 'shared/util/analytics'
import { config } from 'shared/util/config'
import {
  dacIdToDacTreasuryAccountList,
  getDacTokenPrecision,
  isObjectEqual,
  PrepareDacTokenAmountWithPrecision,
  PrepareTlmAmountWithPrecision,
  processElectionGlobals,
  today25hDay,
  unionDAOFinder,
} from 'shared/util/helpers'
import { getNftImage } from 'shared/util/nft'
import { isSyndicatesRelatedPage } from 'shared/util/router'
import { initializeOrReloadAssets } from 'store/atomic/actions'
import { toastErrorMessage, toastMessage } from 'store/main/actions'
import { executeAfter, shouldExecute } from 'store/main/helpers'
import { PagePath } from 'store/main/types'
import { LoreFilter, ProposalsFilter } from 'store/wax/state'

import {
  OnboardingData,
  ShineData,
  RequestState,
  TryUnstakeProps,
  PlanetCandidateType,
  PlanetCustodian,
  WaxPlayer,
  PremintOfferWithTemplate,
  WaxResponse,
  WaxUserPoints,
  DacInfoResponse,
} from './types'
import { Context } from '..'
import { Constants } from '../../shared/util/constants'

export const collectEvent = pipe(
  ({ state }: Context, data: { name: string; fields?: any }) => {
    // @TODO do we want to use queryClient.ensureQueryData instead to load data if not present?
    const nftPoints: WaxUserPoints = queryClient.getQueryData([LOAD_USER_POINTS_QUERY_KEY])

    const stateInfo = {
      ...data.fields,
      bag: state.wax.bag?.items,
      wallet: state.wax.walletId,
      lastMine: state.wax.miner?.last_mine,
      username: state.wax.player?.tag ?? 'null',

      nftPoints: nftPoints?.total_points,
    }
    collectGAEvent(data.name, stateInfo)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const onInitializeOvermind = async ({ state, effects }: Context) => {
  effects.wax.api.initialize({
    getWalletId() {
      return state.wax.walletId
    },
    getCurrentWallet() {
      return state.main.currentWallet
    },

    getCurrentSession() {
      return state.main.currentSession
    },
    getSessionKit() {
      return state.main.sessionKit
    },
    getMiningRandomString() {
      return state.main.miningRandomString
    },
    onTransactionError(error: unknown) {
      state.wax.lastTransactionError = error?.toString()
    },
  })
}

export const setPlanetSelectedForMining = async ({ state }: Context) => {
  if (!state.wax.isLoggedIn || !state.wax.isOnboarded) {
    state.wax.planetSelectedForMining = null
    return
  }

  if (state.wax.isOnboarded) {
    if (!state.atomic.landAsset) {
      state.wax.planetSelectedForMining = null
      return
    }
    const res = last(split(state.atomic.landAsset.data.name, ' '))
    let id = res ? lowerCase(res) : 'naron'

    // find current selectedPlanet
    if (id === 'neri') id = 'nerix'
    state.wax.planetSelectedForMining = id
  }
}

export const initializeOrReloadResources = pipe(
  async ({ state, effects }: Context) => {
    const { pathname } = router.state.location
    if (matchPath(PagePath.Onboarding, pathname)) {
      return
    }

    if (!state.wax.isLoggedIn) {
      state.wax.resources = null
    }

    if (
      !shouldExecute(
        state.main.syncAi.resources,
        state.main.isFocusedWindow && state.wax.isLoggedIn
      )
    ) {
      return
    }

    state.main.syncAi.resources.isInProgress = true

    state.wax.resources = await effects.wax.api.getResources()

    executeAfter(state.main.syncAi.resources, DateTime.now().plus({ minutes: 5 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.resources.isInProgress = false
  })
)

export const initializeOrReloadTerms = pipe(
  async ({ state }: Context) => {
    if (
      !shouldExecute(state.main.syncAi.terms, state.main.isFocusedWindow && state.wax.isLoggedIn)
    ) {
      return
    }

    state.main.syncAi.terms.isInProgress = true

    executeAfter(state.main.syncAi.terms, DateTime.now().plus({ minutes: 120 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.terms.isInProgress = false
  })
)

export const initializeOrReloadRefundsInProgress = pipe(
  async ({ state, effects }: Context) => {
    const { pathname } = router.state.location
    if (!state.wax.isLoggedIn) {
      state.wax.refundsInProgress = null
    }

    if (
      !shouldExecute(
        state.main.syncAi.refunds,
        state.main.isFocusedWindow &&
          matchPath(PagePath.GovernanceSelect, pathname) &&
          state.wax.isLoggedIn
      )
    ) {
      return
    }

    state.main.syncAi.refunds.isInProgress = true

    state.wax.refundsInProgress = await effects.wax.api.getRefundsInProgress()

    executeAfter(state.main.syncAi.refunds, DateTime.now().plus({ minutes: 2 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.refunds.isInProgress = false
  })
)

export const setBag = pipe(
  async ({ state, effects }: Context, asssetIds: string[]) => {
    await effects.wax.api.setBag(asssetIds)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    if (state.wax.bag?.items?.length < asssetIds?.length) {
      toastMessage(
        `Tool Slot #${state.main.miningToolsDrawer.activeSlotIndex + 1} equipped successfully.`
      )
    } else if (state.wax.bag?.items?.length === asssetIds?.length) {
      toastMessage(
        `Tool Slot #${state.main.miningToolsDrawer.activeSlotIndex + 1} updated successfully.`
      )
    } else if (state.wax.bag?.items?.length > asssetIds?.length) {
      toastMessage(
        `Tool Slot #${state.main.miningToolsDrawer.activeSlotIndex + 1} cleared successfully.`
      )
    }

    if (state.wax.bag) {
      state.wax.bag.items = asssetIds
    }

    const assets = await Promise.all(
      asssetIds.map((item) => {
        return effects.atomic.api.getAssetById(item)
      })
    )

    state.atomic.bagAssets = assets

    state.atomic.triggerFilterAndSortAssets = true

    executeAfter(state.main.syncAi.bag, DateTime.now().plus({ seconds: 5 }))
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setLand = pipe(
  async ({ state, actions, effects }: Context, landId: string) => {
    await effects.wax.api.setLand(landId)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    toastMessage(`Mining Land updated successfully.`)

    state.atomic.landAsset = await effects.atomic.api.getAssetById(landId)

    actions.wax.setPlanetSelectedForMining()

    executeAfter(state.main.syncAi.land, DateTime.now().plus({ seconds: 15 }))
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setPlanetSelectedForMiningIntent = pipe(
  ({ state }: Context, planetName: string) => {
    state.wax.whereToMineIntent = planetName
    router.navigate(PagePath.Land)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const setPlanetNameForMiningIntent = pipe(
  ({ state }: Context, planetName: string) => {
    state.wax.selectedPlanetName = planetName
    router.navigate(PagePath.Land)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setTag = pipe(
  async ({ state, effects }: Context, tag: string) => {
    state.wax.isSettingTag = true
    await effects.wax.api.setTag(tag)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    state.wax.currentTag = tag
    executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 15 }))
    state.wax.isSettingTag = false
  },
  catchError(({ state }: Context, error) => {
    state.wax.isSettingTag = false
    console.error(error)
  })
)

export const setAvatar = pipe(
  async ({ state, effects }: Context, avatarId: string) => {
    await effects.wax.api.setAvatar(avatarId)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    toastMessage(`Avatar updated successfully.`)

    state.atomic.avatarAsset = await effects.atomic.api.getAssetById(avatarId)

    executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 15 }))
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const tryStake = pipe(
  async ({ state, effects }: Context, amount: number) => {
    const quantity = PrepareTlmAmountWithPrecision(amount)
    await effects.wax.api.stake(dacIdToDacTreasuryAccountList[state.wax.selectedDacId], quantity)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`TLM staked successfully.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 2 }))
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 2 }))
    return true
  },
  catchError((context: Context, error) => {
    toastErrorMessage(error?.message ?? 'Staking has failed')
    console.error(error)
    return false
  })
)

export const tryClaimUnstake = pipe(
  async ({ state, effects }: Context, sym: string) => {
    const symbol = sym
    await effects.wax.api.claimUnstake(symbol)
    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    toastMessage('TLM claimed successfully.')

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 2 }))
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 5 }))
    return true
  },
  catchError((context: Context, error) => {
    toastErrorMessage(error?.message ?? 'Claim TLM has failed')
    return false
  })
)

export const tryCancelUnstake = pipe(
  async ({ state, effects }: Context, input: { id: number; symbol: string }) => {
    await effects.wax.api.cancelUnstake(input.id, input.symbol)
    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Unstaking on Release cancelled.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError((context: Context, error) => {
    toastErrorMessage(error?.message ?? 'Staking has failed')
    console.error(error)
    return false
  })
)

export const tryStakeVotePower = pipe(
  async (
    { state, effects }: Context,
    input: {
      planet: DaoDetailsResponse
      amount: number
      releaseTime: number
      currentVotingDelay: number
    }
  ) => {
    state.wax.actionProgressState = RequestState.InProgress
    await effects.wax.api.stakeVotePower(
      input.planet,
      input.amount,
      input.releaseTime,
      input.currentVotingDelay
    )

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Staking Vote Power successfully.`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastErrorMessage(error?.message ?? 'Staking Vote Power Failed.')
    console.error(error)
    return false
  })
)
export const tryStakeVotePowerLore = pipe(
  async ({ state, effects }: Context, amount: string) => {
    state.wax.actionProgressState = RequestState.InProgress
    await effects.wax.api.stakeVotePowerLore({ amount })

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Staking TLM successfully.`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    // executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastErrorMessage(error?.message ?? 'Staking Vote Power Failed.')
    console.error(error)
    return false
  })
)
export const trySubmitLore = pipe(
  async (
    { state, effects, actions }: Context,
    input: { title: string; url: string; description: string; type: string; fee: string }
  ) => {
    state.wax.actionProgressState = RequestState.InProgress

    await effects.wax.api.submitLore({
      title: input.title,
      url: input.url,
      description: input.description,
      type: 'lore',
      fee: input.fee,
    })

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    actions.modal.resetAllSecondaryModals()
    actions.modal.resetAllPrimaryModals()

    toastMessage(`Lore Proposal Submitted.`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    // executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastErrorMessage(error?.message ?? 'Staking Vote Power Failed.')
    console.error(error)
    return false
  })
)
export const tryUnStakeLore = pipe(
  async ({ state, effects, actions }: Context) => {
    state.wax.actionProgressState = RequestState.InProgress
    await effects.wax.api.unStakeLore()

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    actions.modal.resetAllSecondaryModals()
    actions.modal.resetAllPrimaryModals()
    // actions.wax.getAdjustedVotePower(input.planet.dac_id)
    // actions.wax.getDAOUnstakes(input.planet.dac_id)
    // actions.wax.getUserDAOStakes(input.planet.dac_id)
    // actions.wax.getStakeDelay(input.planet.dac_id)
    toastMessage(`Unstaked Successfully`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    // executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastErrorMessage(error?.message ?? 'Staking Vote Power Failed.')
    console.error(error)
    return false
  })
)

export const tryLoreVoting = pipe(
  async (
    { state, effects }: Context,
    input: { proposalId: number; vote: string; votePower: number }
  ) => {
    state.wax.actionProgressState = RequestState.InProgress
    await effects.wax.api.loreVote({
      proposalId: input.proposalId,
      vote: input.vote,
      votePower: input.votePower,
    })

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Lore Vote Successful.`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    // executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastErrorMessage(error?.message ?? 'Staking Vote Power Failed.')
    console.error(error)
    return false
  })
)
export const tryVotingCandidates = pipe(
  async ({ state, effects }: Context, input: { dacId: string; newVotes: string[] }) => {
    state.wax.actionProgressState = RequestState.InProgress
    state.main.autoExpireVoteDACCandidates = 10

    await effects.wax.api.voteCandidates(input.dacId, input.newVotes)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    toastMessage(`Candidates voted successfully.`)
    state.wax.actionProgressState = RequestState.Succeeded
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    executeAfter(
      state.main.syncAi.selectedDacCandidatesCustodians,
      DateTime.now().plus({ seconds: 2 })
    )
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    state.main.syncAi.selectedDacCandidatesCustodians.isInProgress = false
    toastErrorMessage(error?.message ?? 'Voting Candidates Failed.')
    console.error(error)
    return false
  })
)

export const updateVotedCandidates = pipe(({ state }: Context, PlanetCandidates: Candidate[]) => {
  if (!isObjectEqual(state.wax.votedCandidatesList, PlanetCandidates)) {
    state.wax.votedCandidatesList = PlanetCandidates
  }
})
export const updateCandidancyProposal = pipe(
  ({ state }: Context, proposal: CandidacyProposalType) => {
    state.wax.generatedCandidancyProposal = proposal
  }
)

export const tryUnstakeVotePower = pipe(
  async ({ state, effects }: Context, quantity: string): Promise<any> => {
    state.wax.actionProgressState = RequestState.InProgress

    await effects.wax.api.unStakeVotePower(quantity)
    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.actionProgressState = RequestState.Failed
      state.wax.lastTransactionError = null
      return null
    }

    return null
  },
  catchError(({ state }: Context, error) => {
    state.wax.actionProgressState = RequestState.Failed
    toastMessage(`Unstaking Vote Power successfully. ${error}`)
    console.error(error)
  })
)

export const tryUnstake = pipe(
  async ({ state, effects }: Context, { dac, amount }: TryUnstakeProps) => {
    const quantity = `${
      PrepareDacTokenAmountWithPrecision(amount, dac.dac_id, getDacTokenPrecision(dac)).split(
        ' TLM'
      )[0]
    } ${dac.symbol.sym.split(',')[1]}`

    await effects.wax.api.unstake(quantity)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    toastMessage(`TLM unstaked successfully.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 5 }))
    executeAfter(state.main.syncAi.refunds, DateTime.now().plus({ seconds: 15 }))
    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Unstaking has failed')
    console.error(error)
  })
)

export const checkWhitelist = pipe(
  async ({ state, effects }: Context, dacId?: string) => {
    const result = await effects.wax.api.getWhiteListId(dacId)

    state.wax.isUserWhiteListed = result ? true : false
    return result ? true : false
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load Stake Time Multiplier')
    console.error(error)
    return null
  })
)

export const trySetCommission = pipe(
  async ({ state, effects }: Context, input: { landId: string; commission: string }) => {
    await effects.wax.api.setCommission(input.landId, input.commission)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    toastMessage(`Land Commission updated successfully.`)

    executeAfter(state.main.syncAi.planets, DateTime.now().plus({ seconds: 15 }))
    executeAfter(state.main.syncAi.land, DateTime.now().plus({ seconds: 15 }))
    executeAfter(state.main.syncAi.assets, DateTime.now().plus({ seconds: 15 }))
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const tryShine = pipe(
  async ({ state, effects }: Context, input: { itemIds: string[]; shineData: ShineData }) => {
    state.wax.isShining = true
    toastMessage('Shining in progress..')

    await effects.wax.api.submitShine(input.itemIds, input.shineData)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    executeAfter(state.main.syncAi.assets, DateTime.now().plus({ seconds: 15 }))
    executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 15 }))
    executeAfter(state.main.syncAi.bag, DateTime.now().plus({ seconds: 15 }))

    state.wax.isShining = false
    return true
  },
  catchError(({ state }: Context, error) => {
    state.wax.isShining = false
    toastErrorMessage(error?.message ?? 'Shining has failed')
    console.error(error)
    return false
  })
)

export const setOnboarding = pipe(
  ({ state }: Context, onboarding: OnboardingData) => {
    state.wax.onboarding = onboarding
    state.wax.currentTag = onboarding.tagId
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const executeOnboarding = pipe(
  async ({ state, effects, actions }: Context) => {
    if (
      state.wax.onboarding &&
      state.wax.onboarding.avatarId &&
      state.wax.onboarding.landId &&
      state.wax.onboarding.tagId
    ) {
      // Execute Onboarding for pre-validated accounts
      if (state.wax.isValidated) {
        state.missions.loadingMessage = 'Onboarding in progress!'

        await effects.wax.api.executeOnboarding(state.wax.onboarding)

        if (state.wax.lastTransactionError) {
          toastErrorMessage(state.wax.lastTransactionError)
          state.wax.isOnboardingPending = true
          state.wax.lastTransactionError = null
          return
        }
        state.wax.isOnboardingPending = false
        actions.wax.collectEvent({ name: Constants.GA_FIRST_VISIT })
      } else {
        // Pause Onboarding for temporary (not validated) accounts
        state.wax.isOnboardingPending = true
        state.missions.loadingMessage =
          'Please validate your WAX account to complete the Onboarding process!'
      }
    }
  },
  // Wait until temporary account has been validated by the user
  waitUntil((state: any) => state.wax.isValidated === true),
  async ({ state, effects, actions }: Context) => {
    // Restart Onboarding when account has been validated
    if (state.wax.isOnboardingPending) {
      state.missions.loadingMessage = 'Account has been validated, please login to your account!'

      // timeout needed for the user to read the action to execute (login)
      await new Promise((resolve) => setTimeout(resolve, 10000))

      await effects.wax.api.logout()

      // timeout needed for the user to read the action to execute (login)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const currentWallet = localStorage.getItem('aw_currentWallet')

      await actions.main.selectWallet(currentWallet)

      // timeout needed for the new account information to be available on wax instance after activation
      await new Promise((resolve) => setTimeout(resolve, 10000))

      state.missions.loadingMessage = 'Account validated, executing Onboarding...'

      // timeout needed for the user to read the action to execute (onboarding)
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Execute Onboarding for temporary accounts just validated
      await effects.wax.api.executeOnboarding(state.wax.onboarding)

      // set flag to show 'Retry Onboarding' button
      await new Promise((resolve) => setTimeout(resolve, 5000))
      state.wax.showOnboardingRetry = true

      if (state.wax.lastTransactionError) {
        toastErrorMessage(state.wax.lastTransactionError)
        state.wax.lastTransactionError = null
        return
      }

      state.wax.isOnboardingPending = false
      actions.wax.collectEvent({ name: Constants.GA_FIRST_VISIT })
    }
  },
  async ({ state, effects }: Context) => {
    if (state.wax.isOnboardingPending) {
      state.missions.loadingMessage =
        'Onboarding has failed, please validate your WAX account and try again!'
      await effects.wax.api.logout()
      return
    }

    state.wax.showOnboardingRetry = false

    // Onboarding successful
    state.missions.loadingMessage = 'Onboarding completed!'

    await new Promise((resolve) => setTimeout(resolve, 5000))
  },
  // Wait until onboarding is not pending
  waitUntil((state: any) => state.wax.isOnboardingPending === false),
  initializeOrReloadAssets,
  wait(2000),
  async ({ state }: Context) => {
    // Navigate to Mining page if Onboarding was completed successfully
    state.wax.onboarding = null
    state.missions.loadingMessage = null
    state.wax.isOnboardingPending = false
    router.navigate(PagePath.Tools)
    state.atomic.triggerFilterAndSortAssets = true
  },

  catchError(({ state, effects }: Context, error) => {
    // Return to Home page if Onboarding failed for activated or temporary accounts
    state.wax.onboarding = null
    state.missions.loadingMessage = null
    state.wax.isOnboardingPending = false
    state.wax.showOnboardingRetry = false
    effects.wax.api.logout()
    router.navigate(PagePath.Home)
    console.error(error)
  })
)

export const claimNftPts = pipe(
  async ({ state, effects }: Context) => {
    await effects.wax.api.claimNFTPts()

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return
    }

    toastMessage('Shards claimed successfully.')

    executeAfter(state.main.syncAi.assets, DateTime.now().plus({ seconds: 15 }))
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const trySetInitialBag = pipe(
  ({ state, actions }: Context) => {
    const tools = state.atomic.assets.filter((asset) => asset.schema.schema_name === 'tool.worlds')
    // Take first item from player's collection. Just first one (probably initial shovel), no more.
    actions.wax.setBag([tools[0]?.asset_id])
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

/**
 * @todo convert to hook with RQ+useInfiniteQuery and use matchOffersAndTemplatesFromWax helper
 * @see useNftOffers
 * @see useLevelNftOffers
 * @see https://tanstack.com/query/v4/docs/react/guides/infinite-queries
 */
export const loadPremintOffersAction = async (
  { effects, state }: Context,
  { lowerBound = null, fetchLimit = 20 }: { lowerBound: number | string; fetchLimit: number }
): Promise<WaxResponse<PremintOfferWithTemplate>> => {
  if (!state.wax.isLoggedIn) {
    return null
  }

  const premintOffers = await effects.wax.api.getPremintOffers(lowerBound, fetchLimit)

  let templatesFromWax: ITemplate[] = []
  let premintOffersWithTemplates: Array<PremintOfferWithTemplate> = []

  if (premintOffers?.rows.length) {
    const preparedTemplateIds = join(map(premintOffers.rows, 'template_id'), ',')
    templatesFromWax = await effects.atomic.api.getTemplatesByIds(preparedTemplateIds)

    premintOffersWithTemplates = premintOffers.rows.reduce((acc, offerItem) => {
      const matchedTemplate = find(templatesFromWax, (template) => {
        return template.template_id === String(offerItem.template_id)
      })

      if (matchedTemplate) {
        acc.push({
          ...offerItem,
          asset: { ...matchedTemplate, data: matchedTemplate.immutable_data },
        })
      } else {
        console.error(
          `Template ${offerItem.template_id} not found for points offer ${offerItem.offer_id}`
        )
      }
      return acc
    }, [])
  }

  return { ...premintOffers, rows: premintOffersWithTemplates }
}

export const resetLastTransactionError = ({ state }: Context) => {
  state.wax.lastTransactionError = null
}

export const unlockSlot = pipe(
  async ({ effects }: Context, { landId, cost }: { landId: string; cost: number }) => {
    const amount = PrepareTlmAmountWithPrecision(cost)
    const result = await effects.wax.api.unlockSlot(landId, amount)

    if (result) {
      toastMessage(
        'Executing transaction on the chain. This process may take a few seconds to complete..'
      )
      return true
    }

    return false
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Unlock Slot failed')
    console.error(error)
    return null
  })
)

export const applyMainBoost = pipe(
  async ({ effects, state }: Context, { landId, boost }: { landId: string; boost: IAsset }) => {
    const result = await effects.wax.api.applyMainBoost(landId, boost)

    if (result) {
      toastMessage(
        'Executing transaction on the chain. This process may take a few seconds to complete..'
      )
      return true
    }

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    return false
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Apply Boost failed')
    console.error(error)
    return null
  })
)

export const boostSlot = pipe(
  async ({ effects, state }: Context, { landId, price }: { landId: string; price: number }) => {
    const amount = PrepareTlmAmountWithPrecision(price)
    const result = await effects.wax.api.boostSlot(landId, amount)

    if (result) {
      toastMessage(
        'Executing transaction on the chain. This process may take a few seconds to complete..'
      )
      return true
    }

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    return false
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Boost Slot failed')
    console.error(error)
    return null
  })
)

export const setMinBoost = pipe(
  async ({ effects }: Context, { landId, levelPrice }: { landId: string; levelPrice: number }) => {
    const level = PrepareTlmAmountWithPrecision(levelPrice)
    const result = await effects.wax.api.setMinBoost(landId, level)

    if (result) {
      toastMessage(
        'Executing transaction on the chain. This process may take a few seconds to complete..'
      )
      return true
    }

    return false
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Update public minimum boosts failed')
    console.error(error)
    return null
  })
)

export const reloadSyncAiPlanetCandidatesAndCustodians = pipe(async ({ state }: Context) => {
  state.main.syncAi.selectedDacCandidatesCustodians.isInProgress = false
})

export const mapAvatarsToExplorers = async (
  { effects }: Context,
  explorers: PlanetCandidateType[] | PlanetCustodian[]
) => {
  await Promise.all(
    map(explorers, async (explorer) => {
      const playerExplorer: WaxPlayer = await effects.wax.api.getPlayer(explorer.account)
      const playerAvatar: any = playerExplorer?.avatar

      if (playerExplorer?.tag) {
        explorer.givenName = playerExplorer.tag
      }

      // Players without avatars are set to default Male Human avatar
      if (!playerAvatar || playerAvatar === 0) {
        explorer.image = `${config.IpfsApiUrl}/QmWmAY3NELbkjLVk4qWrpBEafaS1wPJFwhsUNgRcurVox4`
        // Players with avatars
      } else if (playerAvatar && playerAvatar !== 0) {
        const eAvatar: IAsset = await effects.atomic.api.getAssetById(playerExplorer.avatar)
        const eAvatarImage: string = getNftImage(eAvatar)

        explorer.image = eAvatarImage
      }
    })
  )
  return explorers
}

export const resetActionProgressState = pipe(({ state }) => {
  state.wax.actionProgressState = null
})
export const resetCandidatesList = pipe(({ state }) => {
  state.wax.selectedDacCandidates = null
})
export const resetCustodiansList = pipe(({ state }) => {
  state.wax.selectedDacCustodians = null
})

export const resetDacCustodianProposals = pipe(({ state }) => {
  state.wax.filterredAndSortedProposals = [...state.wax.dacCustodianProposals]
})

export const filterAndSortProposals = pipe(({ state }: Context) => {
  const { pathname } = router.state.location

  const isSyndicatesPage = isSyndicatesRelatedPage(pathname)

  if (!isSyndicatesPage || !state.wax.triggerFilterAndSortProposals) return null

  const proposalsToFilterAndSort = state.wax.dacCustodianProposals

  if (!proposalsToFilterAndSort || proposalsToFilterAndSort?.length === 0) {
    state.wax.filterredAndSortedProposals = []
    return null
  }

  state.wax.triggerFilterAndSortProposals = false

  let filterredAndSortedProposals = proposalsToFilterAndSort.sort((a, b) => {
    let aValue: string = null
    let bValue: string = null

    let result: any

    switch (state.wax.proposalsFilter.sortBy) {
      case ProposalsSortBy.ID:
        aValue = a.id > b.id ? '1' : '0'
        bValue = a.id < b.id ? '1' : '0'
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.TITLE:
        if (a.isBudgetClaim) {
          aValue = 'Budget'
        } else {
          aValue = find(a.metadata, (c) => c.key === 'title')?.value?.trim()
        }
        if (b.isBudgetClaim) {
          bValue = 'Budget'
        } else {
          bValue = find(b.metadata, (c) => c.key === 'title')?.value?.trim()
        }
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.CREATEDBY:
        aValue = a.proposer
        bValue = b.proposer
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.TO:
        if (a.isBudgetClaim) {
          aValue = a.actions?.[0]?.data?.dac_id
        } else {
          aValue = a.actions?.[0]?.data?.to
        }
        if (b.isBudgetClaim) {
          bValue = b.actions?.[0]?.data?.dac_id
        } else {
          bValue = b.actions?.[0]?.data?.to
        }
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.PROPOSAL:
        aValue = a.proposal_name
        bValue = b.proposal_name
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.ITEM:
        aValue =
          parseFloat(a.actions?.[0]?.data?.quantity?.split('TLM')?.[0] ?? 0) >
          parseFloat(b.actions?.[0]?.data?.quantity?.split('TLM')?.[0] ?? 0)
            ? '1'
            : '0'
        bValue =
          parseFloat(a.actions?.[0]?.data?.quantity?.split('TLM')?.[0] ?? 0) <
          parseFloat(b.actions?.[0]?.data?.quantity?.split('TLM')?.[0] ?? 0)
            ? '1'
            : '0'
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.DATE:
        aValue = a.earliest_exec_time
        bValue = b.earliest_exec_time
        if (!aValue || aValue.length === 0) {
          ;[aValue] = new Date('12-31-1970').toISOString().split('Z')
        }
        if (!bValue || bValue.length === 0) {
          ;[bValue] = new Date('12-31-1970').toISOString().split('Z')
        }
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.VOTES:
        aValue = a.providedApprovals?.length > b.providedApprovals?.length ? '1' : '0'
        bValue = a.providedApprovals?.length < b.providedApprovals?.length ? '1' : '0'
        result = aValue?.localeCompare(bValue)
        break

      case ProposalsSortBy.EXPIRATION:
        aValue = a?.expiration
        bValue = b?.expiration
        result = aValue?.localeCompare(bValue)
        break
      case ProposalsSortBy.STATUS:
        aValue = a.expiration
        bValue = b.expiration
        result = aValue?.localeCompare(bValue)
        break
      default:
        aValue = ''
        bValue = ''
        result = aValue < bValue
        break
    }
    return result
  })

  if (state.wax.proposalsFilter.reversed) {
    filterredAndSortedProposals = filterredAndSortedProposals.reverse()
  }
  state.wax.filterredAndSortedProposals = filterredAndSortedProposals

  return null
})

export const setProposalsFilter = pipe(
  ({ state }: Context, proposalsFilter: ProposalsFilter) => {
    state.wax.filterredAndSortedProposals = null
    state.wax.proposalsFilter = proposalsFilter
    state.wax.triggerFilterAndSortProposals = true
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const setLoreFilter = pipe(
  ({ state }: Context, loreFilter: LoreFilter) => {
    state.wax.filterredAndSortedProposals = null
    state.wax.loreFilter = loreFilter
    state.wax.triggerFilterAndSortLore = true
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const resetCustodiansProposalsList = pipe(({ state }) => {
  state.wax.dacCustodianProposals = []
  state.wax.filterredAndSortedProposals = []
})

export const setSelectedDacId = pipe(({ state }: Context, id: string) => {
  if (!id) return
  state.wax.selectedDacId = id
})

export const getDAOInfo = pipe(
  async ({ state, effects }: Context, dacId?: string) => {
    const dacInfoResponse: DacInfoResponse = await effects.wax.api.getDAOInfo(dacId)

    const unionDacInfoResponse: DacInfoResponse = await effects.wax.api.getDAOInfo(
      unionDAOFinder(dacId)
    )

    const result = get(dacInfoResponse, '[0]', null)
    const unionResult = get(unionDacInfoResponse, '[0]', null)
    state.wax.selectedDacInfo = processElectionGlobals(result)
    state.wax.selectedUnionDacInfo = processElectionGlobals(unionResult)
    state.wax.currentDAOInfo = processElectionGlobals(result)
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load DAO Info failed.')
    console.error(error)
    return null
  })
)

export const signPlanetMemberTerms = pipe(
  ({ state }: Context, dacId: string) => {
    state.main.isSigningDACTerms = true
    state.main.autoExpireSigningDACTerms = 10

    return dacId
  },
  async ({ effects }: Context, dacId: string) => {
    const result = await effects.wax.api.signPlanetMemberTerms({
      dac_id: dacId,
    })

    if (result) {
      toastMessage('Planet Member Terms signed successfully.')
    }
  },
  ({ state }: Context) => {
    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
    }

    state.main.isSigningDACTerms = false
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Signing failed')
    state.main.isSigningDACTerms = false
    state.wax.lastTransactionError = null
    console.error(error)
  })
)

export const registerNewCandidate = pipe(
  async (
    { state, effects, actions }: Context,
    data: {
      candidacyProposal: CandidacyProposalType
      selectedDac: DaoDetailsResponse
      daoGlobals: DaoGlobalsResponse
      daoWalletDetails: DaoWalletDetailsResponse
    }
  ) => {
    await effects.wax.api.tryRegisterNewCandidate(
      data.candidacyProposal,
      data.selectedDac,
      data.daoGlobals,
      data.daoWalletDetails
    )
    actions.wax.setDacCandidacyProposalPayload(null)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`New Candidate registered successfully. Redirecting shortly, please wait...`)

    router.navigate(
      generatePath(PagePath.GovernanceManageCandidacy, { planetId: state.wax.selectedDacId })
    )

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Register new Candidate has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const activateNewCandidate = pipe(
  async ({ state, effects, actions }: Context, candidacyProposal: CandidacyProposalType) => {
    await effects.wax.api.activateNewCandidate(candidacyProposal)
    actions.wax.setDacCandidacyProposalPayload(null)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Candidate activated successfully.`)

    // reload candidates and custodians to update the dacUserStatus

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Activate Candidate has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const withdrawCandidate = pipe(
  async ({ state, effects, actions }: Context, candidacyProposal: CandidacyProposalType) => {
    await effects.wax.api.withdrawCandidate(candidacyProposal)
    actions.wax.setDacCandidacyProposalPayload(null)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Candidate withdrawn successfully. Redirecting shortly, please wait...`)

    // reload candidates and custodians to update the dacUserStatus

    router.navigate(
      generatePath(PagePath.GovernanceBecomeCandidate, { planetId: state.wax.selectedDacId })
    )

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Withdraw Candidate has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const updateCandidate = pipe(
  async ({ state, effects }: Context, candidacyProposal: CandidacyProposalType) => {
    await effects.wax.api.updateCandidate(candidacyProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    toastMessage(
      `Executing transaction on the chain. This process may take a few seconds to complete..`
    )

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Update Candidate has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const setIsSyndicatesSidebarOpen = pipe(({ state }: Context, isOpen: boolean) => {
  state.wax.isSyndicatesSidebarOpen = isOpen
})

export const setSelectedDrawerView = pipe(({ state }: Context, viewIndex: number) => {
  state.wax.selectedDrawerView = viewIndex
})

export const tryCreateNewProposal = pipe(
  async ({ state, effects }: Context, custodianProposal: ProposalSubmission) => {
    await effects.wax.api.createNewCustodianProposal(custodianProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`New Proposal created successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Create new Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)
export const tryChangeDaoConfigs = pipe(
  async ({ state, effects }: Context, daoConfigs: DaoChangeConfigs) => {
    await effects.wax.api.changeDaoConfigs(daoConfigs)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Dao Configs Changed Successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Change configs has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)
export const tryChangeElectionDuration = pipe(
  async ({ state, effects }: Context, electionConfigs: DaoElectionPeriodPayload) => {
    await effects.wax.api.changeElectionDuration(electionConfigs)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Election Config Changed Successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Change configs has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)
export const trySetDtapConfigs = pipe(
  async ({ state, effects }: Context, dConfigs: DaoDTAPPayload) => {
    await effects.wax.api.changeDTAPConfigs(dConfigs)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`DTAP Proposal Created Successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Proposal creation has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryClaimBudget = pipe(
  async ({ state, effects }: Context, claimBudget: ClaimBudgetProposal) => {
    await effects.wax.api.createNewBudgetClaimProposal(claimBudget)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Budget claimed successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Create new Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryCancelProposal = pipe(
  async ({ state, effects }: Context, custodianProposal: ProposalCancel) => {
    await effects.wax.api.cancelCustodianProposal(custodianProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Proposal cancelled successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Cancel Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryCleanProposal = pipe(
  async ({ state, effects }: Context, custodianProposal: ProposalCancel) => {
    await effects.wax.api.cleanCustodianProposal(custodianProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Proposal deleted successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Cancel Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryExecuteProposal = pipe(
  async ({ state, effects }: Context, custodianProposal: ProposalExecutionPayload) => {
    await effects.wax.api.executeCustodianProposal(custodianProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Proposal executed successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Execute Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryApproveProposal = pipe(
  async ({ state, effects }: Context, custodianProposal: ProposalApprovalPayload) => {
    await effects.wax.api.approveCustodianProposal(custodianProposal)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage(`Proposal approved successfully.`)

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Approve Proposal has failed')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const setDacCandidacyProposalPayload = pipe(({ state }, payload: CandidacyProposalType) => {
  state.wax.dacCandidacyProposalPayload = payload
})
export const setDacCustodianProposalPayload = pipe(({ state }, payload: ProposalType) => {
  state.wax.dacCustodianProposalPayload = null
  state.wax.dacCustodianProposalPayload = payload
})

export const tryClaimMiningRewards = pipe(
  async ({ state, effects }: Context) => {
    await effects.wax.api.claimMiningRewards()

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    // TODO
    // toastMessage(`Claimed ${state.wax.claimableMiningRewards} successfully.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 2 }))
    executeAfter(state.main.syncAi.rewardsClaims, DateTime.now().plus({ seconds: 1 }))

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Claim Mining Rewards has failed.')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryClaimLandownerAllowance = pipe(
  async ({ state, effects }: Context) => {
    await effects.wax.api.claimLandownerAllowance()

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    // TODO
    // toastMessage(`Claimed ${state.wax.claimableLandownerAllowance} successfully.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 2 }))
    executeAfter(state.main.syncAi.rewardsClaims, DateTime.now().plus({ seconds: 1 }))

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Claim Landowner Allowance has failed.')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryClaimLandownerCommissions = pipe(
  async ({ state, effects }: Context) => {
    await effects.wax.api.claimLandownerComissions()

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }
    // TODO: fix this
    //toastMessage(`Claimed ${state.wax.claimableLandownerCommissions} successfully.`)

    executeAfter(state.main.syncAi.tlmBalance, DateTime.now().plus({ seconds: 2 }))
    executeAfter(state.main.syncAi.rewardsClaims, DateTime.now().plus({ seconds: 1 }))

    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Claim Landowner Commissions has failed.')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const tryClaimTournamentReward = pipe(
  async ({ state, effects }: Context, compId: number) => {
    await effects.wax.api.claimTournamentReward(compId)

    if (state.wax.lastTransactionError) {
      toastErrorMessage(state.wax.lastTransactionError)
      state.wax.lastTransactionError = null
      return false
    }

    toastMessage('Tournament rewards claimed successfully.')
    return true
  },
  catchError(({ state }: Context, error) => {
    toastErrorMessage(error?.message ?? 'Claim tournament rewards has failed.')
    state.wax.lastTransactionError = null
    console.error(error)
    return false
  })
)

export const setLandId = pipe(({ state }, id: string) => {
  state.wax.managingLandId = id
})
export const setNftLandCardProperties = pipe(({ state }, payload: LooseObject) => {
  state.wax.nftLandCardProperties = payload
})

export const getLandBoostsByDay = pipe(
  async (
    { effects, state }: Context,
    { landId, day, isManagingLand }: { landId: string; day: number; isManagingLand?: boolean }
  ) => {
    const result = await effects.wax.api.getLandBoosts(landId)
    let boosts: LandBoost[] = []

    if (result) {
      // Filter by day
      const filteredBoosts = filter(result, (boost) => boost.day === day)

      if (filteredBoosts.length > 0) {
        const boostByDay = filteredBoosts[0]
        boosts = map(boostByDay.boosts_used, (boost: { booster: string; level: number }) => {
          const { level, ...rest } = boost
          const boostDetails = find(BoostLevels, (l) => l.price === level / 10000)
          return { ...rest, ...boostDetails }
        })
      }
      if (isManagingLand) {
        state.wax.managingLandBoosts = boosts
      }
    }
    return boosts
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load Land Boosts has failed.')
    console.error(error)
    return null
  })
)

export const setManagingLandDetails = pipe(
  async ({ state, effects, actions }: Context) => {
    if (state.wax.managingLandId) {
      const result = await effects.atomic.api.getAssetById(state.wax.managingLandId)

      state.wax.managingLandDetails = result

      actions.wax.syncLandDetailsWithAssets()
    }
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

/**
 * Synchronize atomic.assets with land details.
 * This is to update All assets
 */
export const syncLandDetailsWithInventoryAssets = async ({ state }: Context) => {
  const landDetails = state.wax.managingLandDetails

  if (state.atomic.assets) {
    state.atomic.assets = updateLandRating(state.atomic.assets, landDetails)
  }
}

/**
 * Synchronize filteredAndSortedAssets with land details.
 * This is to update current filtered assets with the latest land rating
 * when the user is on inventory page with Land filter applied.
 * It is needed because filteredAndSortedAssets and assets works separately.
 */
export const syncLandDetailsWithFilteredAsset = async ({ state }: Context) => {
  const landDetails = state.wax.managingLandDetails

  if (state.atomic?.filteredAndSortedAssets) {
    state.atomic.filteredAndSortedAssets = updateLandRating(
      state.atomic.filteredAndSortedAssets,
      landDetails
    )
  }
}

/**
 * Update Land Assets Filter in Switch Land page with the latest land rating
 */
export const syncLandDetailsWithLandAssets = async ({ state }: Context) => {
  const landDetails = state.wax.managingLandDetails

  if (state.atomic?.landAssetsFilter?.filteredLands) {
    const updatedFilteredLands = updateLandRating(
      state.atomic.landAssetsFilter.filteredLands,
      landDetails
    )

    state.atomic.landAssetsFilter = {
      ...state.atomic.landAssetsFilter,
      filteredLands: updatedFilteredLands,
    }
  }
}

export const syncLandDetailsWithAssets = parallel(
  syncLandDetailsWithInventoryAssets,
  syncLandDetailsWithFilteredAsset,
  syncLandDetailsWithLandAssets
)

export const loadManagingLandDetailsAndBoosts = pipe(
  async ({ state, actions }: Context) => {
    state.wax.isLoadingManagingLandBoosts = true
    if (state.wax.managingLandId) {
      await actions.wax.setManagingLandDetails()
      await actions.wax.getLandBoostsByDay({
        landId: state.wax.managingLandId,
        isManagingLand: true,
        day: today25hDay(),
      })
    }

    state.wax.isLoadingManagingLandBoosts = false
  },
  catchError(({ state }: Context, error) => {
    state.wax.isLoadingManagingLandBoosts = false
    console.error(error)
  })
)

/**
 * Loads the avatar image URL given a user walletId and
 * saves it into "store.wax.playersImageMap"
 */
export const cachePlayerProfileImageURL = pipe(
  async ({ state, effects }: Context, playerWalletId: string) => {
    // check on cache first
    const imgMap = state.wax.playersImageMap
    let profileImage = imgMap[playerWalletId]
    if (!profileImage) {
      const player: WaxPlayer = await effects.wax.api.getPlayer(playerWalletId)
      if (player.avatar) {
        const eAvatar: IAsset = await effects.atomic.api.getAssetById(player.avatar)
        profileImage = getNftImage(eAvatar)
        imgMap[playerWalletId] = profileImage
        state.wax.playersImageMap = { ...imgMap }
      }
    }
  },
  catchError((_, error) => {
    console.error(`Error loading profile's image: ${error}`)
  })
)
export const cleanupVotersHistory = ({ state }: Context) => {
  state.wax.custodianVotersResponse = null
}

export const getCandidateVotersHistory = pipe(
  async (
    { state, effects }: Context,
    payload: {
      candidateId: string
      dacId: string
      skip: number
      limit: number
    }
  ) => {
    const { candidateId, dacId, skip, limit } = payload
    const history = await effects.wax.api.getVotingHistory(candidateId, dacId, skip, limit)
    state.wax.custodianVotersResponse = history
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const loadManagingLandDetailsAndBoostsWithDelay = pipe(
  wait(6000),
  loadManagingLandDetailsAndBoosts
)
