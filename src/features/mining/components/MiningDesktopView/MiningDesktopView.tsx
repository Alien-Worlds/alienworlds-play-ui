import { VFC } from 'react'

import { Box, Flex, Grid, HStack, VStack } from '@chakra-ui/react'
import { ChargeTime } from 'features/mining/components/PlanetLand/Components/ChargeTime'
import { LandCharge } from 'features/mining/components/PlanetLand/Components/LandCharge'
import { LandCommission } from 'features/mining/components/PlanetLand/Components/LandCommission'
import { MiningPower } from 'features/mining/components/PlanetLand/Components/MiningPower'
import { NftLuck } from 'features/mining/components/PlanetLand/Components/NftLuck'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { PlanetTitle } from 'features/mining/components/PlanetLand/Components/PlanetTitle'
import { PowReduction } from 'features/mining/components/PlanetLand/Components/PowReduction'
import { PlanetImageSizes } from 'features/mining/utils/planet'
import { ClaimMineRewardsBtn } from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'

export const MiningDesktopView: VFC = () => {
  const {
    atomic: { landAsset },
    wax: { planetSelectedForMining, isDemoUser },
  } = useAppState()
  const { isMediumScreen, isNotDesktop } = useScreenSize()

  return (
    <>
      {/* MOBILE VIEW */}
      {isNotDesktop ? (
        <VStack
          pt={5}
          w="100%"
          paddingInline={5}
          bg={Colors.MINE_SHAFT}
          h={isDemoUser ? '600px' : '100%'}
        >
          {/* FIRST SECTION - PLANET & LAND */}
          <HStack w="100%" justifyContent="center" gap={5}>
            <HStack alignItems="start" justifyContent="center" w="100%" gap={5}>
              <Box w="90px" pb="30px" mr="15px">
                <PlanetImage
                  titleDisplay="none"
                  showLandIndicator
                  land={landAsset}
                  dacId={planetSelectedForMining}
                  imageSize={PlanetImageSizes.LARGE}
                />
              </Box>
              <VStack alignItems="start">
                <PlanetTitle land={landAsset} />
                <LandCharge land={landAsset} />
                <Flex mr="-25px">
                  <LandCommission land={landAsset} size="20px" />
                </Flex>
              </VStack>
            </HStack>
          </HStack>
          {/* SECOND SECTION - ACTIONS */}
          <VStack w="100%" pt={5} pb="30px" gap={5} alignItems="center" justifyContent="center">
            <ClaimMineRewardsBtn />
          </VStack>
          {/* THIRD SECTION - STATS */}
          <Grid columnGap="10px" rowGap="25px" alignItems="center" templateColumns="repeat(2, 1fr)">
            <ChargeTime />
            <MiningPower />
            <NftLuck />
            <PowReduction />
          </Grid>
        </VStack>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <HStack
            h="98%"
            w="100%"
            alignItems="center"
            justifyContent="start"
            bg={Colors.MINE_SHAFT}
            paddingInline={isMediumScreen ? '50px' : '20px'}
          >
            {/* FIRST SECTION - PLANET & LAND */}
            <HStack w="300px" justifyContent="start" gap="10px" ml="60px">
              <VStack w="120px" h="100%" mr="10px" pb="25px" justifyContent="center">
                <PlanetImage
                  boxSize="100px"
                  titleDisplay="none"
                  showLandIndicator
                  land={landAsset}
                  dacId={planetSelectedForMining}
                  imageSize={PlanetImageSizes.LARGE}
                />
              </VStack>
              <VStack w="300px" alignItems="start">
                <PlanetTitle land={landAsset} />
                <LandCharge land={landAsset} />
                <LandCommission land={landAsset} size="20px" />
              </VStack>
            </HStack>

            {/* SECOND SECTION - STATS */}
            <Grid
              w="500px"
              pt="30px"
              rowGap="15px"
              columnGap="60px"
              alignItems="center"
              templateColumns="repeat(2, 1fr)"
            >
              <Flex h="70px" alignItems="start">
                <ChargeTime />
              </Flex>
              <Flex h="70px" alignItems="start">
                <MiningPower />
              </Flex>
              <Flex h="70px" alignItems="start">
                <PowReduction />
              </Flex>
              <Flex h="70px" alignItems="start">
                <NftLuck />
              </Flex>
            </Grid>

            {/* THIRD SECTION - ACTIONS */}
            <HStack
              h="75%"
              w="60%"
              pt="6px"
              gap={5}
              flexWrap="wrap"
              alignItems="center"
              justifyContent="end"
            >
              <ClaimMineRewardsBtn />
            </HStack>
          </HStack>
        </>
      )}
    </>
  )
}
