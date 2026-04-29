import { VFC } from 'react'

import { BSCLockIcon } from '@alien-worlds/icons'
import { Box, Flex, VStack, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

export const StakedTriliumBalance: VFC = () => {
  const {
    web3: { bscStakedTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex
      align="center"
      justify="center"
      color={Colors.SECONDARY_RED}
      fill={Colors.SECONDARY_RED}
      fontWeight="semibold"
      gap={2}
      fontSize="sm"
    >
      <BSCLockIcon style={{ marginRight: 4 }} boxSize={40} fill="transparent" />

      <VStack alignItems="start">
        <Box mb="-15px">
          <Text
            fontSize={{ base: '14px', md: '20px' }}
            fontWeight={400}
            fontFamily="orb"
            color={Colors.SNOW_WHITE}
          >
            {bscStakedTlmBalanceFormatted ?? '0.0'}
          </Text>
        </Box>
        <Text
          pt="2px"
          fontFamily="Titillium Web"
          fontWeight="bold"
          fontSize={12}
          letterSpacing="0.1em"
          color={Colors.RADICAL_RED}
        >
          BNB Trilium Staked
        </Text>
      </VStack>
    </Flex>
  )
}
