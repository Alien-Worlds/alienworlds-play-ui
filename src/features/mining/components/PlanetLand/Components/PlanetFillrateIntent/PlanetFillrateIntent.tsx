import { formatNumber } from 'shared/util/numbers'

import { VFC } from 'react'

import { Box, Flex, Text } from '@chakra-ui/react'
import { ReactComponent as FillrateIcon } from 'assets/images/alienworlds-db-icon-fillrate.svg'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { useAppState } from 'store'

const PlanetFillrateIntent: VFC = () => {
  const {
    wax: { whereToMine },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(whereToMine)
  if (loading) return <LoadingSpinner />
  if (!planetDetails) return <></>

  return (
    <Flex alignItems="flex-start" color="#00baff">
      <Box w="31px" minW="31px" position="relative" fill="#00baff">
        <FillrateIcon />
      </Box>
      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white" whiteSpace="nowrap">
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

export { PlanetFillrateIntent }
