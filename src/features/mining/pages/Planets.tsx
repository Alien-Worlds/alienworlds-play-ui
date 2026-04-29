import { useEffect, useState } from 'react'

import { ForwardIcon } from '@alien-worlds/icons'
import { Box, Flex, SimpleGrid, Text, Link, Hide } from '@chakra-ui/react'
import { MiningSelect } from 'features/mining/components/MiningSelect/MiningSelect'
import { MiningTabPanelMotion } from 'features/mining/components/MiningTabs'
import { OptionalMiningTabs } from 'features/mining/components/OptionalMiningTabs'
import { LandImage } from 'features/mining/components/PlanetLand/Components/LandImage'
import { PlanetButtons } from 'features/mining/components/PlanetLand/Components/PlanetButtons'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { RarityPoolsHorizontalBar } from 'features/mining/components/RarityPoolsHorizontalBar'
import { PlanetDetailsDrawer } from 'features/mining/modals/PlanetDetailsDrawer'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { usePlanets } from 'graphql/hooks/usePlanets'
import { PlanetDetailsResponse } from 'graphql/types'
import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'
import {
  RingPositionHelper,
  RingPositions,
} from 'shared/components/RingPositionHelper/RingPositionHelper'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

const Planets = () => {
  const {
    wax: { setPlanetSelectedForMiningIntent, setPlanetNameForMiningIntent },
    main: {
      showPlanetPage,
      mining: { openPlanetDetailsDrawer, closePlanetDetailsDrawer },
    },
  } = useActions()
  const {
    atomic: { landAsset },
    main: { planetDetailsDrawer },
    wax: { planetSelectedForMining, isOnboarded },
  } = useAppState()

  const navigate = useNavigate()

  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDetailsResponse>(null)
  const [planetSelectedForInfo, setPlanetSelectedForInfo] = useState<PlanetDetailsResponse>()

  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  const { filteredPlanets, loading: planetLoading } = usePlanets()

  useEffect(() => {
    showPlanetPage()
  }, [])

  if (loading && planetLoading) return <LoadingSpinner />
  return (
    <Flex
      direction="column"
      alignItems="start"
      w={{ base: 'full', md: 'auto' }}
      px={{ base: '18px', md: 6 }}
    >
      {!isOnboarded && (
        <Flex
          mb={5}
          top={20}
          right={12}
          cursor="pointer"
          position="absolute"
          transform="rotateY(180deg)"
        >
          <ForwardIcon
            boxSize={30}
            onClick={() => {
              navigate(PagePath.Onboarding)
            }}
          />
        </Flex>
      )}

      <Box w="full" display={{ base: 'block', md: 'none' }}>
        <MiningSelect />
      </Box>
      <Box textAlign="start" mb={5} display={{ base: 'none', md: 'block' }}>
        <OptionalMiningTabs />
      </Box>

      <MiningTabPanelMotion w="100%">
        <Hide below="md">
          <Flex justifyContent="end" alignItems="center" w="full">
            <Flex
              w="100%"
              direction="column"
              marginBlockStart={{ base: 2, sm: 6 }}
              alignItems="flex-start"
              px={{ base: '0px', lg: '0px' }}
              justifyContent="flex-start"
            >
              <Text
                as="h2"
                mb={{ base: '10px', md: '20px' }}
                color="white"
                fontFamily="orb"
                fontWeight={{ base: 'bold', md: 'normal' }}
                fontSize={{ base: 'md', md: '30px' }}
              >
                Select a Planet to Mine on
                {/* @TODO: add Planets Glossary link */}
                {/* <GlossaryInfoIcon
                ml={5}
                width={0}
                height={0}
                color={Colors.SNOW_WHITE}
                glossaryId={TooltipLocations.GOVERNANCE_PLANET_DETAILS}
              /> */}
              </Text>
              <Text
                fontFamily="Titillium Web"
                fontWeight="thin"
                color={Colors.ALTO}
                w={{ base: '100%', lg: '70%' }}
              >
                Land is a series of NFTs in Alien Worlds which represent parcels of land on the
                Planets in Alien Worlds. If you own Land, you can either mine it yourself or charge
                people who mine on your Land commission.{' '}
                <Link
                  color={Colors.DARK_YELLOW}
                  href="https://alienworlds.medium.com/how-to-mine-on-alien-worlds-b8ee8e1b302"
                >
                  Read more
                </Link>
                .
              </Text>

              {planetSelectedForMining && <RarityPoolsHorizontalBar planet={planetDetails} />}
            </Flex>
          </Flex>
        </Hide>

        <SimpleGrid
          mt={{ base: 12, md: 0 }}
          mb="75px"
          width="full"
          spacing={24}
          justifyItems="center"
          alignItems="flex-start"
          columns={{ base: 1, md: 2, xl: 3 }}
          rowGap={{ base: '0px', sm: '2xl', md: '160px', lg: '90px' }}
        >
          {filteredPlanets &&
            map(filteredPlanets, (planet) => (
              <Box
                key={planet.planet_details.title}
                w={{ base: '80%', sm: 56 }}
                h={{ base: 'min-content', sm: 56 }}
                position="relative"
              >
                <PlanetImage
                  key={planet.id}
                  dacId={planet.id}
                  planet={planet}
                  isSelected={planet === selectedPlanet}
                  interactive
                  showHeading
                  showShadowGradient
                  isHovered={planetSelectedForInfo?.id === planet.id}
                  w="full"
                  minW={{ base: 48, sm: 56 }}
                  minH={{ base: 48, sm: 56 }}
                  hasPlanetIcon
                  titleProps={{
                    fontSize: {
                      base: 'lg',
                      sm: 'xl',
                      md: '2xl',
                    },
                  }}
                  onMouseEnter={() => {
                    // setPlanetSelectedForInfo(planet)
                  }}
                  onClick={() => {
                    setSelectedPlanet(planet)
                    setPlanetSelectedForInfo(planet)
                    setPlanetNameForMiningIntent(planet.planet_details.planet_name)
                    setPlanetSelectedForMiningIntent(planet.id)
                  }}
                  miningRing
                />
                {!(planetSelectedForInfo?.id === planet.id) &&
                  landAsset &&
                  planetSelectedForMining === planet.id && (
                    <RingPositionHelper
                      posXY={RingPositions.CENTER}
                      zIndex={2000}
                      pointerEvents="none"
                    >
                      <LandImage
                        land={landAsset}
                        zIndex={1700}
                        w={{ base: 20 }}
                        h={{ base: 20 }}
                        position="relative"
                        m={0}
                        p={0}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        pointerEvents="none"
                      />
                    </RingPositionHelper>
                  )}

                <PlanetButtons
                  zIndex={2100}
                  onDetailsBtnClick={() => {
                    setPlanetSelectedForInfo(planet)
                    openPlanetDetailsDrawer()
                  }}
                  onExploreBtnClick={() => {
                    setPlanetNameForMiningIntent()
                    setPlanetSelectedForMiningIntent(planet.id)
                  }}
                />
              </Box>
            ))}
        </SimpleGrid>
      </MiningTabPanelMotion>
      <PlanetDetailsDrawer
        planet={planetSelectedForInfo?.id}
        isOpen={planetDetailsDrawer.isOpen}
        onClose={() => closePlanetDetailsDrawer()}
      />
    </Flex>
  )
}

export { Planets }
