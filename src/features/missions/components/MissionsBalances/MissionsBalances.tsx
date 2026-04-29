import { BSCIcon, BSCLockIcon } from '@alien-worlds/icons'
import { Flex, Text, Box, VStack } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'

export const AvailableTriliumBalance = () => {
  const {
    web3: { bscTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex align="center" color={Colors.DI_SERRIA} fill={Colors.DI_SERRIA} fontSize="md" gap={2}>
      <Text>Your available Trilium</Text>

      <BSCIcon boxSize={22} style={{ marginRight: 16, marginLeft: 16 }} />

      <Text fontSize="xl" fontWeight={400} fontFamily="orb">
        {bscTlmBalanceFormatted ?? '0.0'}
      </Text>
    </Flex>
  )
}

export const StakedTriliumBalance = () => {
  const {
    web3: { bscStakedTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex
      align="center"
      color={Colors.SECONDARY_RED}
      fill={Colors.SECONDARY_RED}
      fontWeight="semibold"
      fontSize="md"
    >
      <Flex display={{ base: 'none', lg: 'initial' }}>
        <GlossaryInfoIcon
          width={16}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.MISSIONS_INFO_TLM_LOCKED}
        />
      </Flex>
      <Text py="10px" pl="5px">
        Your staked Trilium
      </Text>
      <Flex display={{ base: 'initial', lg: 'none' }} pl="5px">
        <GlossaryInfoIcon
          width={16}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.MISSIONS_INFO_TLM_LOCKED}
        />
      </Flex>
      <Box w={6} mx={4}>
        <BSCLockIcon boxSize={24} fill="transparent" />
      </Box>
      <Text fontSize="xl" fontWeight={400} fontFamily="orb">
        {bscStakedTlmBalanceFormatted ?? '0.0'}
      </Text>
    </Flex>
  )
}

export const MissionRewardsBalance = () => {
  const {
    missions: { totalMissionsRewards },
  } = useAppState()

  return (
    <Flex
      fontSize="sm"
      align="center"
      justify="center"
      fontWeight="semibold"
      gap={2}
      color={Colors.CARIBBEAN_GREEN}
      fill={Colors.CARIBBEAN_GREEN}
    >
      <BSCIcon boxSize={40} style={{ marginRight: '15px' }} />

      <VStack alignItems="start">
        <Box mb="-15px">
          <Text
            fontSize={{ base: '14px', md: '20px' }}
            fontWeight={400}
            fontFamily="orb"
            color={Colors.SNOW_WHITE}
          >
            {formatNumber(totalMissionsRewards, 4, 4)}
          </Text>
        </Box>
        <Text
          fontSize="medium"
          fontWeight="normal"
          fontFamily="Titillium Web"
          color={Colors.CARIBBEAN_GREEN}
        >
          Total Rewards
        </Text>
      </VStack>
    </Flex>
  )
}
