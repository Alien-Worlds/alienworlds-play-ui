import { formatNumber } from 'shared/util/numbers'

import { VFC } from 'react'

import { FillRateOldIcon } from '@alien-worlds/icons'
import { Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { useAppState } from 'store'

const PlanetFillrate: VFC = () => {
  const {
    wax: { planetSelectedForMining },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  if (loading) return <LoadingSpinner />
  if (!planetDetails) return <></>

  return (
    <Flex alignItems="flex-start" color={Colors.CARIBBEAN_GREEN}>
      <FillRateOldIcon
        boxSize={31}
        style={{ position: 'relative' }}
        color={Colors.CARIBBEAN_GREEN}
      />

      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white">
          {`${formatNumber(
            parseInt(planetDetails.planet_mining_details.fill_rate.split('.')[0], 10) / 10000,
            4,
            4
          )} TLM/s`}
        </Text>
        <Text fontFamily="Titillium Web" fontWeight="bold" fontSize="sm" letterSpacing="0.1em">
          Fillrate
        </Text>
      </Flex>
    </Flex>
  )
}

export { PlanetFillrate }
