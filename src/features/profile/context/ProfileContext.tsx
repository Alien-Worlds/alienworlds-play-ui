/**
 * Profile Context Provider
 *
 * This context provides profile-related state and actions to all child components.
 * It centralizes profile data management and provides a clean API.
 */

import React, { createContext, useContext, useMemo } from 'react'

import { useBalanceData } from '../hooks/useBalanceData'
import { useClaimsData } from '../hooks/useClaimsData'
import { useProfileData } from '../hooks/useProfileData'
import { ProfileContextType, ProfileState, ProfileActions } from '../types/profile.types'

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

interface ProfileProviderProps {
  children: React.ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const profileData = useProfileData()
  const balanceData = useBalanceData()
  const claimsData = useClaimsData()

  const state: ProfileState = useMemo(
    () => ({
      profileData: profileData.profileData,
      balanceData: balanceData.balanceData,
      claimsData: claimsData.claims,
      loading: profileData.loading || balanceData.loading || claimsData.loading,
      error: profileData.error || balanceData.error || claimsData.error,
    }),
    [profileData, balanceData, claimsData]
  )

  const actions: ProfileActions = useMemo(
    () => ({
      refreshProfile: async () => {
        await Promise.all([profileData.refresh(), balanceData.refresh()])
      },
      claimReward: async (type: string, planetId?: string) => {
        await claimsData.claimReward(type, planetId)
      },
      updateProfile: (updates) => {
        // Add profile update logic here
        console.log('Profile update:', updates)
      },
    }),
    [profileData, balanceData, claimsData]
  )

  const contextValue: ProfileContextType = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  )

  return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}

export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider')
  }
  return context
}

// Export the context for advanced usage
export { ProfileContext }
