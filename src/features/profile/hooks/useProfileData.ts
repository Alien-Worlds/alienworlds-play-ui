/**
 * Custom Hook: useProfileData
 *
 * This hook manages profile-related data fetching and state management.
 * It provides a clean interface for components to access profile data.
 */

import { useMemo } from 'react'

import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { useAppState } from 'store'

import { ProfileData, UseProfileDataReturn } from '../types/profile.types'
import { createSafeProfileData, formatWalletDisplay } from '../utils/profile.utils'

export const useProfileData = (): UseProfileDataReturn => {
  const {
    wax: { walletId, isDemoUser },
  } = useAppState()

  const { walletDetails, loading: walletLoading } = useWalletDetails(walletId)
  const { currentLevelReward } = useLevelNftRewards()

  const profileData = useMemo((): ProfileData | null => {
    if (!walletDetails || !currentLevelReward) return null

    return createSafeProfileData({
      walletId: formatWalletDisplay(walletId, isDemoUser),
      isDemoUser,
      currentLevel: currentLevelReward.level,
      userPoints: walletDetails.userpoints_details?.total_points || 0,
      rank: currentLevelReward.level?.toString(),
    })
  }, [walletDetails, currentLevelReward, walletId, isDemoUser])

  const loading = walletLoading
  const error = null // Add error handling logic here

  const refresh = async (): Promise<void> => {
    // Add refresh logic here
    // This could trigger a refetch of the queries
  }

  return {
    profileData,
    loading,
    error,
    refresh,
  }
}
