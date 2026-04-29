/**
 * ProfileHeader Component
 *
 * A comprehensive header component that displays user information and navigation.
 * This component combines multiple smaller components to create a cohesive header.
 */

import React from 'react'

import { Flex } from '@chakra-ui/react'

import { useProfileContext } from '../../../context/ProfileContext'
import { ProfileHeaderProps } from '../../../types/profile.types'
import { BadgeDisplay } from '../../ui/BadgeDisplay'
import { UserInfo } from '../../ui/UserInfo'

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  variant = 'full',
  showBadge = true,
  className,
}) => {
  const { state } = useProfileContext()
  const { profileData } = state

  if (!profileData) {
    return null
  }

  return (
    <Flex justifyContent="space-between" className={className}>
      <UserInfo
        walletId={profileData.walletId}
        isDemoUser={profileData.isDemoUser}
        level={profileData.currentLevel}
        showAvatar={variant !== 'compact'}
        showLevel={variant === 'full'}
        variant={variant}
      />

      {showBadge && (
        <BadgeDisplay
          level={profileData.currentLevel}
          size={variant === 'compact' ? 'small' : 'medium'}
        />
      )}
    </Flex>
  )
}
