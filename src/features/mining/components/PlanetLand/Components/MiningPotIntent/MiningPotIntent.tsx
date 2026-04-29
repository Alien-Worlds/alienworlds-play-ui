import { formatNumber } from 'shared/util/numbers'

import { VFC } from 'react'

import { WaxIcon } from '@alien-worlds/icons'
import { Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { useAppState } from 'store'

const MiningPotIntent: VFC = () => {
  const {
    wax: { whereToMine },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(whereToMine)
  if (loading) return <LoadingSpinner />
  if (!planetDetails) return <></>

  return (
    <Flex alignItems="flex-start" color={Colors.CARIBBEAN_GREEN}>
      <WaxIcon boxSize={31} style={{ position: 'relative' }} color={Colors.CARIBBEAN_GREEN} />

      <Flex direction="column" alignItems="flex-start" ml={4}>
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white">
          {formatNumber(planetDetails.planet_mining_details.bucket_total)} TLM
        </Text>
        <Text fontFamily="Titillium Web" fontWeight="bold" fontSize="sm" letterSpacing="0.1em">
          Current Mining Pot
        </Text>
      </Flex>
    </Flex>
  )
}

export { MiningPotIntent }
