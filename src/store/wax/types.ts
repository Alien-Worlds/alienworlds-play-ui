import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import { DaoDetailsResponse } from 'graphql/types'
import { DateTime } from 'luxon'

export type LoreVotersType = {
  last_claim_time: string
  staked_amount: string
  vote_power: number
  voter: string
}
export type LoreGlobals = {
  duration: number
  fee: string
  quorum_percent_x100: number
  pass_percent_x100: number
  next_proposal_id: number
  total_staked: string
  total_unstaking: string
  total_vote_power: number
  power_per_day: number
  last_update: DateTime
}

export type WaxQuery = {
  code: string
  scope: string
  table: string
  limit?: number
  json?: boolean
  reverse?: boolean
  show_payer?: boolean
  key_type?: string
  lower_bound?: string
  upper_bound?: string
  index_position?: number
}

export type WaxRequest = {
  account: string
  name: string
  data: any
  authorization: {
    actor: string
    permission: string
  }[]
}[]

export type WaxResult = {
  rows: any[]
  more: boolean
  next_key: string
  ram_payers?: any
}

export type Planet = WaxPlanet &
  WaxPlanetDetails & {
    stakeInfo: PlanetStakeInfo
    currency_balance: string
    metadata_parsed: PlanetMetadata
    lands_map: WaxPlanetMap[]
  }

export type PersistedWallet = {
  userAccount: string
  pubKeys: string[]
  accountStatus?: string
}

export type PlanetMetadata = {
  img: string
  description: string
  map: string
}

export type PlanetStakeInfo = {
  precision: number
  dac_symbol: string
  staked: number
}

export type WaxPlanet = {
  active: boolean
  dac_symbol: string
  last_claim: Date
  metadata: string
  nft_multiplier: number
  planet_name: string
  title: string
  total_stake: string
}

export type WaxPlanetDetails = {
  bucket_total: string
  fill_rate: string
  last_fill_time: string
  mine_bucket: string
}

export type WaxPlanetMap = {
  x: number
  y: number
  asset_id: string
}

export type WaxTerms = {
  account: string
  terms_hash: string
  terms_id: number
}

export type WaxPlayer = {
  account: string
  avatar: string
  tag: string
}

export type WaxMiner = {
  current_land: string
  last_mine: string
  last_mine_tx: string
  miner: string
}

export type WaxBag = {
  account: string
  items: string[]
  locked: number
}

export type WaxLand = {
  id: string
  owner: string
}

export type WaxShine = {
  active: boolean
  cost: string
  from: number
  qty: number
  start_time: Date
  to: number
}

export type WaxResources = {
  usedCPU: number
  usedNET: number
  usedRAM: number
  stakedCPU: number
  stakedNET: number
  stakedRAM: number
  availableCPU: number
  availableNET: number
  totalCPU: number
  totalNET: number
  totalRAM: number
  currentTotalCPU: number
  currentTotalNET: number
  percCPU: number
  percNET: number
  percRAM: number
}

export type ShineData = {
  inputData: NFTCardTypes
  outputData: NFTCardTypes
  info: WaxShine
}

export type WaxRefundInProgress = {
  account: string
  id: number
  planet_name: string
  quantity: string
  refund_time: Date
}

export type OnboardingData = {
  avatarId: number
  tagId: string
  landId: string
}

export type WaxUserPoints = {
  user: string
  total_points: number
  redeemable_points: number
  daily_points: number
  weekly_points: number
  top_level_claimed: number
  last_action_timestamp: string
  milestones: Array<any>
}

export type WaxPointsOffer = {
  id: number
  level: number
  template_id: number
  required: number
  start: string
  end: string
}

export type WaxPointsOfferWithTemplate = WaxPointsOffer & {
  asset: IAsset
}

export type PremintOffer = {
  offer_id: number
  creator: string
  required: number
  template_id: number
  collection_name: string
  message: string
  callback?: string
  available_count: number
  next_asset_id: number
}

export type PremintOfferWithTemplate = PremintOffer & {
  asset: IAsset
}

export type WaxLevelOffer = {
  id: number
  level: number
  template_id: number
  required: number
}

export type WaxLevelOfferWithTemplate = WaxLevelOffer & {
  asset: IAsset
}

export type MemberTermsData = {
  terms: string
  version: number
}

export type MemberTermsDataSigned = {
  agreedtermsversion: number
  sender: string
}

/**
 * @param agreedterms - old implementation expected hash, just pass "NA" now
 * @param sender - user wallet id
 * @param dac_id - id of the target DAC
 */
export type MemberTermsSignRequest = {
  agreedterms: string
  sender: string
  dac_id: string
}

export type PlanetDAC = Planet & {
  dac_id: string
  owner?: string
  lockupAsset?: string
  symbol: {
    contract: string
    sym: string
  }
  refs: {
    [key: string]: string
  }
}

export type PlanetCandidateType = {
  account: string
  requestedpay: string
  locked_tokens: string
  isActive: number
  totalVotes: number
  voteDecay: number
  votePower: number
  description: string
  familyName: string
  givenName: string
  image: string
  agreedTermVersion: number
  hasSignedCurrentDaoTerms: boolean
  isSelected: boolean
  isVoted: boolean
  isVoteAdded: boolean
  isSignedVoteRemoved: boolean
  isFlagged: { name: string; body: string }
  planetName: string
  rankIndex: number
  rank: number
  score?: number
}

export type PlanetCustodian = Omit<PlanetCandidateType, 'candidate_name'>
export type PlanetDACInfo = {
  dacTreasury: { balance: string }
  dacGlobals: { key: string; value: [string, string | number | any] }[]
  dacStats: { issuer: string; maxSupply: string; supply: string; transferLocked: boolean }
  custodianBudget: number
  nextPeriodTime: number
  lastElectionTime: number
  totalActiveCandidates: number
  totalBudgetPercentage: number
  totalVotePower: number
  totalVotesCandidates: number
  lockupAsset: string
  dacId: string
}

export type PlanetBalanceType = {
  planet: string
  tokens: string
  staked: string
  unstakes: PlanetBalanceUnstakes
}

export type PlanetBalanceUnstakes = {
  stake: string
  releaseTime: string
}

export enum RequestState {
  InProgress = 0,
  Succeeded = 1,
  Failed = 2,
}

export enum DACUserStatusType {
  EXPLORER = 'Explorer',
  MEMBER = 'Member',
  CANDIDATE = 'Candidate',
  CUSTODIAN = 'Custodian',
  NONE = 'None',
}

export type TryUnstakeProps = {
  dac: DaoDetailsResponse
  amount: number
}

export type ActionType = {
  account: string
  name: string
  authorization: any
  data: any
}

export type UnstakeType = {
  account: string
  key: number
  releaseTime: string
  stake: string
}

export type VotersHistoryItem = {
  voter: string
  votingPower: string
  action: string
  candidate: string
  voteTimestamp: string
  transactionId: string
}

export type VotersHistoryResponse = {
  results: Array<VotersHistoryItem>
  total: number
}

export type WaxResponse<T> = {
  more: boolean
  next_key: string
  rows: Array<T>
}
export type OutpostNFTPointsClaim = {
  templateId: string
  points10x: string
  points: string
  templateName: string
  cardId: string
  schemaName: string
  rarity: string
}

type Symbol = {
  contract: string
  code: string
  precision: number
}

type Refs = {
  '12': string
  logoUrl: string
  description: string
}

type Accounts = {
  auth: string
  treasury: string
  custodian: string
  msigOwned: string
  proposals: string
  escrow: string
  voteWeight: string
  activation: string
  referendum: string
  spendings: string
}

type DacTreasury = {
  balance: string
}

type DacStats = {
  supply: string
  maxSupply: string
  issuer: string
  transferLocked: boolean
}

type ElectionGlobals = {
  authThresholdHigh: number
  authThresholdLow: number
  authThresholdMid: number
  budgetPercentage: number
  initialVoteQuorumPercent: number
  lastClaimBudgetTime: string
  lastPeriodTime: string
  lockupReleaseTimeDelay: number
  lockupAsset: {
    quantity: string
    contract: string
  }
  maxVotes: number
  metInitialVotesThreshold: number
  numberActiveCandidates: number
  numElected: number
  periodLength: number
  requestedPayMax: {
    quantity: string
    contract: string
  }
  shouldPayViaServiceProvider: number
  tokenSupplyTheshold: number
  totalVotesOnCandidates: string
  totalWeightOfVotes: string
  voteQuorumPercent: number
}

export type DacInfo = {
  dacId: string
  owner: string
  title: string
  isDacActive: boolean
  symbol: Symbol
  refs: Refs
  accounts: Accounts
  dacTreasury: DacTreasury
  dacStats: DacStats
  electionGlobals: ElectionGlobals
}

export type DacInfoResponse = {
  results: DacInfo[]
  count: number
}

export interface ExtraConfig {
  key: string // Key for the extra configuration setting, e.g., 'allow_late_registration'
  value: [string] // Tuple containing the type and value of the configuration, e.g., ['bool', 1]
}
