import { useEffect, useState, VFC } from 'react'

import { HStack, VStack, Text } from '@chakra-ui/react'
import { find } from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'

export const PlanetaryVotePowerReceived: VFC = () => {
  const {
    wax: { selectedDacCandidates, walletId },
  } = useAppState()

  const [receivedVotePower, setReceivedVotePower] = useState<number | null>(null)

  useEffect(() => {
    if (selectedDacCandidates?.length > 0) {
      const rVotePower = find(selectedDacCandidates, (c) => c.account === walletId)?.votePower

      setReceivedVotePower(rVotePower)
    }
  }, [])

  return (
    <HStack display="flex" alignItems="flex-start" justifyContent="start">
      <VStack alignItems="start">
        <Text fontSize={20} fontFamily="orb" w="110px" textAlign="start">
          {formatNumber(receivedVotePower, 0, 0)}
        </Text>
        <Text
          w="110px"
          fontSize={12}
          fontFamily="tlm"
          fontWeight={600}
          lineHeight={0.1}
          textAlign="start"
          color={Colors.CARIBBEAN_GREEN}
        >
          Received Vote Power
        </Text>
      </VStack>
    </HStack>
  )
}
