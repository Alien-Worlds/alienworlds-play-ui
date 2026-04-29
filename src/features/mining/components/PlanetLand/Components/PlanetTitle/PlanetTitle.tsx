import { HStack, Text, VStack } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

export const PlanetTitle = ({ land }: { land: IAsset }) => {
  const {
    wax: { planetSelectedForMining },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  if (loading) return <LoadingSpinner />
  if (!planetSelectedForMining) return <></>

  return (
    <VStack alignItems="start" justifyContent="start" gap={0}>
      <HStack>
        <Text
          fontSize={20}
          fontFamily="tlm"
          fontWeight={600}
          textAlign="start"
          letterSpacing="0.1em"
          color={Colors.SNOW_WHITE}
        >
          {planetDetails?.planet_details.title}
        </Text>
        <Text color={Colors.SNOW_WHITE} fontSize="20px" fontWeight={600} fontFamily="tlm">
          {`(${land?.data?.x || 0}:${land?.data?.y || 0})`}
        </Text>
      </HStack>
      <Text
        fontSize="12px"
        fontFamily="tlm"
        fontWeight={400}
        textAlign="start"
        letterSpacing="0.1em"
        color={Colors.SILVER}
      >
        {land?.name?.split(' on ')?.[0]}
      </Text>
    </VStack>
  )
}
