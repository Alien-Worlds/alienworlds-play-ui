/**
 * UserInfo Component
 *
 * A focused component that displays user information including avatar and basic details.
 * This component is reusable and can be used in different contexts.
 */

import React from 'react'

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
    <div className={`flex gap-2 ${className ?? ''}`}>
      {showAvatar && (
        <PlayerAvatar
          size={PROFILE_CONSTANTS.AVATAR_SIZES.SMALL}
          showNotifications
          marginInline="0px"
        />
      )}

      <div className="flex flex-col justify-between">
        <div>
          <Tag fontSize="20px" fontWeight={600} color={Colors.SNOW_WHITE} />
          <p className="font-tlm text-[14px] font-normal" style={{ color: Colors.DI_SERRIA }}>
            {displayWalletId}
          </p>
        </div>

        {showLevel && level && (
          <div className="flex items-center gap-1">
            <p className="font-tlm text-[14px] font-normal" style={{ color: Colors.SILVER }}>
              Rank:
            </p>
            <UserLevelsBadgeTitle
              textAlign="start"
              levelId={level}
              size="14px"
              fontWeight="400"
              fontFamily="tlm"
              letterSpacing="0rem"
            />
          </div>
        )}
      </div>
    </div>
  )
}
