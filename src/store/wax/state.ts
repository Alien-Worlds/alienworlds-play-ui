import {
  CandidacyProposalType,
  CustodianProposal,
  ProposalsSortBy,
  ProposalType,
} from 'features/syndicates/types/governanceTypes'
import { Candidate } from 'graphql/types'
import { DateTime } from 'luxon'
import { derived } from 'overmind'
import { config } from 'shared/util/config'
import {
  Planet,
  WaxResources,
  WaxPlayer,
  WaxTerms,
  WaxRefundInProgress,
  WhitelistStatus,
  OnboardingData,
  PlanetCandidateType,
  PlanetDACInfo,
  RequestState,
  PlanetCustodian,
  LoreVotersType,
  LoreGlobals,
} from 'store/wax/types'

import { VotersHistoryResponse } from './types'

export type ProposalsFilter = {
  sortBy: ProposalsSortBy
  reversed: boolean
}

type WaxState = {
  isLoggedIn: boolean
  /**
   * Identifies if the user is currently authenticating
   * null = not started
   * true = in progress
   * false = finished
   */
  isAuthenticating: boolean | null
  isValidated: boolean
  walletId: string
  isDemoUser: boolean
  player: WaxPlayer
  playersImageMap: { [walletId: string]: string }
  isSettingTag: boolean
  currentTag: string
  isOnboardingPending: boolean
  showOnboardingRetry: boolean
  onboarding: OnboardingData

  resources: WaxResources
  terms: WaxTerms
  termsAccepted: boolean
  isStaking: boolean
  refundsInProgress: WaxRefundInProgress[]
  lastTransactionError: string

  // #region Landowner
  // #endregion

  selectedPlanet: Planet
  selectedDacId: string
  selectedDacInfo: PlanetDACInfo
  selectedUnionDacInfo: PlanetDACInfo
  selectedDacCandidates: PlanetCandidateType[]
  selectedDacCustodians: PlanetCustodian[]
  selectedDacCandidateWalletId: string | null
  isUserWhiteListed: boolean
  userWhitelistStatus: WhitelistStatus | null
  maxStakeTime: number

  actionProgressState: RequestState
  userStakedDAOTokens: number
  isSyndicatesSidebarOpen: boolean
  isStakesOnRelease: boolean
  votedCandidatesList: Candidate[]
  custodianVotersResponse: VotersHistoryResponse | null
  dacCandidacyProposalPayload: CandidacyProposalType | null
  generatedCandidancyProposal: CandidacyProposalType | null
  stakeReleaseTime: Date | null
  stakeReleaseTimeInDays: number | null
  dacCustodianProposals: CustodianProposal[]

  dacCustodianProposalPayload: ProposalType

  filterredAndSortedProposals: CustodianProposal[]

  proposalsFilter: ProposalsFilter
  triggerFilterAndSortProposals: boolean
  currentDAOInfo: PlanetDACInfo

  totalDAOsStakes: number
  selectedDrawerView: number

  loreVoterInfo: LoreVotersType
  loreGlobals: LoreGlobals
}

export const defaultState: WaxState = {
  isLoggedIn: derived((state: WaxState) => state.walletId !== null),
  isAuthenticating: null,
  isUserWhiteListed: false,
  userWhitelistStatus: null,
  isValidated: false,
  walletId: null,
  isDemoUser: derived((state: WaxState) => state.walletId === config.DemoUserWaxAccount),
  userStakedDAOTokens: 0,
  totalDAOsStakes: 0,
  player: null,
  playersImageMap: {},
  isSettingTag: false,
  currentTag: null,
  actionProgressState: null,
  maxStakeTime: 1,
  stakeReleaseTime: null,
  isStakesOnRelease: false,
  isSyndicatesSidebarOpen: true,

  dacCustodianProposalPayload: null,
  selectedUnionDacInfo: null,
  currentDAOInfo: null,
  selectedDacCandidates: null,
  votedCandidatesList: [],
  custodianVotersResponse: null,
  selectedDacCustodians: [],
  stakeReleaseTimeInDays: derived((state: WaxState) => {
    const { stakeReleaseTime } = state
    const msInDay = 24 * 60 * 60 * 1000
    if (stakeReleaseTime) {
      const daysDifference = new Date(stakeReleaseTime).getTime() - new Date().getTime()
      return Math.ceil(daysDifference / msInDay)
    }
    return null
  }),
  selectedDacInfo: null,
  selectedPlanet: null,

  selectedDacId: 'naron',

  /**
   * Current user's balance of DAC token
   */
  /**
   * We need to pass the treasury account when converting to dac tokens
   * Current API does not return it for DAC objects, so we match it manually
   *
   * @TODO get this data from API so we can drop the hardcoded list
   */
  selectedDacCandidateWalletId: null,
  isOnboardingPending: false,
  showOnboardingRetry: false,
  onboarding: null,

  resources: null,
  terms: null,
  termsAccepted: derived(
    (state: WaxState) => state.terms !== null && state.terms.terms_id !== null
  ),

  isStaking: false,
  refundsInProgress: null,
  lastTransactionError: null,

  dacCandidacyProposalPayload: null,
  generatedCandidancyProposal: null,

  dacCustodianProposals: [],
  filterredAndSortedProposals: [],

  proposalsFilter: {
    sortBy: null,
    reversed: true,
  },
  triggerFilterAndSortProposals: false,

  // #region Landowner
  // #endregion
  selectedDrawerView: null,

  loreVoterInfo: {
    last_claim_time: '',
    staked_amount: '',
    vote_power: 0,
    voter: '',
  },
  loreGlobals: {
    duration: 0,
    fee: '',
    quorum_percent_x100: 0,
    pass_percent_x100: 0,
    next_proposal_id: 0,
    total_staked: '',
    total_unstaking: '',
    total_vote_power: 0,
    power_per_day: 0,
    last_update: DateTime.now(),
  },
}

export const state: WaxState = {
  ...defaultState,
}
