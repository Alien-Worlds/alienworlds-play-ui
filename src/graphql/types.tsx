// walletID API

export type WalletDetailsResponse = {
  mining_claim: {
    amount: string
    last_claim_time: string
  }
  land_comms: {
    amount: string
    last_claim_time: string
  }
  land_ratings_payout: string
  mining_details: {
    last_mine: string
    last_mine_tx: string
    current_land: string
  }
  wallet: string
  tlm_balance: string
  stake_tlm_deposit: string | null
  tag: string
  avatar_id: string
  terms: {
    terms_id: number
    terms_hash: string
  }
  mining_bag: number[]
  userpoints_details: {
    milestones: any[] // You may replace `any[]` with a more specific type if needed
    last_action_time: string
    top_level: number
    weekly_points: number
    daily_points: number
    redeemable_points: number
    total_points: number
  }
  last_shine: string
  land_ratings_deposit: string | null
  tokenized_lore: {
    vote_power: string
    last_claim: string
    staked_amount: string
    tlm_pool_size: string
    percent_of_pool: string
    pending_rewards: string
  }
}

// DAO Detail Types

export interface DaoDetailsResponse {
  title: string
  dac_id: string
  symbol: DaoSymbol
  owner: string
  dac_state: string
  refs: DaoRefs
  candidates: Candidates
  custodians: Custodians
  member_terms: MemberTerms
  min_stake_time: string
  max_stake_time: string
  tlm_balances: TlmBalance[]
  supply: string
  max_supply: string
  time_multiplier: string
}

export interface DaoSymbol {
  sym: string
  contract: string
}

export interface DaoRefs {
  planet_image: string
  description: string
  map_image: string
}

export interface Candidates {
  total_count: number
  candidates: Candidate[]
}

export interface Candidate {
  candidate_name: string
  rank: number
  total_vote_power: number
  is_active: boolean
  number_voters: number
  avg_vote_time_stamp: string
  running_weight_time: string
  profile: Profile
  member_terms_version: number
  isSelected: boolean
  isVoted: boolean
  isVoteAdded: boolean
  isSignedVoteRemoved: boolean
  flagged: boolean
  voteDecay: number
  rankIndex: number
  hasSignedCurrentDaoTerms: boolean
}

export interface Custodians {
  total_count: number
  custodians: Custodian[]
}

export interface Custodian {
  cust_name: string
  rank: number
  total_vote_power: number
  number_voters: number
  avg_vote_time_stamp: string
  profile: Profile
}

export interface Profile {
  description: string
  email: string | null
  familyName: string | null
  gender: string | null
  givenName: string | null
  image: string
  timezone: string | null
  url: string | null
}

export interface MemberTerms {
  version: number
  terms: string
}

export interface TlmBalance {
  account: string
  use: string
  balance: string
}

// dao stakes

type DaoWeights = {
  eyeke: string
  kavian: string
  nerix: string
  naron: string
  magor: string
  veles: string
  eyekeunn: string
  kavianunn: string
  magorunn: string
  naronunn: string
  neriunn: string
  velesunn: string
}

export type DaoStakesResponse = {
  daoWeights: DaoWeights
  unionTotal: string
  syndicateTotal: string
  grandTotal: string
}

// dao treasury response

interface Balance {
  account: string
  use: string
  balance: string
}

export interface DaoTreasuryResponse {
  dac_id: string
  balances: Balance[]
  totals: string
}

// dao globals
export type DaoGlobalsResponse = {
  auth_threshold_high: number
  auth_threshold_low: number
  auth_threshold_mid: number
  budget_percentage: number
  initial_vote_quorum_percent: number
  lastclaimbudgettime: string // ISO date string
  lastperiodtime: string // ISO date string
  lockup_release_time_delay: number
  maxvotes: number
  met_initial_votes_threshold: boolean
  number_active_candidates: number
  numelected: number
  periodlength: number
  should_pay_via_service_provider: boolean
  token_supply_theshold: number
  vote_quorum_percent: number
  lockupasset: {
    quantity: string
    contract: string
  }
  requested_pay_max: {
    quantity: string
    contract: string
  }
}
export type UnstakesType = {
  account: string
  stake: string
  release_time: string
  key: number
}

// wallet Dao Response
interface StakeDetails {
  dao_token_balance: string
  staked_amount: string
  unstake_total: string
  available_tlm_in_dao: string
  staked_delay: number
  unstakes: UnstakesType[] // If the structure of unstake items is known, replace 'any' with the specific type
}

interface Votes {
  candidates: string[]
  timestamp: string
  voteCount: number
}

interface VoteWeight {
  weight: number
  quorum: number
}

export interface DaoWalletDetailsResponse {
  dac_id: string
  wallet: string
  agreed_terms_version: number
  stake_details: StakeDetails
  votes: Votes
  vote_weight: VoteWeight
  user_status: string
}

// MSIGS

export interface MsigsResponse {
  id: string
  proposal_name: string
  proposer: string
  packed_transaction: string
  unpacked: UnpackedTransaction
  earliest_exec_time: string
  modified_date: string
  state: string
  metadata: Metadata[]
  requested_approvals: Approval[]
  provided_approvals: Approval[]
}

export interface UnpackedTransaction {
  expiration: string
  ref_block_num: number
  ref_block_prefix: number
  max_net_usage_words: number
  max_cpu_usage_ms: number
  delay_sec: number
  context_free_actions: any[]
  transaction_extensions: any[]
  actions: Action[]
}

interface Action {
  account: string
  name: string
  authorization: Authorization[]
  data: TransferData
}

interface Authorization {
  actor: string
  permission: string
}

interface TransferData {
  from: string
  to: string
  quantity: string
  memo: string
}

interface Metadata {
  key: string
  value: string
}

export interface Approval {
  actor: string
  time: string | null
}

// user dao balances

type PlanetStakeData = {
  stake_details: StakeDetails
}

export type UserBalancesResponse = Record<string, PlanetStakeData>

// lore proposals

type Attribute = {
  key: string
  value: ['string' | 'uint16', string | number]
}

export type LoreProposal = {
  proposal_id: number
  proposer: string
  type: 'lore'
  status: 'complete' | 'expired' | 'quorum.unmet'
  title: string
  total_yes_votes: string
  total_no_votes: string
  submitted: string
  number_yes_votes: number
  number_no_votes: number
  expires: string
  earliest_exec: string
  attributes: Attribute[]
}
type LoreGlobals = {
  duration: number // duration in seconds
  fee: string // fee in the format 'amount TLM'
  quorum_percent_x100: number // quorum percentage, multiplied by 100
  pass_percent_x100: number // pass percentage, multiplied by 100
  total_staked: string // total staked amount in the format 'amount TLM'
  total_unstaking: string // total unstaking amount in the format 'amount TLM'
  total_vote_power: string // total vote power in the format 'amount VP'
  power_per_day: string // power per day in the format 'amount VP'
  last_update: string // timestamp of the last update in ISO string format
  template_id: string // template ID (string format)
}

export type loresResponse = {
  proposals: LoreProposal[]
  globals: LoreGlobals
}

// planet details
export type PlanetDetailsResponse = {
  id: string
  dac_id: string
  stake_info: null
  currency_balance: string
  land_maps: {
    x: number
    y: number
    asset_id: string
  }[]
  planet_details: {
    active: boolean
    dac_symbol: string
    last_claim: string
    metadata: {
      planet_image: string
      description: string
      map_image: string
    }
    nft_multiplier: number
    planet_name: string
    title: string
    total_stake: string
  }
  planet_mining_details: {
    bucket_total: string
    fill_rate: string
    last_fill_time: string
    mine_bucket: string
  }
  mining_pools: {
    rarity: string
    rate: number
    bucket_total: string
  }[]
  land_commission_override: {
    min_commission: number
    max_commission: number
  }
}

export type PlanetsResponse = Record<string, PlanetDetailsResponse>
