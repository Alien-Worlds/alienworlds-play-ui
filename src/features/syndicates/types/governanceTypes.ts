import { Approval, UnpackedTransaction } from 'graphql/types'

export enum VoteButtonStates {
  NOVOTE = 0,
  VOTEADDED = 1,
  REMOVEVOTE = 2,
  VOTESIGNED = 3,
  SIGNVOTE = 4,
  REFRESHVOTES = 5,
}

export enum ErrorTypes {
  CANDIDATE_CANNOT_UNSTAKE = 'CANDIDATE_CANNOT_UNSTAKE',
}
export type VoteButtonTypes = {
  voteStatus: VoteButtonStates
  onClick?: () => void
  postfix?: number
  isDisabled?: boolean
}
export type ProposalStatusButton = {
  proposalStatus: string
  onClick?: () => void
  isCancel?: boolean
}

export type CandidacyProposalType = {
  hash: string
  reqpay: string
  wallet: string
  dacName: string
  candidate: string
  isCandidateActive: boolean
}
export enum ProposalStatus {
  APPROVABLE = 'APPROVABLE',
  EXECUTED = 'EXECUTED',
  CANCELED = 'CANCELLED',
  PENDING = 'PENDING',
  VOTED = 'VOTED',
  EXECUTE = 'EXECUTE',
  EXPIRED = 'EXPIRED',
  CREATED = 'CREATED',
}
export interface ProposalAction {
  account: string
  name: string
  authorization: Array<ProposalPermissionLevel>
  data: string
}
export interface ProposalActionApproval {
  level: ProposalPermissionLevel
  time: string
}
export interface ProposalActionApprovalsInfo {
  proposal_name: string
  requested_approvals: Array<ProposalActionApproval>
  provided_approvals: Array<ProposalActionApproval>
}
export interface ProposalApproval {
  proposal_name: string
  level: ProposalPermissionLevel
  dac_id: string
  proposal_hash: string | null
}
export interface ProposalCancel {
  proposal_name: string
  canceler: string
  dac_id: string
}
export interface ProposalExec {
  proposal_name: string
  executer: string
  dac_id: string
}
export interface ProposalExtension {
  type: number
  data: string
}
export interface ProposalPairStringString {
  key: string
  value: string
}
export interface ProposalPermissionLevel {
  actor: string
  permission: string
}
export interface ClaimBudgetProposal {
  proposer: string
  proposal_name: string
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  expirationDays: number
}
export interface BasicProposal {
  proposer: string
  proposal_name: string
  requested: Array<ProposalPermissionLevel>
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  trx: ProposalTransaction
}
export interface ProposalApprovals {
  time: string
  level: ProposalPermissionLevel
}
export interface CustodianProposal extends BasicProposal {
  id: number
  state: number
  isBudgetClaim?: boolean
  expiration?: string
  status?: string
  earliest_exec_time?: string
  actions: Array<EosioAction>
  providedApprovals?: Array<ProposalApprovals>
}

export interface ProposalSubmission {
  dac_id: string
  proposer: string
  tx_actions: Array<EosioAction>
  proposal_to: string
  proposal_name: string
  proposal_memo: string
  expirationDays: number
  proposal_quantity: string
  metadata: Array<{ key: string; value: string }>
}
export interface DaoChangeConfigs {
  dac_id: string
  auththreshold: number
  numelected: number
  maxvotes: number
  proposalName: string
  proposalTitle: string
  proposalDescription: string
  proposer: string
}
export interface DaoDTAPPayload {
  claim_rate_perc_x100: number
  destination: string
  planet_name: string
  proposer: string
  proposalTitle: string
  proposalDescription: string
  proposalName: string
  dac_id: string
}
export interface DaoElectionPeriodPayload {
  electionDuration: number
  proposer: string
  proposalTitle: string
  proposalDescription: string
  proposalName: string
  dac_id: string
}
export interface ProposalApprovalPayload {
  dac_id: string
  approver: string
  proposal_name: string
}
export interface ProposalExecutionPayload {
  dac_id: string
  executer: string
  proposal_name: string
}
interface ProposalTransaction extends ProposalTransactionHeader {
  context_free_actions: Array<ProposalAction>
  actions: Array<ProposalAction>
  transaction_extensions: Array<ProposalExtension>
}
interface ProposalTransactionHeader {
  expiration: String
  ref_block_num: number
  ref_block_prefix: number
  max_net_usage_words: string
  max_cpu_usage_ms: number
  delay_sec: string
}

export enum ProposalsSortBy {
  ID,
  TITLE,
  CREATEDBY,
  TO,
  PROPOSAL,
  ITEM,
  DATE,
  VOTES,
  ACTION,
  EXPIRATION,
  STATUS,
}

export enum ProposalButtonStatus {
  PENDING = 'PENDING',
  APPROVE = 'APPROVE',
  EXECUTE = 'EXECUTE',
}

export enum ProposalsTableColumns {
  ID = 'Id',
  TITLE = 'Title',
  CREATEDBY = 'Created by',
  TO = 'To',
  PROPOSAL = 'Proposal',
  ITEM = 'Item',
  DATE_INITIATED = 'Date Initiated',
  VOTES = 'Votes',
  ACTION = 'Action',
  EXPIRATION = 'Expiration',
  STATUS = 'Status',
  DATE = 'Date',
}

export enum ProposalActionStatus {
  CREATED = 'Created',
  PENDING = 'Pending',
  APPROVE = 'Approve',
  VOTED = 'Voted',
  EXECUTE = 'Execute',
  EXECUTED = 'Executed',
  EXPIRED = 'Expired',
  CANCELED = 'Canceled',
}

export interface ProposalType {
  proposalTitle: string
  proposalStatus: string
  statusCount: number
  from: string
  to: string
  item: string
  description: string
  memo: string
  uniqueID: number
}

export interface ErrorModalOverlayType {
  setActive: (x: boolean) => void
  isActive: boolean
  error: ErrorTypes
  setError: (x: ErrorTypes) => void
}
export interface CancelProposalModalType {
  proposal: MsigworldsExtendedPropose
}
export interface CancelProposalModalOverlayType {
  proposal: MsigworldsExtendedPropose
}
export enum MsigWorldsProposeStates {
  APPROVABLE = 0,
  EXECUTED = 1,
  CANCELED = 2,
}
export interface MsigworldsAction {
  account: string
  name: string
  authorization: Array<MsigworldsPermissionLevel>
  data: string
}
export interface MsigworldsApproval {
  level: MsigworldsPermissionLevel
  time: string
}
export interface MsigworldsApprovalsInfo {
  proposal_name: string
  requested_approvals: Array<MsigworldsApproval>
  provided_approvals: Array<MsigworldsApproval>
}
export interface MsigworldsApprove {
  proposal_name: string
  level: MsigworldsPermissionLevel
  dac_id: string
  proposal_hash: string | null
}
export interface MsigworldsBlockaction {
  account: string
  action: string
  dac_id: string
}
export interface MsigworldsBlockedAction {
  id: number | string
  account: string
  action: string
}
export interface MsigworldsCancel {
  proposal_name: string
  canceler: string
  dac_id: string
}
export interface MsigworldsCleanup {
  proposal_name: string
  dac_id: string
}
export interface MsigworldsDeny {
  proposal_name: string
  level: MsigworldsPermissionLevel
  dac_id: string
}
export interface MsigworldsExec {
  proposal_name: string
  executer: string
  dac_id: string
}
export interface MsigworldsExtension {
  type: number
  data: string
}
export interface MsigworldsInvalidate {
  account: string
  dac_id: string
}
export interface MsigworldsInvalidation {
  account: string
  last_invalidation_time: string
}
export interface MsigworldsPairStringString {
  key: string
  value: string
}
export interface MsigworldsPermissionLevel {
  actor: string
  permission: string
}
export interface MsigworldsNewClaimBudget {
  proposer: string
  proposal_name: string
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  expirationDays: number
}

export interface MsigworldsClaimBudget {
  proposer: string
  proposal_name: string
  requested: Array<MsigworldsPermissionLevel>
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  trx: MsigworldsTransaction
}

export interface MsigworldsPropose {
  proposer: string
  proposal_name: string
  requested: Array<MsigworldsPermissionLevel>
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  trx: MsigworldsTransaction
}
export interface MsigProposeProvidedApprovals {
  time: string
  level: MsigworldsPermissionLevel
}
export interface MsigworldsExtendedPropose extends MsigworldsPropose {
  id: number
  state: number
  isPending?: boolean
  isExecuted: boolean
  isCanceled: boolean
  isApprovable: boolean
  isExecutable?: boolean
  isVoted?: boolean
  isBudgetClaim?: boolean
  isExpired?: boolean
  expiration?: string
  status?: string
  earliest_exec_time?: string
  actions: Array<EosioAction>
  providedApprovals?: Array<MsigProposeProvidedApprovals>
}
export interface MsigworldsCancelPropose {
  proposer: string
  proposal_name: string
  requested: Array<MsigworldsPermissionLevel>
  dac_id: string
  metadata: Array<{ key: string; value: string }>
  trx: MsigworldsTransaction
}
export interface MsigworldsNewPropose {
  dac_id: string
  proposer: string
  tx_actions: Array<EosioAction>
  proposal_to: string
  proposal_name: string
  proposal_memo: string
  expirationDays: number
  proposal_quantity: string
  metadata: Array<{ key: string; value: string }>
}
export interface MsigworldsNewApprove {
  dac_id: string
  approver: string
  proposal_name: string
}
export interface MsigworldsNewExecute {
  dac_id: string
  executer: string
  proposal_name: string
}
interface MsigworldsTransaction extends MsigworldsTransactionHeader {
  context_free_actions: Array<MsigworldsAction>
  actions: Array<MsigworldsAction>
  transaction_extensions: Array<MsigworldsExtension>
}
interface MsigworldsTransactionHeader {
  expiration: String
  ref_block_num: number
  ref_block_prefix: number
  max_net_usage_words: string
  max_cpu_usage_ms: number
  delay_sec: string
}
export interface MsigworldsUnapprove {
  proposal_name: string
  level: MsigworldsPermissionLevel
  dac_id: string
}

export type EosioAction = {
  /** The account holding the contract with the action intended to execute eg. `eosio.token` */
  account: string
  /** The name of the action to executed eg. `transfer` */
  name: string
  /** The authorizations intended to perform this action. This should be authorised for that account either via the default `active` permission or via a custom auth that has been linked to an action with `linkauth` */
  authorization: AccountAuthorization[]
  /** The data required to perform the action. These will be the action sepcific params supplied in a JSON format */
  data: any
}
export interface AccountAuthorization {
  actor: string
  permission: string
}

export enum CandidatesSortByOptions {
  RANK = 'Rank',
  VOTEPOWER = 'Voting Power',
  VOTEDECAY = 'Vote Decay',
  TOTALVOTES = 'Total Votes',
  GIVENNAME = 'By Name',
}

export enum ColsProposalsTablePlanetDetails {
  ID = 'Id',
  TITLE = 'Title',
  CREATEDBY = 'Created by',
  TO = 'To',
  ITEM = 'Item',
  DATE = 'Date Initiated',
  VOTES = 'Votes',
  ACTION = 'Action',
}

export enum ColsProposalsTableCustodianDashboard {
  ID = 'Id',
  TITLE = 'Title',
  PROPOSAL = 'Proposal',
  CREATEDBY = 'Created by',
  TO = 'To',
  ITEM = 'Item',
  VOTES = 'Votes',
  ACTION = 'Action',
  EXPIRATION = 'Expiration',
}

export enum ColsProposalsTableCandidateProfile {
  ID = 'Id',
  TITLE = 'Title',
  DATEINITIATED = 'Date Initiated',
  TO = 'To',
  ITEM = 'Item',
  ACTION = 'Action',
  STATUS = 'Status',
}

export interface FlattenedProposal {
  id: string
  title: string
  proposalName: string
  createdBy: string
  description: string
  to: string
  item: string
  date: string
  votes: number
  action: string
  status: string
  expiration: string
  hasClaimBudget: boolean
  totalVotes: number
  unpacked: UnpackedTransaction
  approvals: Approval[]
}
