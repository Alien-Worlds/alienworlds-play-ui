/**
 * Profile Feature Type Definitions
 *
 * This file contains all TypeScript type definitions for the profile feature.
 * It provides type safety and better developer experience.
 */

export interface ProfileData {
  walletId: string
  isDemoUser: boolean
  currentLevel: number
  userPoints: number
  avatarUrl?: string
  rank?: string
}

export interface BalanceData {
  tlmBalance: number
  stakedAmount: number
  shards: number
  bscBalance?: number
  stakedBscBalance?: number
}

export interface ClaimableReward {
  type: 'mining' | 'commission' | 'dtal' | 'unstake'
  amount: string
  isClaimable: boolean
  timeRemaining?: number
  planet?: string
  releaseTime?: string
}

export interface UserLevelReward {
  level: number
  required: number
  asset?: {
    data?: {
      description?: string
      img?: string
    }
  }
  id?: string
}

export interface ProfileState {
  profileData: ProfileData | null
  balanceData: BalanceData | null
  claimsData: ClaimableReward[]
  loading: boolean
  error: string | null
}

export interface ProfileActions {
  refreshProfile: () => Promise<void>
  claimReward: (type: string, planetId?: string) => Promise<void>
  updateProfile: (updates: Partial<ProfileData>) => void
}

export interface ProfileContextType {
  state: ProfileState
  actions: ProfileActions
}

// Component Props Types
export interface ProfileHeaderProps {
  variant?: 'compact' | 'full'
  showBadge?: boolean
  className?: string
}

export interface BalanceCardProps {
  balance: BalanceData
  type: 'wax' | 'bsc' | 'shards'
  showActions?: boolean
  className?: string
}

export interface ProgressBarProps {
  current: number
  total: number
  currentLevel: number
  nextLevel?: number
  showLabels?: boolean
  className?: string
}

export interface ClaimsSectionProps {
  claims: ClaimableReward[]
  onClaim: (type: string, planetId?: string) => Promise<void>
  loading?: boolean
  className?: string
}

// API Response Types
export interface WalletDetailsResponse {
  tlm_balance: string
  userpoints_details: {
    total_points: number
    redeemable_points: number
    top_level: number
  }
  mining_claim: {
    amount: string
    last_claim_time: string | null
  }
  land_comms: {
    amount: string
  }
  land_ratings_payout: string
}

export interface UserBalancesResponse {
  [planetId: string]: {
    stake_details: {
      staked_amount: string
      available_tlm_in_dao: string
      dao_token_balance: string
      unstakes: Array<{
        stake: string
        release_time: string
      }>
    }
  }
}

// Hook Return Types
export interface UseProfileDataReturn {
  profileData: ProfileData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface UseBalanceDataReturn {
  balanceData: BalanceData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface UseClaimsDataReturn {
  claims: ClaimableReward[]
  loading: boolean
  error: string | null
  claimReward: (type: string, planetId?: string) => Promise<void>
}

// Utility Types
export type ProfileVariant = 'compact' | 'full' | 'minimal'
export type BalanceType = 'wax' | 'bsc' | 'shards' | 'staked'
export type ClaimType = 'mining' | 'commission' | 'dtal' | 'unstake'
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
