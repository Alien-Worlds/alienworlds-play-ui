/**
 * UserInfo Component
 *
 * A focused component that displays user information including avatar and basic details.
 * This component is reusable and can be used in different contexts.
 */

import React from 'react'

import { Box, Flex, Text } from '@chakra-ui/react'
import { PlayerAvatar } from 'shared/components/topbar/PlayerAvatar'
import { Tag } from 'shared/components/topbar/Tag'
import { UserLevelsBadgeTitle } from 'shared/components/UserLevelsBadges/UserLevelsBadges'
import { Colors } from 'shared/util/colors'

import { PROFILE_CONSTANTS } from '../../../constants/profile.constants'
import { formatWalletDisplay } from '../../../utils/profile.utils'

interface UserInfoProps {
  walletId: string
  isDemoUser: boolean
  level?: number
  showAvatar?: boolean
  showLevel?: boolean
  variant?: 'compact' | 'full'
  className?: string
}

export const UserInfo: React.FC<UserInfoProps> = ({
  walletId,
  isDemoUser,
  level,
  showAvatar = true,
  showLevel = true,

  className,
}) => {
  const displayWalletId = formatWalletDisplay(walletId, isDemoUser)

  return (
    <Flex gap={2} className={className}>
      {showAvatar && (
        <PlayerAvatar size={PROFILE_CONSTANTS.AVATAR_SIZES.SMALL} marginInline="0px" />
      )}

      <Flex direction="column" justifyContent="space-between">
        <Box>
          <Tag fontSize="20px" fontWeight={600} color={Colors.SNOW_WHITE} />
          <Text fontSize="14px" fontFamily="tlm" color={Colors.DI_SERRIA} fontWeight={400}>
            {displayWalletId}
          </Text>
        </Box>

        {showLevel && level && (
          <Flex alignItems="center" gap={1}>
            <Text color={Colors.SILVER} fontFamily="tlm" fontWeight={400} fontSize="14px">
              Rank:
            </Text>
            <UserLevelsBadgeTitle
              textAlign="start"
              levelId={level}
              size="14px"
              fontWeight="400"
              fontFamily="tlm"
              letterSpacing="0rem"
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
