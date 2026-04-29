import { VFC } from 'react'

import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize, get, replace, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { PlanetIcon } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'

export const PlanetaryBalances: VFC = () => {
  const {
    wax: { selectedDacId, walletId },
  } = useAppState()
  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })

  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const loading = daoDetailsLoading || walletDaoDetailsLoading

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <HStack pl={2} w="100%" display="flex" alignItems="center" justifyContent="start">
      <Box position="relative">
        <PlanetIcon
          planetName={daoDetails?.title}
          style={{
            top: 42,
            bottom: 0,
            zIndex: 3,
            right: 10,
            width: 48,
            height: 48,
          }}
        />
      </Box>
      <VStack alignItems="start">
        <Flex h="35px" mb="-5px" direction="row" alignItems="baseline" justifyContent="flex-start">
          <Text
            fontFamily="orb"
            fontSize={20}
            fontWeight={400}
            color={Colors.SNOW_WHITE}
            display="inline-block"
          >
            {formatNumber(planetStakes, 4, 4)}
          </Text>
          <Text
            ml={2}
            fontFamily="orb"
            fontSize={20}
            fontWeight={600}
            background={getPlanetGradient(daoDetails?.title)}
            backgroundClip="text"
          >
            TLM
          </Text>
        </Flex>
        <Text fontFamily="tlm" fontSize={12} fontWeight={600} lineHeight={0.1}>
          Available TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
        </Text>
      </VStack>
    </HStack>
  )
}
