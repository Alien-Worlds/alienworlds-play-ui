import { MutableRefObject } from 'react'

export type LeaderboardTableProps = {
  data: any
  sortMenuClickAwayRef: MutableRefObject<any>
  filterMenuClickAwayRef?: MutableRefObject<any>
  setSortMenuVisible: (value: boolean) => void
  isSortingReversed: boolean
  setIsSortingReversed: (value: boolean) => void
  leaderboardSortBy: string
  setLeaderboardSortBy: (value: string) => void
  leaderboardFilterBy: string
  setLeaderboardFilterBy: (value: string) => void
}

export enum LeaderboardFilter {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}
export const LeaderboardFilterOptions = [
  { value: LeaderboardFilter.DAILY, label: 'Daily' },
  { value: LeaderboardFilter.WEEKLY, label: 'Weekly' },
  { value: LeaderboardFilter.MONTHLY, label: 'Monthly' },
]

export const LeaderboardSortByOptions = [
  { value: 'tlm_gains_total', label: 'TLM Mined' },
  { value: 'total_nft_points', label: 'Total Shards' },
  { value: 'avg_charge_time', label: 'Avg. Charge Time' },
  { value: 'avg_mining_power', label: 'Avg. Mining Power' },
  { value: 'avg_nft_power', label: 'Avg. NFT Power' },
  { value: 'lands_mined_on', label: 'Lands Mined' },
  { value: 'planets_mined_on', label: 'Planets Mined' },
  { value: 'unique_tools_used', label: 'Unique Tools' },
]

export enum LeaderboardTableTypes {
  Rank = 'N',
  Explorer = 'Explorer',
  WalletId = 'Wallet ID',
  TlmMined = 'TLM Mined',
  TotalShards = 'Total Shards',
  ChargeTime = 'Charge Time',
  MiningPower = 'Mining Power',
  NFTPower = 'NFT Power',
  MinedLands = 'Lands Mined',
  MinedPlanets = 'Planets Mined',
  UniqueTools = 'Unique Tools',
}

export const LAYOUT_BREAKPOINT = 'xl'
export enum LBGridBreakpoints {
  BASE = 'base',
  MEDIUM = 'md',
  LARGE = 'lg',
  XLARGE = 'xl',
}

export enum LeaderboardSortOrder {
  ASC = 1,
  DESC = -1,
}

export const LeaderboardDefaultLimit = 10

export type LeaderboardItem = {
  wallet_id: string
  username: string
  tlm_gains_total: number
  tlm_gains_highest: number
  total_nft_points: number
  total_charge_time: number
  avg_charge_time: number
  total_mining_power: number
  avg_mining_power: number
  total_nft_power: number
  avg_nft_power: number
  lands_mined_on: number
  planets_mined_on: number
  unique_tools_used: number
  position: number
  tag: string
  avatar: string
}

export type LeaderboardResponse = {
  results: LeaderboardItem[]
  total: number
}

export type LeaderboardListQueryParams = {
  timeframe: LeaderboardFilter | string
  sort: string
  offset: number
  limit: number
  order: LeaderboardSortOrder
}

export type LeaderboardFindQueryParams = Pick<LeaderboardListQueryParams, 'timeframe' | 'sort'> & {
  user: string
}

export type LeaderboardGridProps = {
  items: LeaderboardItem[]
}

export type LeaderboardStateShape = {
  offset: number
  currentPage: number
  searchValue: string
  isSortReversed: boolean
  sort: string
  timeframe: LeaderboardFilter | string
  isLoadingNewPage: boolean
}
