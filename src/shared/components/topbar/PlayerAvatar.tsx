import { useEffect, useState } from 'react'

import { CheckIcon } from '@alien-worlds/icons'
import { Avatar, LevelRing } from '@alien-worlds/uikit'
import { Flex, Text } from '@chakra-ui/react'
import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { get, toLower } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { BadgesMap } from 'shared/components/UserLevelsBadges/UserLevelsBadges'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { getLevelVariant, getNftImage, maleHumanAvatar } from 'shared/util/nft'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const PlayerAvatar = ({
  showBadge,
  showVerification,
  showNotifications,
  size = 4,
  showLevelRing = false,
  marginInline = '20px',
}: {
  size?: number
  showBadge?: boolean
  showVerification?: boolean
  showNotifications?: boolean
  showLevelRing?: boolean
  marginInline?: string
}) => {
  const {
    atomic: { avatarAsset },
    wax: { isLoggedIn, isAuthenticating, nftsToClaimTemplates, walletId },
  } = useAppState()

  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const { currentLevelReward } = useLevelNftRewards()

  const navigate = useNavigate()
  const [avatarSrc, setAvatarSrc] = useState(null)

  const [isNotification, setNotification] = useState<Boolean>(false)

  useEffect(() => {
    if (avatarAsset) setAvatarSrc(getNftImage(avatarAsset))
    else setAvatarSrc(maleHumanAvatar)

    if (nftsToClaimTemplates.length > 0) {
      setNotification(true)
    }
    return () => {
      setAvatarSrc(null)
    }
  }, [avatarAsset])

  if (!isLoggedIn || isAuthenticating || loading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div {...pageTransition}>
      <Flex
        cursor="pointer"
        position="relative"
        marginInline={marginInline}
        onClick={() => {
          if (showNotifications) {
            setNotification(false)
          }
          navigate(PagePath.ProfileInfo)
        }}
      >
        {/* AVATAR */}
        {showLevelRing ? (
          <LevelRing
            animationDuration={1}
            radius={size}
            src={avatarSrc}
            variant={getLevelVariant(get(currentLevelReward, 'level', 1))}
          />
        ) : (
          <Avatar
            animationDuration={1}
            radius={size}
            src={avatarSrc}
            rarity={toLower(get(avatarAsset, 'data.rarity', 'abundant'))}
            shine={toLower(get(avatarAsset, 'data.shine', 'stone'))}
          />
        )}
        {/* BADGE */}
        {walletDetails && showBadge && (
          <Flex zIndex={2} top="33px" left="35px" width="33px" height="33px" position="absolute">
            <BadgesMap level={currentLevelReward?.level} height="33px" width="33px" />
          </Flex>
        )}

        {/* NOTIFICATIONS */}
        {isNotification && showNotifications && (
          <Flex
            position="absolute"
            zIndex={2}
            bg={Colors.RADICAL_RED}
            width="20px"
            height="20px"
            justifyContent="center"
            alignContent="center"
            alignItems="center"
            borderRadius="full"
            top={0}
            left={0}
          >
            <Text fontFamily="orb">1</Text>
          </Flex>
        )}

        {/* VERIFICATION */}
        {showVerification && (
          <Flex
            p={0.5}
            zIndex={2}
            bottom="5px"
            right="2px"
            width="30px"
            height="30px"
            border="7px solid"
            borderRadius="50%"
            position="absolute"
            bg={Colors.OCEAN_GREEN}
            borderColor={Colors.TRANSLUCENT_GREY}
          >
            <CheckIcon boxSize={12} />
          </Flex>
        )}
      </Flex>
    </motion.div>
  )
}

export { PlayerAvatar }
