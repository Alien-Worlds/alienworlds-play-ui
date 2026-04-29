import { VFC } from 'react'

import { WaxIcon } from '@alien-worlds/icons'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'

const BalanceTlmTop: VFC = () => {
  const {
    wax: { walletId },
  } = useAppState()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  if (loading) return <LoadingSpinner />
  return (
    <motion.div {...pageTransition}>
      <Flex
        alignItems="center"
        color={Colors.DI_SERRIA}
        alignSelf="center"
        position="relative"
        height="100%"
      >
        <HStack>
          <Flex alignItems="center" justifyContent="center" h="30px">
            <WaxIcon color={Colors.DI_SERRIA} boxSize={35} />
          </Flex>
          <Flex direction="column" alignItems="start">
            <Text
              mb="-3px"
              ml="5px"
              fontSize={12}
              fontFamily="tlm"
              fontWeight={700}
              textAlign="center"
              color={Colors.DI_SERRIA}
            >
              WAX Trillium Balance
            </Text>
            <Text
              ml="5px"
              fontSize={20}
              fontWeight={400}
              fontFamily="orb"
              textAlign="center"
              letterSpacing="0.1em"
              color={Colors.SNOW_WHITE}
            >
              {formatNumber(walletDetails.tlm_balance, 4, 4)}
            </Text>
          </Flex>
        </HStack>
      </Flex>
    </motion.div>
  )
}

export { BalanceTlmTop }
