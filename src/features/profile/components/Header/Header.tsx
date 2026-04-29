import { useEffect } from 'react'

import { Button } from '@alien-worlds/uikit'
import { Flex, useBreakpointValue, Box, Text, Hide } from '@chakra-ui/react'
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
import { useActions, useAppState } from 'store'

import { Constants } from '../../../../shared/util/constants'

export const CurrentBadge = () => {
  const { currentLevelReward } = useLevelNftRewards()
  const currentBadgeTitleSize = useBreakpointValue({ base: '12px', sm: '16px', md: '18px' })

  return (
    <Flex
      alignItems="center"
      height="fit-content"
      color={Colors.DI_SERRIA}
      w={{ base: '40px', md: '50px', xl: '70px' }}
      gap={{ base: '0px', xl: '10px' }}
      justifyContent={{ base: 'center', xl: 'start' }}
      flexDirection={{ base: 'column', xl: 'row-reverse' }}
    >
      <UserLevelsBadge
        isTitle={false}
        levelId={currentLevelReward?.level}
        width={{ base: '20px', xl: '75px' }}
        height={{ base: '20px', xl: '75px' }}
      />
      <UserLevelsBadgeTitle size={currentBadgeTitleSize} levelId={currentLevelReward?.level} />
    </Flex>
  )
}

export const Header = () => {
  const avatarSize = useBreakpointValue({ base: 5.6312, sm: 6.6312, md: 7.6312, lg: 8.6312, xl: 9 })
  const {
    wax: { nftsToClaimTemplates, isDemoUser, walletId },
  } = useAppState()
  const {
    wax: { initializeOrReloadNftsToClaim },
    modal: { setSecondaryModalActive },
  } = useActions()
  const { currentLevelReward } = useLevelNftRewards()
  useEffect(() => {
    initializeOrReloadNftsToClaim()
  }, [])

  return (
    <Flex
      w="100%"
      mb="25px"
      pb="15px"
      alignItems="center"
      borderRadius="25px"
      justifyContent="center"
      background={Colors.BLACK_SOLID_90}
      direction={{ base: 'column', xl: 'row' }}
    >
      <Hide above="md">
        <Flex justifyContent="space-between" width="100%" px="34px" pt="40px" pb="30px">
          <Flex gap={2}>
            <PlayerAvatar size={5.2} showNotifications marginInline="0px" />
            <Flex direction="column" justifyContent="space-between">
              <Box>
                <Tag fontSize="20px" fontWeight={600} color={Colors.SNOW_WHITE} />
                <Text fontSize="14px" fontFamily="tlm" color={Colors.DI_SERRIA} fontWeight={400}>
                  {isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId}
                </Text>
              </Box>
              <Flex alignItems="center" gap={1}>
                <Text color={Colors.SILVER} fontFamily="tlm" fontWeight={400} fontSize="14px">
                  Rank:
                </Text>
                <UserLevelsBadgeTitle
                  textAlign="start"
                  levelId={currentLevelReward?.level}
                  size="14px"
                  fontWeight="400"
                  fontFamily="tlm"
                  letterSpacing="0rem"
                />
              </Flex>
            </Flex>
          </Flex>

          <Flex zIndex={2}>
            <BadgesMap level={currentLevelReward?.level} width="40px" height="40px" />
          </Flex>
        </Flex>
      </Hide>
      {/* AVATAR */}
      <Hide below="md">
        {' '}
        <Flex
          paddingInline={0}
          justifyContent="center"
          pl={{ base: 0, xl: '25px' }}
          pt={{ base: '30px', xl: '10px' }}
          pb={{ base: '0px', xl: 0 }}
        >
          <PlayerAvatar size={avatarSize} showLevelRing />
        </Flex>
      </Hide>

      <Flex
        h="100%"
        w="100%"
        minW="200px"
        direction="column"
        alignItems="start"
        justifyContent="space-around"
        p={{ base: '0px', md: '15px' }}
      >
        <Hide below="md">
          <Flex
            w="97%"
            alignItems={{ base: 'center', xl: 'start' }}
            justifyContent={{ base: 'center', xl: 'space-between' }}
            flexWrap="wrap"
          >
            {/* TAG & WALLET */}
            <TagWithWalletBtn />

            {/* CURRENT BADGE */}
            <Flex
              right={{ base: '0px', md: '10px', xl: '' }}
              pt={{ base: '0px', xl: '10px' }}
              top={{ base: isDemoUser ? '20px' : '30px', md: isDemoUser ? '40px' : '60px', xl: '' }}
              position={{ base: 'absolute', xl: 'static' }}
              w={{ base: '60px', sm: '75px', md: '110px', xl: '150px' }}
            >
              <CurrentBadge />
            </Flex>
          </Flex>
        </Hide>

        {/* TABS BUTTONS */}
        <Flex
          w={{ base: '90%', md: '100%' }}
          pt={{ base: '20px', md: '0px' }}
          gap={{ base: '15px', xl: '25px' }}
          flexWrap={{ base: 'wrap', md: 'nowrap' }}
          alignSelf={{ base: 'center', md: 'initial' }}
          justifyContent={{ base: 'center', md: 'start' }}
        >
          <ProfileBtn />
          <BalancesBtn />
          {/* <OutpostBtn /> */}
        </Flex>
        {nftsToClaimTemplates.length > 0 && (
          <Flex w="97%" mt="20px" ml="5px" align="center" justify="center">
            <Button
              variant="primary"
              size="lg"
              fontSize={20}
              isFullWidth
              onClick={() => {
                setSecondaryModalActive({ modalName: 'OldNFTClaimModal', value: true })
              }}
            >
              Claim Shards
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
