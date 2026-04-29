import { VFC } from 'react'

import { TotalVotePowerIcon } from '@alien-worlds/icons'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse } from 'graphql/types'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'

export const PlanetaryVotePower: VFC = () => {
  const {
    wax: { walletId, selectedDacId },
  } = useAppState()
  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  if (walletDaoDetailsLoading) return <LoadingSpinner inline />
  const votePower = walletDaoDetails?.vote_weight?.weight
  return (
    <HStack pl={2} display="flex" alignItems="flex-start" justifyContent="start" w="100%">
      <Box position="relative">
        <TotalVotePowerIcon
          style={{
            top: 42,
            bottom: 0,
            zIndex: 3,
            right: 10,
            width: 48,
            height: 48,
            color: Colors.CARIBBEAN_GREEN,
          }}
        />
      </Box>
      <VStack alignItems="start">
        <Text fontSize={20} fontFamily="orb">
          {formatNumber(votePower, 4, 4)}
        </Text>
        <Text
          fontSize={12}
          fontFamily="tlm"
          fontWeight={600}
          lineHeight={0.1}
          color={Colors.CARIBBEAN_GREEN}
        >
          Vote Power
        </Text>
      </VStack>
    </HStack>
  )
}
