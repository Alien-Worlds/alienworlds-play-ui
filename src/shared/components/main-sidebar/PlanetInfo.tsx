import { getNftImage } from 'shared/util/nft'
import { formatNumber } from 'shared/util/numbers'

import { VFC } from 'react'

import { FillRateOldIcon, ProfitsIcon, StackingIcon, WaxIcon } from '@alien-worlds/icons'
import { Avatar, Box, Flex, Icon, Text, Tooltip } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { useNavigate } from 'react-router-dom'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const PlanetInfo: VFC = () => {
  const {
    atomic: { landAsset },
    wax: { planetSelectedForMining },
  } = useAppState()

  const navigate = useNavigate()
  const { planetDetails: miningPlanet, loading } = usePlanetDetail(planetSelectedForMining)

  if (loading) return <LoadingSpinner />
  if (miningPlanet === null) {
    return <></>
  }

  return (
    <Flex alignItems="center" color="white">
      <Box
        w={16}
        h={16}
        position="relative"
        onClick={() => navigate(PagePath.Land)}
        cursor="pointer"
      >
        <Box mt="-5px">
          <PlanetImage
            titleDisplay="none"
            dacId={planetSelectedForMining}
            maxW={{ base: '50px', sm: '50px' }}
          />
        </Box>
        {landAsset && (
          <Avatar
            w="37px"
            h="37px"
            left={5}
            mt="-20px"
            borderColor="white"
            borderWidth="2px"
            position="absolute"
            src={getNftImage(landAsset)}
          />
        )}
      </Box>

      <Flex direction="column" pl={2} letterSpacing="0.05em" fontWeight={500}>
        <Flex align="center">
          <Text fontFamily="Orbitron" lineHeight={1} mr={2}>
            {miningPlanet?.planet_details.title}{' '}
          </Text>
          {landAsset && (
            <>
              ({`${landAsset?.data?.x}:${landAsset?.data?.y}`}
              <Icon as={StackingIcon} boxSize={16} color={Colors.SNOW_WHITE} />)
            </>
          )}
        </Flex>
        <Text fontSize="sm" fontFamily="Titillium Web" color="whiteAlpha.800" fontWeight={600}>
          {landAsset?.name}
        </Text>
        <Flex alignItems="center" color={Colors.DI_SERRIA}>
          <WaxIcon boxSize={17} />

          <Text ml={1} fontFamily="Orbitron">
            {`${formatNumber(miningPlanet?.planet_mining_details.mine_bucket.split('.')[0])} TLM`}
          </Text>
        </Flex>
        <Flex alignItems="center" color={Colors.CARIBBEAN_GREEN}>
          <FillRateOldIcon boxSize={22} color={Colors.CARIBBEAN_GREEN} />

          <Text ml={1} fontFamily="Orbitron">
            {`${formatNumber(
              parseInt(miningPlanet?.planet_mining_details.fill_rate.split('.')[0], 10) / 10000,
              4,
              4
            )} TLM/s`}
          </Text>
        </Flex>
        {landAsset?.mutable_data?.commission !== undefined && (
          <Flex alignItems="center" fill={Colors.SNOW_WHITE}>
            <ProfitsIcon boxSize={20} color={Colors.SNOW_WHITE} />

            <Tooltip label="Percentage landowner takes from your mining rewards.">
              <Text ml={1} fontFamily="Orbitron">
                %{landAsset?.mutable_data?.commission / 100}
              </Text>
            </Tooltip>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export { PlanetInfo }
