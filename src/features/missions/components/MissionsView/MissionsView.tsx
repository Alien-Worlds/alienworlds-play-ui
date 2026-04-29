import { VFC } from 'react'

import { BinanceChainIcon } from '@alien-worlds/icons'
import { Box, chakra, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { MissionCountdown } from 'features/missions/components/MissionCountdown'
import { MissionsCentreBtn, MyMissionsBtn } from 'features/missions/components/MissionsActions'
import {
  ConnectWalletBtn,
  useWalletConnect,
} from 'features/missions/components/MissionsActions/MissionsActions'
import { MissionRewardsBalance } from 'features/missions/components/MissionsBalances/MissionsBalances'
import { MissionsCrafts } from 'features/missions/components/MissionsCrafts'
import { StakedTriliumBalance } from 'features/missions/components/StakedTriliumBalance/StakedTriliumBalance'
import { TriliumBSCBalance } from 'features/missions/components/TriliumBSCBalance/TriliumBSCBalance'
import { WrongChain } from 'features/missions/components/WrongChain/WrongChain'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'

export const MissionsView: VFC = () => {
  const wallet = useWalletConnect()
  const { isMediumScreen, isNotDesktop } = useScreenSize()
  const {
    wax: { isDemoUser },
    missions: { currentMissions },
  } = useAppState()

  const ActionButtons = (): JSX.Element => {
    return (
      <HStack
        flexWrap="wrap"
        justifyContent="center"
        gap={isNotDesktop ? '25px' : '30px'}
        w={isNotDesktop ? '100%' : 'initial'}
      >
        <MyMissionsBtn />
        <MissionsCentreBtn />
      </HStack>
    )
  }

  if (wallet.connectedChain && parseInt(wallet.connectedChain.id, 16) !== config.BscChainId)
    return <WrongChain />

  if (wallet.connectedWallets.length === 0 || wallet.connecting) {
    return (
      <Flex
        w="100%"
        gap="50px"
        alignItems="center"
        justifyContent="center"
        px={isNotDesktop ? '30px' : '0px'}
        pb={isNotDesktop ? '200px' : '0px'}
        pt={isDemoUser ? '75px' : '0px'}
        bg={Colors.MINE_SHAFT}
        direction={isNotDesktop ? 'column' : 'row-reverse'}
        h={{ base: isDemoUser ? '' : '100%', sm: isDemoUser ? '' : '100%' }}
      >
        <ConnectWalletBtn onClick={() => wallet.connect()} />
        <HStack>
          <Box mr="20px">
            <BinanceChainIcon boxSize={48} color={Colors.BUTTERCUP} />
          </Box>
          <Text fontFamily="Titillium Web" fontSize="16px" fontWeight={700} mb={2}>
            Make sure you are connected to the
            <br />
            <chakra.span color={Colors.BUTTERCUP} letterSpacing="2px">
              Binance Smart Chain Network
            </chakra.span>
          </Text>
        </HStack>
      </Flex>
    )
  }

  return (
    <>
      {/* MOBILE VIEW */}
      {isNotDesktop ? (
        <VStack
          w="100%"
          pt={5}
          alignItems="center"
          paddingInline={5}
          bg={Colors.MINE_SHAFT}
          h={{ base: isDemoUser ? '800px' : '100%', sm: isDemoUser ? '700px' : '100%' }}
        >
          <VStack alignItems="start" spacing={4} rowGap="5px" pl={5} pb="30px">
            {/* FIRST SECTION - CURRENT MISSIONS */}
            <HStack justifyContent="space-between" flexWrap="wrap" gap="30px">
              <MissionsCrafts />
              <MissionCountdown mission={currentMissions[0]} />
            </HStack>
            {/* SECOND SECTION - MISSIONS BALANCES */}
            <TriliumBSCBalance />
            <StakedTriliumBalance />
            <MissionRewardsBalance />
          </VStack>
          {/* THIRD SECTION - ACTIONS */}
          <ActionButtons />
        </VStack>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <Flex
            w="100%"
            h="100%"
            alignItems="center"
            bg={Colors.MINE_SHAFT}
            justifyContent="space-between"
            paddingInline={isMediumScreen ? '50px' : '20px'}
          >
            {/* FIRST SECTION - CURRENT MISSIONS */}
            <HStack gap="30px" flexWrap="wrap" w="20%">
              <MissionsCrafts />
              <MissionCountdown mission={currentMissions[0]} />
            </HStack>
            {/* SECOND SECTION - MISSIONS BALANCES */}
            <HStack gap={5} rowGap={5} flexWrap="wrap" w="50%">
              <TriliumBSCBalance />
              <StakedTriliumBalance />
              <MissionRewardsBalance />
            </HStack>
            {/* THIRD SECTION - ACTIONS */}
            <HStack w="30%" justifyContent="end" h="75%">
              <ActionButtons />
            </HStack>
          </Flex>
        </>
      )}
    </>
  )
}
