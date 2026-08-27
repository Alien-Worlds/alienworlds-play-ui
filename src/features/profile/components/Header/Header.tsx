import { useBreakpointValue } from '@alien-worlds/uikit'
import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import {
  BalancesBtn,
  // OutpostBtn,
  ProfileBtn,
  TagWithWalletBtn,
} from 'features/profile/components/ProfileActions/ProfileActions'
import { PlayerAvatar } from 'shared/components/topbar/PlayerAvatar'
import { Tag } from 'shared/components/topbar/Tag'
import {
  UserLevelsBadge,
  UserLevelsBadgeTitle,
} from 'shared/components/UserLevelsBadges/UserLevelsBadges'
import { BadgesMap } from 'shared/components/UserLevelsBadges/UserLevelsBadges'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

import { Constants } from '../../../../shared/util/constants'

export const CurrentBadge = () => {
  const { currentLevelReward } = useLevelNftRewards()
  const currentBadgeTitleSize = useBreakpointValue({ base: '12px', sm: '16px', md: '18px' })

  return (
    <div
      className="flex h-fit w-[40px] flex-col items-center justify-center gap-0 md:w-[50px] xl:w-[70px] xl:flex-row-reverse xl:justify-start xl:gap-[10px]"
      style={{ color: Colors.DI_SERRIA }}
    >
      <UserLevelsBadge
        isTitle={false}
        levelId={currentLevelReward?.level}
        width={{ base: '20px', xl: '75px' }}
        height={{ base: '20px', xl: '75px' }}
      />
      <UserLevelsBadgeTitle size={currentBadgeTitleSize} levelId={currentLevelReward?.level} />
    </div>
  )
}

export const Header = () => {
  const avatarSize = useBreakpointValue({ base: 5.6312, sm: 6.6312, md: 7.6312, lg: 8.6312, xl: 9 })
  const {
    wax: { isDemoUser, walletId },
  } = useAppState()
  const { currentLevelReward } = useLevelNftRewards()

  return (
    <div
      className="mb-[25px] flex w-full flex-col items-center justify-center rounded-[25px] pb-[15px] xl:flex-row"
      style={{ background: Colors.BLACK_SOLID_90 }}
    >
      <div className="flex w-full justify-between px-[34px] pb-[30px] pt-[40px] md:hidden">
        <div className="flex gap-2">
          <PlayerAvatar size={5.2} marginInline="0px" />
          <div className="flex flex-col justify-between">
            <div>
              <Tag fontSize="20px" fontWeight={600} color={Colors.SNOW_WHITE} />
              <p className="font-tlm text-[14px] font-normal" style={{ color: Colors.DI_SERRIA }}>
                {isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <p className="font-tlm text-[14px] font-normal" style={{ color: Colors.SILVER }}>
                Rank:
              </p>
              <UserLevelsBadgeTitle
                textAlign="start"
                levelId={currentLevelReward?.level}
                size="14px"
                fontWeight="400"
                fontFamily="tlm"
                letterSpacing="0rem"
              />
            </div>
          </div>
        </div>

        <div className="z-[2] flex">
          <BadgesMap level={currentLevelReward?.level} width="40px" height="40px" />
        </div>
      </div>
      {/* AVATAR */}
      <div className="hidden justify-center px-0 pb-0 pt-[30px] md:flex xl:pb-0 xl:pl-[25px] xl:pt-[10px]">
        <PlayerAvatar size={avatarSize} showLevelRing />
      </div>

      <div className="flex h-full w-full min-w-[200px] flex-col items-start justify-around p-0 md:p-[15px]">
        <div
          className={`hidden w-[97%] flex-wrap items-center justify-center md:flex xl:items-start xl:justify-between`}
        >
          {/* TAG & WALLET */}
          <TagWithWalletBtn />

          {/* CURRENT BADGE */}
          <div
            className={`absolute w-[60px] pt-0 sm:w-[75px] md:right-[10px] md:w-[110px] xl:static xl:w-[150px] xl:pt-[10px] ${
              isDemoUser ? 'top-[20px] md:top-[40px]' : 'top-[30px] md:top-[60px]'
            } right-0`}
          >
            <CurrentBadge />
          </div>
        </div>

        {/* TABS BUTTONS */}
        <div className="flex w-[90%] flex-wrap items-center justify-center gap-[15px] self-center pt-[20px] md:w-full md:flex-nowrap md:justify-start md:self-auto md:pt-0 xl:gap-[25px]">
          <ProfileBtn />
          <BalancesBtn />
          {/* <OutpostBtn /> */}
        </div>
      </div>
    </div>
  )
}
