/**
 * Profile Utility Functions
 *
 * This file contains pure utility functions for profile-related operations.
 * These functions are stateless and can be easily tested.
 */

import { PROFILE_CONSTANTS, BALANCE_CONSTANTS } from '../constants/profile.constants'
import { ProfileData, ClaimableReward } from '../types/profile.types'

/**
 * Formats wallet display text based on user type
 */
export const formatWalletDisplay = (walletId: string, isDemoUser: boolean): string => {
  return isDemoUser ? PROFILE_CONSTANTS.DEMO_ACCOUNT_TAG : walletId
}

/**
 * Calculates progress percentage for level progression
 */
export const calculateProgressPercentage = (current: number, total: number): number => {
  if (total <= 0) return 0
  return Math.min((current / total) * 100, 100)
}

/**
 * Formats balance with specified decimal places
 */
export const formatBalance = (
  balance: string | number,
  decimals: number = BALANCE_CONSTANTS.DECIMAL_PLACES
): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  return num.toFixed(decimals)
}

/**
 * Extracts numeric value from balance string
 */
export const extractBalanceValue = (balanceString: string | number | null | undefined): number => {
  if (balanceString == null) return 0
  if (typeof balanceString === 'number') return balanceString
  if (typeof balanceString !== 'string') return 0
  const match = balanceString.match(/^([\d,]+\.?\d*)/)
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0
}

/**
 * Calculates time remaining for claim cooldown
 */
export const calculateTimeRemaining = (
  lastClaimTime: string | null,
  cooldownHours: number = 24
): number => {
  if (!lastClaimTime) return 0

  const lastClaim = new Date(lastClaimTime)
  const now = new Date()
  const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)

  return Math.max(0, cooldownHours - diffHours)
}

/**
 * Determines if a reward is claimable
 */
export const isRewardClaimable = (amount: string, timeRemaining: number = 0): boolean => {
  const hasAmount = extractBalanceValue(amount) > 0
  const isNotOnCooldown = timeRemaining <= 0
  return hasAmount && isNotOnCooldown
}

/**
 * Gets claim button variant based on claimability
 */
export const getClaimButtonVariant = (isClaimable: boolean, timeRemaining: number = 0): string => {
  if (!isClaimable) return 'disabled'
  if (timeRemaining > 0) return 'beryllium'
  return 'lithium'
}

/**
 * Formats time remaining as human readable string
 */
export const formatTimeRemaining = (hours: number): string => {
  if (hours <= 0) return 'Available now'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

/**
 * Validates profile data
 */
export const validateProfileData = (data: Partial<ProfileData>): boolean => {
  return !!(data.walletId && typeof data.isDemoUser === 'boolean')
}

/**
 * Creates a safe profile data object
 */
export const createSafeProfileData = (data: Partial<ProfileData>): ProfileData => {
  return {
    walletId: data.walletId || '',
    isDemoUser: data.isDemoUser || false,
    currentLevel: data.currentLevel || 1,
    userPoints: data.userPoints || 0,
    avatarUrl: data.avatarUrl,
    rank: data.rank,
  }
}

/**
 * Calculates total staked amount from user balances
 */
export const calculateTotalStaked = (userBalances: Record<string, any>): number => {
  return Object.values(userBalances).reduce((total, planet) => {
    const stakedAmount = planet?.stake_details?.staked_amount
    if (stakedAmount) {
      const amount = extractBalanceValue(stakedAmount)
      return total + amount
    }
    return total
  }, 0)
}

/**
 * Groups claims by type
 */
export const groupClaimsByType = (claims: ClaimableReward[]): Record<string, ClaimableReward[]> => {
  return claims.reduce((groups, claim) => {
    const type = claim.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(claim)
    return groups
  }, {} as Record<string, ClaimableReward[]>)
}

/**
 * Sorts claims by priority (claimable first, then by amount)
 */
export const sortClaimsByPriority = (claims: ClaimableReward[]): ClaimableReward[] => {
  return claims.sort((a, b) => {
    // Claimable rewards first
    if (a.isClaimable && !b.isClaimable) return -1
    if (!a.isClaimable && b.isClaimable) return 1

    // Then by amount (descending)
    const amountA = extractBalanceValue(a.amount)
    const amountB = extractBalanceValue(b.amount)
    return amountB - amountA
  })
}

/**
 * Generates unique key for claim items
 */
export const generateClaimKey = (type: string, planetId?: string): string => {
  return planetId ? `${type}-${planetId}` : type
}

/**
 * Checks if user has reached max level
 */
export const isMaxLevel = (level: number): boolean => {
  return level >= PROFILE_CONSTANTS.LEVELS.MAX_LEVEL
}

/**
 * Gets next level requirements
 */
export const getNextLevelRequirements = (currentLevel: number, nextLevelReward?: any): number => {
  if (isMaxLevel(currentLevel)) return 0
  return nextLevelReward?.required || 0
}

/**
 * Calculates points needed for next level
 */
export const calculatePointsNeeded = (currentPoints: number, nextLevelRequired: number): number => {
  return Math.max(0, nextLevelRequired - currentPoints)
}

/**
 * Formats points with appropriate decimal places
 */
export const formatPoints = (points: number): string => {
  return points.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/**
 * Debounce function for search and input handling
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll and resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
