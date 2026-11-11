import { VFC } from 'react'

import { BSCIcon } from '@alien-worlds/icons'
import { Box, Flex, VStack, Text } from '@chakra-ui/react'
import { useBscWalletStore } from 'features/missions/store/bscWalletStore'
import { Colors } from 'shared/util/colors'

export const TriliumBSCBalance: VFC = () => {
  const bscTlmBalanceFormatted = useBscWalletStore((state) => state.bscTlmBalanceFormatted)

  return (
    <Flex
      ml="10px"
      fontSize="sm"
      align="center"
      justify="center"
      fontWeight="semibold"
      gap={2}
      color={Colors.DI_SERRIA}
      fill={Colors.DI_SERRIA}
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
            {bscTlmBalanceFormatted}
          </Text>
        </Box>
        <Text
          pt="3px"
          fontFamily="Titillium Web"
          fontWeight="bold"
          fontSize={12}
          letterSpacing="0.1em"
          color={Colors.DI_SERRIA}
        >
          BSC Trilium Balance
        </Text>
      </VStack>
    </Flex>
  )
}
