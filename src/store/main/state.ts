import SessionKit, { Session } from '@wharfkit/session'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { ErrorTypes } from 'features/syndicates/types/governanceTypes'
import { DateTime, Duration } from 'luxon'
import { derived } from 'overmind'
import { getDefaultSyncAi } from 'store/main/helpers'
import { PullRequest } from 'store/main/types'

export type SyncInfo = {
  isInProgress: boolean
  executeAfter: DateTime
}

export type SyncAI = {
  bag: SyncInfo
  land: SyncInfo
  avatar: SyncInfo
  assets: SyncInfo
  planets: SyncInfo
  tlmBalance: SyncInfo
  resources: SyncInfo
  terms: SyncInfo
  refunds: SyncInfo
  recentMissions: SyncInfo
  explorer: SyncInfo
  missionNfts: SyncInfo
  bscBalance: SyncInfo
  selectedDacCandidatesCustodians: SyncInfo
  rewardsClaims: SyncInfo
  accountStatus: SyncInfo
}

type MainState = {
  isFocusedWindow: boolean
  syncAi: SyncAI
  initializingLayout: boolean
  loginRedirectTo: string
  avatar: IAsset
  mineDelay: Duration
  miningRandomString: string
  lastMiningTransactionId: string
  bountyNotificationInProgress: boolean
  isMining: boolean
  isClaiming: boolean
  isWorkInProgress: boolean
  miningGameState: MiningGameState
  runtimeInSeconds: number
  isSigningDACTerms: boolean
  autoExpireSigningDACTerms: number
  signingDACTermsState: SigningDACTermsState
  modalErrorState: ErrorTypes
  shiningUrl: string
  isCompactSidebar: boolean
  isVotingDACCandidates: boolean
  autoExpireVoteDACCandidates: number
  lastMineBounty: string
  lastMineCountdown: string
  isOutPostModalsActive: boolean
  sessionKit: SessionKit
  currentSession: Session
  currentWallet: string
  isWaxLoggedIn: boolean
  isSwitchingWallets: boolean
  lorePullRequests: Array<PullRequest>
  loreReadMe: string
  loreDescription: string
}

export enum MiningGameState {
  Unknown = 0,
  MineDelay = 1,
  ReadyToMine = 2,
  Mining = 3,
  ReadyToClaim = 4,
  Claiming = 5,
  WorkInProgress = 6,
}

export enum SigningDACTermsState {
  Unknown,
  Signing,
}

export const defaultState: MainState = {
  isFocusedWindow: true,
  loreReadMe: null,
  loreDescription: null,
  syncAi: getDefaultSyncAi(),
  initializingLayout: false,
  loginRedirectTo: null,
  avatar: null,
  mineDelay: null,
  miningRandomString: null,
  lastMiningTransactionId: null,
  bountyNotificationInProgress: false,
  isMining: false,
  isClaiming: false,
  isWorkInProgress: false,
  modalErrorState: null,
  shiningUrl: null,
  miningGameState: derived((state: MainState) => {
    if (state.isClaiming) return MiningGameState.Claiming

    if (state.isWorkInProgress) return MiningGameState.WorkInProgress

    if (!state.mineDelay) return MiningGameState.Unknown

    if (state.mineDelay.toMillis() > 0) return MiningGameState.MineDelay

    if (state.isMining) return MiningGameState.Mining

    if (state.mineDelay.toMillis() === 0) {
      if (!state.miningRandomString) return MiningGameState.ReadyToMine

      return MiningGameState.ReadyToClaim
    }

    return MiningGameState.Unknown
  }),
  runtimeInSeconds: 0,
  isSigningDACTerms: false,
  autoExpireSigningDACTerms: null,
  signingDACTermsState: derived((state: MainState) => {
    if (state.isSigningDACTerms) return SigningDACTermsState.Signing
    return SigningDACTermsState.Unknown
  }),
  isCompactSidebar: false,
  isVotingDACCandidates: false,
  autoExpireVoteDACCandidates: null,
  lastMineBounty: null,
  lastMineCountdown: null,
  isOutPostModalsActive: false,
  sessionKit: null,
  currentSession: null,
  currentWallet: null,
  isWaxLoggedIn: false,
  isSwitchingWallets: false,
  lorePullRequests: [],
}

export const state: MainState = {
  ...defaultState,
}
