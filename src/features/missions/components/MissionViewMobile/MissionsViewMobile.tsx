import { BSCIcon, BSCLockIcon, BinanceChainIcon, MissionCraftIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, HStack, Text, chakra, Hide } from '@chakra-ui/react'
import { ConnectWalletBtn } from 'features/missions/components/MissionsActions'
import { useWalletConnect } from 'features/missions/components/MissionsActions/MissionsActions'
import { WrongChain } from 'features/missions/components/WrongChain'
import { filter, get } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { MissionStatus } from 'store/missions/types'

export const MissionsViewMobile = () => {
  const wallet = useWalletConnect()
  const {
    web3: { bscTlmBalanceFormatted, bscStakedTlmBalanceFormatted },
    missions: { explorer, availableMissions, totalMissionsRewards },
  } = useAppState()
  const navigate = useNavigate()
  if (wallet.connectedChain && parseInt(wallet.connectedChain.id, 16) !== config.BscChainId)
    return <WrongChain />

  if (wallet.connectedWallets.length === 0 || wallet.connecting) {
    return (
      <Box>
        <Hide below="md">
          <Flex flexDirection="column" alignItems="center" gap={4}>
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
        </Hide>
        <Hide above="md">
          <Flex flexDirection="column" alignItems="center" gap={4}>
            <BinanceChainIcon boxSize={48} color={Colors.BUTTERCUP} />
            <Text
              fontFamily="Titillium Web"
              fontSize="16px"
              textAlign="center"
              fontWeight={700}
              mb={2}
            >
              Make sure you are connected to the
              <br />
              <chakra.span color={Colors.BUTTERCUP}>Binance Smart Chain Network</chakra.span>
            </Text>
            <ConnectWalletBtn onClick={() => wallet.connect()} />
          </Flex>
        </Hide>
      </Box>
    )
  }
  return (
    <Flex
      width="100%"
      justifyContent="center"
      alignItems="center"
      p="16px"
      direction="column"
      gap={2}
    >
      <Text fontFamily="orb" fontSize="14px" fontWeight={400} color={Colors.SILVER}>
        Finishing in
      </Text>
      <Text color={Colors.WEB_ORANGE} fontFamily="orb" fontSize="20px" fontWeight={600}>
        6d 21h 32m 37s
      </Text>
      <Flex
        direction="column"
        borderRadius="12px"
        p="16px"
        backgroundColor={Colors.COD_GRAY}
        width="100%"
        gap={2}
      >
        <Flex justifyContent="space-between" width="100%">
          <HStack>
            <MissionCraftIcon boxSize="18px" color={Colors.SNOW_WHITE} />
            <Text fontFamily="tlm" fontSize="12px" fontWeight={700} color={Colors.DODGE_BLUE}>
              On Missions
            </Text>
          </HStack>
          <Text
            fontSize="14px"
            lineHeight={1}
            fontFamily="Orbitron"
            fontWeight={700}
            color={Colors.SNOW_WHITE}
          >
            {
              filter(
                get(explorer, 'attributes.missions', []),
                (m) => m.view.status === MissionStatus.Departed
              )?.length
            }{' '}
            / {availableMissions?.length ?? 0}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <HStack>
            <BSCIcon boxSize="18px" color={Colors.DI_SERRIA} />
            <Text fontFamily="tlm" fontSize="12px" fontWeight={700} color={Colors.DI_SERRIA}>
              BSC TLM Balance
            </Text>
          </HStack>
          <Text
            fontSize="14px"
            lineHeight={1}
            fontFamily="Orbitron"
            fontWeight={700}
            color={Colors.SNOW_WHITE}
          >
            {bscTlmBalanceFormatted}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <HStack>
            <BSCIcon boxSize="18px" color={Colors.CARIBBEAN_GREEN} />
            <Text fontFamily="tlm" fontSize="12px" fontWeight={700} color={Colors.CARIBBEAN_GREEN}>
              Total Reward
            </Text>
          </HStack>
          <Text
            fontSize="14px"
            lineHeight={1}
            fontFamily="Orbitron"
            fontWeight={700}
            color={Colors.SNOW_WHITE}
          >
            {formatNumber(totalMissionsRewards, 4, 4)}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <HStack>
            <BSCLockIcon boxSize="18px" color={Colors.RADICAL_RED} />
            <Text fontFamily="tlm" fontSize="12px" fontWeight={700} color={Colors.RADICAL_RED}>
              Total Staked TLM
            </Text>
          </HStack>
          <Text
            fontSize="14px"
            lineHeight={1}
            fontFamily="Orbitron"
            fontWeight={700}
            color={Colors.SNOW_WHITE}
          >
            {bscStakedTlmBalanceFormatted ?? '0.0'}
          </Text>
        </Flex>
      </Flex>
      <Box width="100%">
        <Button
          variant="tertiary"
          size="lg"
          fontSize={16}
          fontFamily="Orbitron"
          isFullWidth
          onClick={() => navigate(PagePath.Missions)}
        >
          Open Mission Center
        </Button>
      </Box>
    </Flex>
  )
}
