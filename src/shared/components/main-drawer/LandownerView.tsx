import { useEffect, useState, VFC } from 'react'

import { Box, Flex, HStack, VStack, Divider, Text, Grid } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandImage } from 'features/mining/components/LandOwners/Components/LandImage/LandImage'
import { LandBoosts } from 'features/mining/components/PlanetLand/Components/LandBoosts'
import { LandCommission } from 'features/mining/components/PlanetLand/Components/LandCommission'
import { LandCoordinates } from 'features/mining/components/PlanetLand/Components/LandCoordinates'
import { LandRating } from 'features/mining/components/PlanetLand/Components/LandRating'
import {
  SetLandBtn,
  ManageLandBtn,
  ClaimDTALRewardsBtn,
  ClaimCommissionRewardsBtn,
} from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { filter, forEach } from 'lodash'
import Carousel from 'react-spring-3d-carousel'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { PlanetLandIcon } from 'shared/util/icons'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

export const LandownerView: VFC = () => {
  const {
    wax: { isDemoUser },
    atomic: { landAsset, ownedLandsAssets },
  } = useAppState()
  const {
    wax: { setLandId, setManagingLandDetails, loadManagingLandDetailsAndBoosts },
  } = useActions()
  const { isMediumScreen, isTablet, isNotDesktop } = useScreenSize()
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [currentLand, setCurrentLand] = useState<IAsset>(null)
  const [managingLands, setManagingLands] = useState<IAsset[]>([])

  const CarouselSlide = ({
    ownedLand,
    onClick,
  }: {
    ownedLand: IAsset
    onClick: () => void
  }): JSX.Element => {
    return (
      <VStack w="100px" mr={5} key={v4()} cursor="pointer" onClick={onClick}>
        <Box m={0} w="100px" borderRadius="full" borderColor={Colors.SNOW_WHITE}>
          <LandImage landAsset={ownedLand} showPlanetIndicator={false} />
        </Box>
        <Text
          fontSize={16}
          fontFamily="tlm"
          fontWeight={500}
          textAlign="center"
          letterSpacing="0.1em"
          color={Colors.SNOW_WHITE}
        >
          {`${ownedLand?.data?.x || 0}:${ownedLand?.data?.y || 0}`}
        </Text>
      </VStack>
    )
  }

  useEffect(() => {
    if (ownedLandsAssets && ownedLandsAssets[0]) {
      setCurrentLand(ownedLandsAssets[0])
      setLandId(ownedLandsAssets[0].asset_id)
      setManagingLandDetails()
      loadManagingLandDetailsAndBoosts()
    }
  }, [ownedLandsAssets])

  useEffect(() => {
    const slidesTmp = []

    // Set Lands carousel slides
    if (ownedLandsAssets) {
      forEach(ownedLandsAssets, (ownedLand: IAsset, index: number) =>
        slidesTmp.push({
          key: v4(),
          land: ownedLand,
          content: (
            <CarouselSlide
              ownedLand={ownedLand}
              onClick={() => {
                setLandId(ownedLand.asset_id)
                setManagingLandDetails()
                loadManagingLandDetailsAndBoosts()
                setCurrentLand(ownedLand)
                setCurrentSlide(index)
              }}
            />
          ),
        })
      )
    }

    if (slidesTmp && slidesTmp.length === 2) {
      slidesTmp.push({
        key: v4(),
        land: ownedLandsAssets[0],
        content: (
          <CarouselSlide
            ownedLand={ownedLandsAssets[0]}
            onClick={() => {
              setLandId(ownedLandsAssets[0].asset_id)
              setManagingLandDetails()
              loadManagingLandDetailsAndBoosts()
              setCurrentLand(ownedLandsAssets[0])
              setCurrentSlide(2)
            }}
          />
        ),
      })
      slidesTmp.push({
        key: v4(),
        land: ownedLandsAssets[1],
        content: (
          <CarouselSlide
            ownedLand={ownedLandsAssets[1]}
            onClick={async () => {
              setLandId(ownedLandsAssets[1].asset_id)
              setManagingLandDetails()
              loadManagingLandDetailsAndBoosts()
              setCurrentLand(ownedLandsAssets[1])
              setCurrentSlide(3)
            }}
          />
        ),
      })
    }
    setManagingLands(slidesTmp)
  }, [ownedLandsAssets])

  return (
    <>
      {/* MOBILE VIEW */}
      {isNotDesktop ? (
        <VStack
          w="100%"
          bg={Colors.MINE_SHAFT}
          pt={5}
          paddingInline={5}
          h={isDemoUser ? '1000px' : '100%'}
          gap={4}
        >
          {/* FIRST SECTION - CLAIM ACTIONS */}
          <VStack w="100%" mb="10px" gap={5}>
            <ClaimCommissionRewardsBtn />
            <ClaimDTALRewardsBtn />
          </VStack>

          <Divider
            width="95%"
            border="1px solid"
            orientation="horizontal"
            borderColor={Colors.SCORPION}
          />

          {/* SECOND SECTION - LAND SELECTOR */}
          {managingLands?.length > 1 && (
            <Flex
              h="150px"
              direction="column"
              alignItems="center"
              justifyContent="center"
              w={isTablet ? '50%' : '80%'}
            >
              <Carousel
                offsetRadius={3}
                showNavigation={false}
                goToSlide={currentSlide}
                slides={filter(managingLands, (l) => l)}
                animationConfig={{ friction: 60, tension: 200 }}
              />
            </Flex>
          )}

          {/* THIRD SECTION - PLANET & LAND STATS */}
          <HStack w="100%" h="200px" alignItems="center" justifyContent="center">
            <VStack justifyContent="center" mr="15px" pt="50px">
              <LandImage landAsset={currentLand} showPlanetIndicator size="130px" />
              <PlanetLandIcon
                style={{
                  mx: 0,
                  zIndex: 1000,
                  width: '60px',
                  height: '60px',
                  marginTop: '-40px',
                  borderRadius: '100%',
                  marginBottom: '-57px',
                  background: Colors.TRANSPARENT,
                }}
                landName={currentLand?.name}
              />
              <Box h="42px" w="42px" zIndex={500} borderRadius="full" bg={Colors.MINE_SHAFT} />
            </VStack>
            <VStack w="175px" h="100%" alignItems="start" justifyContent="center">
              <Box marginBlock="10px">
                <LandCoordinates land={currentLand} />
              </Box>
              <Box marginTop="10px">
                <LandRating land={currentLand} />
              </Box>
              <Box marginBlock="10px">
                <LandCommission land={currentLand} isReversed showLabel />
              </Box>
            </VStack>
          </HStack>

          {/* FOURTH SECTION - LAND ACTIONS */}

          <VStack justifyContent="space-between" alignItems="center" pt="40px" w="100%">
            <VStack w="100%" gap={5}>
              <ManageLandBtn land={currentLand} />
              {currentLand?.asset_id !== landAsset?.asset_id && (
                <SetLandBtn land={currentLand} currentLand={landAsset} />
              )}
            </VStack>
          </VStack>
        </VStack>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <HStack
            w="100%"
            h="100%"
            bg={Colors.MINE_SHAFT}
            justifyContent="space-between"
            paddingInline={isMediumScreen ? '50px' : '20px'}
          >
            {/* FIRST SECTION - LAND SELECTOR */}
            {managingLands.length > 1 && (
              <>
                <Flex
                  w="20%"
                  h="100%"
                  minW="225px"
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Carousel
                    offsetRadius={3}
                    showNavigation={false}
                    goToSlide={currentSlide}
                    slides={filter(managingLands, (l) => l)}
                    animationConfig={{ friction: 60, tension: 200 }}
                  />
                </Flex>

                <Divider
                  height="75%"
                  border="1px solid"
                  orientation="vertical"
                  borderColor={Colors.SCORPION}
                />
              </>
            )}

            {/* SECOND SECTION - PLANET & LAND STATS */}
            {(isMediumScreen || managingLands.length === 1) && (
              <VStack
                w="7%"
                minW="4%"
                h="60%"
                justifyContent="center"
                ml={managingLands.length === 1 ? '5%' : '0px'}
              >
                <LandImage landAsset={currentLand} showPlanetIndicator />
                <Box
                  h="42px"
                  w="42px"
                  bottom="25px"
                  borderRadius="full"
                  position="absolute"
                  bg={Colors.MINE_SHAFT}
                />
                <PlanetLandIcon
                  style={{
                    mx: 0,
                    width: '54px',
                    height: '54px',
                    bottom: '20px',
                    borderRadius: '100%',
                    position: 'absolute',
                    background: Colors.TRANSPARENT,
                  }}
                  landName={currentLand?.name}
                />
              </VStack>
            )}
            <HStack h="100%" alignItems="center" w="30%">
              <Grid
                w="100%"
                columnGap={5}
                flexWrap="wrap"
                alignItems="center"
                justifyContent="center"
                templateColumns="repeat(2, 1fr)"
                display={isMediumScreen ? 'grid' : 'flex'}
              >
                <Flex
                  h="70px"
                  pl="30px"
                  alignItems="center"
                  justifyContent="center"
                  display={isMediumScreen ? 'flex' : 'none'}
                >
                  <LandCoordinates land={currentLand} />
                </Flex>
                <Flex h="70px" alignItems="center" justifyContent="center">
                  <LandCommission land={currentLand} isReversed showLabel />
                </Flex>
                <Flex h="70px" alignItems="center" justifyContent="center">
                  <LandRating land={currentLand} />
                </Flex>
                <Flex
                  h="70px"
                  alignItems="center"
                  justifyContent="center"
                  display={isMediumScreen ? 'flex' : 'none'}
                >
                  <LandBoosts land={currentLand} />
                </Flex>
              </Grid>
            </HStack>

            {/* THIRD SECTION - CLAIMS ACTIONS */}
            <HStack
              h="100%"
              mt={5}
              ml="auto"
              gap={5}
              alignItems="center"
              justifyContent="space-between"
            >
              <VStack gap={5}>
                <ClaimCommissionRewardsBtn />
                <ClaimDTALRewardsBtn />
              </VStack>

              {/* FOURTH SECTION - LAND ACTIONS */}
              <VStack gap={5}>
                <ManageLandBtn land={currentLand} />
                {currentLand?.asset_id !== landAsset?.asset_id && (
                  <SetLandBtn land={currentLand} currentLand={landAsset} />
                )}
              </VStack>
            </HStack>
          </HStack>
        </>
      )}
    </>
  )
}
