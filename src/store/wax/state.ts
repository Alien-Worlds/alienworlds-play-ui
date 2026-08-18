import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LooseObject } from 'features/inventory/utils/NFTCardHelper'
import { LoreSortBy } from 'features/lore/types/loreTypes'
import { LandBoost, LandSlot, SlotVariant } from 'features/mining/types/LandownerTypes'
import {
  CandidacyProposalType,
  CustodianProposal,
  ProposalsSortBy,
  ProposalType,
} from 'features/syndicates/types/governanceTypes'
import { Candidate } from 'graphql/types'
import { forEach } from 'lodash'
import { DateTime } from 'luxon'
import { derived } from 'overmind'
import { config } from 'shared/util/config'
import {
  Planet,
  WaxResources,
  WaxBag,
  WaxMiner,
  WaxPlayer,
  WaxTerms,
  WaxRefundInProgress,
  OnboardingData,
  PlanetCandidateType,
  PlanetDACInfo,
  RequestState,
  PlanetCustodian,
  LoreVotersType,
  LoreGlobals,
} from 'store/wax/types'

import { VotersHistoryResponse } from './types'
import { Constants } from '../../shared/util/constants'

export type ProposalsFilter = {
  sortBy: ProposalsSortBy
  reversed: boolean
}
export type LoreFilter = {
  sortBy: LoreSortBy
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
  selectedPlanetName: string
  planetSelectedForMining: string
  whereToMineIntent: string
  whereToMine: string
  planetLandsAssets: { [planetId: string]: IAsset[] }
  bag: WaxBag
  miner: WaxMiner
  isOnboarded: boolean
  isOnboardingPending: boolean
  showOnboardingRetry: boolean
  onboarding: OnboardingData

  resources: WaxResources
  terms: WaxTerms
  termsAccepted: boolean
  isStaking: boolean
  refundsInProgress: WaxRefundInProgress[]
  lastTransactionError: string
  isShining: boolean

  // #region Landowner
  managingLandId: string
  managingLandDetails: IAsset | null
  nftLandCardProperties: LooseObject
  managingLandBoosts: LandBoost[] | []
  managingLandBoostFullSlots: LandSlot[] | []
  isLoadingManagingLandBoosts: boolean
  // #endregion

  selectedPlanet: Planet
  selectedDacId: string
  selectedDacInfo: PlanetDACInfo
  selectedUnionDacInfo: PlanetDACInfo
  selectedDacCandidates: PlanetCandidateType[]
  selectedDacCustodians: PlanetCustodian[]
  selectedDacCandidateWalletId: string | null
  isUserWhiteListed: boolean
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
  loreFilter: LoreFilter
  triggerFilterAndSortProposals: boolean
  triggerFilterAndSortLore: boolean
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
  planetSelectedForMining: 'naron',
  whereToMineIntent: null,
  planetLandsAssets: {},
  maxStakeTime: 1,
  stakeReleaseTime: null,
  isStakesOnRelease: false,
  isSyndicatesSidebarOpen: true,

  dacCustodianProposalPayload: null,
  nftLandCardProperties: null,
  triggerFilterAndSortLore: true,
  selectedUnionDacInfo: null,
  currentDAOInfo: null,
  whereToMine: derived((state: WaxState) => {
    return state.whereToMineIntent !== null
      ? state.whereToMineIntent
      : state.planetSelectedForMining
  }),
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
  bag: undefined,
  miner: null,
  isOnboarded: derived((state: WaxState) => state.isLoggedIn && state.miner !== null),
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
  isShining: false,

  dacCandidacyProposalPayload: null,
  generatedCandidancyProposal: null,

  dacCustodianProposals: [],
  filterredAndSortedProposals: [],

  proposalsFilter: {
    sortBy: null,
    reversed: true,
  },
  loreFilter: {
    sortBy: null,
    reversed: true,
  },
  triggerFilterAndSortProposals: false,

  // #region Landowner
  managingLandId: null,
  managingLandDetails: null,
  managingLandBoosts: [],
  managingLandBoostFullSlots: derived((state: WaxState) => {
    const totalSlots = 15
    const { managingLandBoosts, managingLandDetails } = state

    if (!managingLandDetails) return []

    const openSlots = managingLandDetails?.data?.openslots ?? Constants.DEFAULT_LAND_OPENSLOTS
    const landSlots = []

    // Used slots
    forEach(managingLandBoosts, (boost: LandBoost, index: number) => {
      landSlots.push({
        mod: SlotVariant.USED,
        number: index + 1,
        name: boost.name,
        origin: boost.booster,
        percentage: boost.percentage,
      })
    })

    // Add slots - unlocked slot to be added
    const addSlotsLength =
      openSlots - managingLandBoosts.length > 0 ? openSlots - managingLandBoosts.length : 0
    forEach(Array(addSlotsLength), () => {
      landSlots.push({ mod: SlotVariant.ADD, number: landSlots.length + 1 })
    })

    // Add 1 Locked slot - to be unlocked
    if (landSlots.length < totalSlots) {
      landSlots.push({ mod: SlotVariant.LOCKED, number: landSlots.length + 1 })
    }

    const emptySlotsTotal = totalSlots - landSlots.length
    forEach(Array(emptySlotsTotal), () => {
      landSlots.push({ mod: SlotVariant.EMPTY, number: landSlots.length + 1 })
    })

    return landSlots
  }),
  isLoadingManagingLandBoosts: false,
  // #endregion
  selectedDrawerView: null,

  selectedPlanetName: '',
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
