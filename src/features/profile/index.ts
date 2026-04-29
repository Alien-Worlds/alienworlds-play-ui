/**
 * Profile Feature - Main Export
 *
 * This file provides a clean API for importing profile feature components and utilities.
 * It serves as the main entry point for the profile feature.
 */

// Context
export { ProfileProvider, useProfileContext } from './context/ProfileContext'

// Hooks
export { useProfileData } from './hooks/useProfileData'
export { useBalanceData } from './hooks/useBalanceData'
export { useClaimsData } from './hooks/useClaimsData'

// Components
export { ProfileView } from './components/ProfileView/ProfileView'
export { ProfileHeader } from './components/sections/ProfileHeader'
export { BalanceSection } from './components/sections/BalanceSection'

// UI Components
export { UserInfo } from './components/ui/UserInfo'
export { BadgeDisplay } from './components/ui/BadgeDisplay'
export { BalanceCard } from './components/ui/BalanceCard'
export { WalletSelector } from './components/ui/WalletSelector'

// Error Boundary
export { ProfileErrorBoundary } from './components/ErrorBoundary'

// Pages
export { ProfileInfo } from './pages/ProfileInfo'
export { ProfileBalances } from './pages/ProfileBalances'

// Types
export type {
  ProfileData,
  BalanceData,
  ClaimableReward,
  ProfileState,
  ProfileActions,
  ProfileContextType,
  ProfileHeaderProps,
  BalanceCardProps,
  ProgressBarProps,
  ClaimsSectionProps,
  UseProfileDataReturn,
  UseBalanceDataReturn,
  UseClaimsDataReturn,
} from './types/profile.types'

// Constants
export {
  PROFILE_CONSTANTS,
  UI_CONSTANTS,
  BALANCE_CONSTANTS,
  CLAIMS_CONSTANTS,
  PROGRESS_BAR_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants/profile.constants'

// Utils
export {
  formatWalletDisplay,
  calculateProgressPercentage,
  formatBalance,
  extractBalanceValue,
  calculateTimeRemaining,
  isRewardClaimable,
  getClaimButtonVariant,
  formatTimeRemaining,
  validateProfileData,
  createSafeProfileData,
  calculateTotalStaked,
  groupClaimsByType,
  sortClaimsByPriority,
  generateClaimKey,
  isMaxLevel,
  getNextLevelRequirements,
  calculatePointsNeeded,
  formatPoints,
  debounce,
  throttle,
} from './utils/profile.utils'
