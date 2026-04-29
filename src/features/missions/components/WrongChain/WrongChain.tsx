import { VFC } from 'react'

import { BinanceChainIcon } from '@alien-worlds/icons'
import { Center, chakra, Text, VStack } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

const WrongChain: VFC = () => {
  return (
    <Center marginTop={80}>
      <VStack>
        <Text fontFamily="Titillium Web" fontSize="xl" fontWeight={700} mb={2}>
          Make sure you are connected to the
          <br />
          <chakra.span color={Colors.BUTTERCUP} letterSpacing="2px">
            Binance Smart Chain Network
          </chakra.span>
        </Text>

        <BinanceChainIcon boxSize={44} color={Colors.BUTTERCUP} />
      </VStack>
    </Center>
  )
}

export { WrongChain }
