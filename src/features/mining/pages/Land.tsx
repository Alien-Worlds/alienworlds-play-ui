import { useState, useEffect, VFC } from 'react'

import { FilterNormalIcon, StackingIcon, ForwardIcon } from '@alien-worlds/icons'
import {
  Button,
  Dropdown,
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
  NFTImage,
  NFTInUseButton,
  NFTOverlayPanel,
  NFTPlanetComission,
  NFTPlanetIndicator,
} from '@alien-worlds/uikit'
import { Box, Divider, Flex, Hide, HStack, Text, useMediaQuery } from '@chakra-ui/react'
import { NFTCardDataPreparation, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { filterAssets } from 'features/lore/utils/utils'
import { MiningSelect } from 'features/mining/components/MiningSelect/MiningSelect'
import { MiningTabPanelMotion } from 'features/mining/components/MiningTabs'
import { OptionalMiningTabs } from 'features/mining/components/OptionalMiningTabs'
import { CardCharge } from 'features/mining/components/PlanetLand/Components/CardCharge'
import { CardIcons } from 'features/mining/components/PlanetLand/Components/CardIcons'
import { LandDescription } from 'features/mining/components/PlanetLand/Components/LandDescription'
import { LandImage } from 'features/mining/components/PlanetLand/Components/LandImage'
import { LandsFilterbar } from 'features/mining/components/PlanetLand/Components/LandsFilterbar'
import { PlanetCoordinates } from 'features/mining/components/PlanetLand/Components/PlanetCoordinates'
import { PlanetDetailsButton } from 'features/mining/components/PlanetLand/Components/PlanetDetailsButton'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { RarityPoolsBarChart } from 'features/mining/components/RarityPoolsBarChart'
import { usePlanetAssets } from 'features/mining/hooks/usePlanetAssets'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { PlanetDetailsDrawer } from 'features/mining/modals/PlanetDetailsDrawer'
import { ASSET_TYPE_LAND } from 'features/mining/utils/constants'
import { getPlanetImage, PlanetImageSizes } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanets } from 'graphql/hooks/usePlanets'
import { find, get, map, slice, toLower } from 'lodash'
import { useNavigate } from 'react-router-dom'
import {
  RingPositionHelper,
  RingPositions,
} from 'shared/components/RingPositionHelper/RingPositionHelper'
import { Colors } from 'shared/util/colors'
import { dacIdToDacTreasuryAccountList } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

interface MiningPlanetOptionItem {
  label: string
  value: any
}

const Land: VFC = () => {
  const {
    main: { planetDetailsDrawer },
    atomic: { landAssetsFilter, landAsset },
    wax: { whereToMine, walletId, planetSelectedForMining, isOnboarded },
  } = useAppState()

  const {
    modal: { setPrimaryModalActive },
    wax: { setPlanetSelectedForMiningIntent },
    main: {
      showLandPage,

      mining: { openPlanetDetailsDrawer, closePlanetDetailsDrawer },
    },
  } = useActions()
  const navigate = useNavigate()

  const { data: rarityPools, refetch } = useRarityPools(
    dacIdToDacTreasuryAccountList[planetSelectedForMining]
  )

  const [loadingMessage, setLoadingMessage] = useState()
  const [isLargerThanTablet] = useMediaQuery('(min-width: 1024px)')
  const [filterbarIsOpen, setFilterbarIsOpen] = useState(false)
  const [sortedAssets, setSortedAssets] = useState<NFTCardTypes[]>([])
  const [miningPlanets, setMiningPlanets] = useState<MiningPlanetOptionItem[]>([])
  const { filteredPlanets, loading } = usePlanets()
  const [assetIds, setAssetIds] = useState<string[]>([])
  const { data: assets } = usePlanetAssets(assetIds)

  useEffect(() => {
    if (landAssetsFilter && assets) {
      const filteredAssets = filterAssets(assets, landAssetsFilter)
      setSortedAssets(NFTCardDataPreparation(filteredAssets, walletId))
    }
  }, [landAssetsFilter])

  useEffect(() => {
    if (filteredPlanets?.length && miningPlanets?.length === 0) {
      const options: MiningPlanetOptionItem[] = map(filteredPlanets, (p) => ({
        value: p.id,
        label: p.planet_details.title,
      }))
      setMiningPlanets(options)
    }
  }, [filteredPlanets, miningPlanets])

  useEffect(() => {
    // console.log('whereToMine', whereToMine)
    // const planet = find(filteredPlanets, { id: whereToMine })
    // console.log('planet', planet)
    // const assetIds = map(planet.land_maps, (p) => p.asset_id)
    // const currentPlanet = dacIdToDacTreasuryAccountList[planet.id]
    // refetch(currentPlanet)
    // setPlanetSelectedForMiningIntent(planet.id)
    // showLandPage({ assetIds: assetIds, planetName: planet.id })

    setSortedAssets([])
    return () => {
      setSortedAssets([])
    }
  }, [])

  useEffect(() => {
    if (assets && sortedAssets.length === 0) {
      setSortedAssets(NFTCardDataPreparation(assets, walletId))
    }
  }, [assets])

  useEffect(() => {
    if (filteredPlanets.length > 0 && assetIds.length === 0 && whereToMine) {
      const planet = find(filteredPlanets, { id: whereToMine })

      const assetIds = map(planet.land_maps, (p) => p.asset_id)

      setAssetIds(assetIds)
    }
  }, [whereToMine, filteredPlanets, assetIds])

  useEffect(() => {
    let msg

    if (whereToMine) {
      if (!landAssetsFilter.isLoading) {
        msg = `Loading Lands from ${whereToMine}, please wait..`
      } else {
        msg = `There are no Lands matching the selected criteria.`
      }
    }

    setLoadingMessage(msg)
  }, [whereToMine])

  function onPlanetSelected(option: any) {
    setSortedAssets([])
    setAssetIds([])

    const planet = find(filteredPlanets, { id: toLower((option as MiningPlanetOptionItem).value) })

    const assetIds = map(planet.land_maps, (p) => p.asset_id)
    const currentPlanet = dacIdToDacTreasuryAccountList[planet.id]
    refetch(currentPlanet)
    setPlanetSelectedForMiningIntent(planet.id)
    showLandPage({ assetIds: assetIds, planetName: planet.id })

    setSortedAssets([])
  }

  if (loading || filteredPlanets.length === 0) return <LoadingSpinner />

  return (
    <Flex
      direction="column"
      alignItems="start"
      w={{ base: 'full', md: 'auto' }}
      px={{ base: '18px', md: 6 }}
    >
      <Box w="full" display={{ base: 'block', md: 'none' }}>
        <MiningSelect />
      </Box>
      <Box textAlign="start" mb={5} display={{ base: 'none', md: 'block' }}>
        <OptionalMiningTabs />
      </Box>

      <MiningTabPanelMotion>
        {/* mobile */}
        <Flex display={{ lg: 'none' }}>
          <Flex justifyContent="end" alignItems="center" w="100%">
            {!isOnboarded && (
              <Flex transform="rotateY(180deg)" cursor="pointer">
                <ForwardIcon
                  boxSize={30}
                  onClick={() => {
                    navigate(PagePath.OnboardingPlanet)
                  }}
                />
              </Flex>
            )}
            <Hide below="md">
              <LandDescription title={whereToMine} />
            </Hide>
          </Flex>
        </Flex>
        {/* desktop */}
        <Flex
          w="full"
          justifyContent="center"
          mt={{ base: 8, lg: 0 }}
          gap={{ base: '25px', xl: 0 }}
          direction={{ base: 'column', xl: 'row' }}
        >
          {/* left section */}
          <Flex
            w={{
              base: 'full',
              xl: 'fit-content',
            }}
            direction={{ base: 'column', md: 'row', xl: 'column' }}
            justifyContent={{
              base: 'center',
              xl: 'flex-start',
            }}
            alignItems={{
              base: 'stretch',
              sm: 'center',
              md: 'center',
              xl: 'center',
              '2xl': 'baseline',
            }}
          >
            <Flex
              direction={{
                base: 'column',
              }}
              w={{
                base: 'full',
                sm: '290px',
                xl: 'fit-content',
                '2xl': 'fit-content',
              }}
              h="auto"
              justifyContent="center"
              alignItems={{
                base: 'center',
                md: 'flex-start',
              }}
              gap={2}
            >
              <Flex
                direction="column"
                w={{
                  base: 'full',
                  xl: '72',
                }}
                maxW={{
                  base: 'full',
                  xl: '72',
                }}
                justifyContent="center"
                alignItems="center"
                gap={4}
                position="relative"
              >
                <Box position="relative" w="full" h="fit-content" maxW="72" maxH="72">
                  <PlanetImage
                    miningRing
                    hasPlanetIcon
                    imageBoxSize={{ base: null, md: 64 }}
                    showShadowGradient
                    position="relative"
                    dacId={whereToMine}
                    titleDisplay={{ sm: 'none', '2xl': 'unset' }}
                  />

                  {planetSelectedForMining === whereToMine && landAsset && (
                    <RingPositionHelper posXY={RingPositions.CENTER}>
                      <LandImage
                        land={landAsset}
                        m={0}
                        p={0}
                        ml={{ base: 0, md: '-30px' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        w={{ base: 20, sm: 28 }}
                        h={{ base: 20, sm: 28 }}
                      />
                    </RingPositionHelper>
                  )}
                  {planetSelectedForMining === whereToMine && landAsset && (
                    <Box
                      position="absolute"
                      bottom={10}
                      zIndex={2500}
                      w="full"
                      pointerEvents="none"
                    >
                      <Flex
                        width="full"
                        ml={{ base: 0, md: '-13px' }}
                        justifyContent="center"
                        fontSize="14px"
                      >
                        <Text>(</Text>
                        <Text>{`${landAsset?.data.x || 0}:${landAsset?.data.y || 0}`}</Text>
                        <StackingIcon
                          boxSize={24}
                          style={{ marginLeft: 2, paddingBottom: 1 }}
                          color={Colors.SNOW_WHITE}
                        />
                        <Text>)</Text>
                      </Flex>
                    </Box>
                  )}
                  {/* >= Tablet */}
                  <Box
                    display={{ base: 'none', md: 'flex' }}
                    position="absolute"
                    bottom={-3}
                    w="full"
                    mx="auto"
                    zIndex={2600}
                  >
                    <Flex justifyContent="center" w="full" ml="-16px" pointerEvents="none">
                      <PlanetDetailsButton
                        onClick={() => openPlanetDetailsDrawer()}
                        pointerEvents="all"
                      />
                    </Flex>
                  </Box>
                </Box>
                {/* Mobile */}
                <Flex
                  direction="column"
                  display={{ base: 'flex', md: 'none' }}
                  alignItems="center"
                  justifyContent="flex-start"
                  ml={{ base: '0px', md: '-30px' }}
                  gap={0}
                >
                  <PlanetDetailsButton
                    variant="success"
                    borderRadius={12}
                    onClick={() => openPlanetDetailsDrawer()}
                    background={Colors.TRANSPARENT}
                    mb="30px"
                    mt="-20px"
                  />
                  <CardCharge land={landAsset} />
                  <CardIcons land={landAsset} />
                  <Flex w="full" direction="column" pt={{ base: '10px', md: '0px' }}>
                    <Text
                      fontFamily="Orbitron"
                      fontWeight={500}
                      pr={{ base: 0, md: '32px' }}
                      color="#fff"
                      fontSize={isLargerThanTablet ? 'xx-large' : 'x-large'}
                      textAlign="center"
                    >
                      {whereToMine}
                    </Text>
                    <Text
                      pr={{ base: 0, md: '22px' }}
                      fontFamily="orb"
                      fontWeight={400}
                      color={Colors.SNOW_WHITE}
                      width="max-content"
                      fontSize="large"
                      textAlign="center"
                      alignItems="center"
                      w="full"
                    >
                      {landAsset?.name.split(' on ')[0]}
                    </Text>
                  </Flex>
                </Flex>
                {planetSelectedForMining === whereToMine ? (
                  <Text
                    fontFamily="tlm"
                    fontSize="sm"
                    color={Colors.SECONDARY_GREEN}
                    m={0}
                    h="20px"
                    opacity={{ base: 0, xl: 1 }}
                    marginTop={{ base: 0, xl: 3 }}
                    ml="-30px"
                  >
                    currently mining
                  </Text>
                ) : (
                  <Box boxSize={{ base: 0, lg: '20px', xl: '30px' }} />
                )}
                {whereToMine && (
                  <Flex
                    w="80%"
                    ml={{ base: 0, md: '-30px' }}
                    mt={{ base: 0, lg: '0px', xl: '-10px' }}
                    mb="10px"
                  >
                    <Dropdown
                      styles={{
                        container: () => {
                          return {
                            fontSize: 16,
                            width: '100%',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontFamily: 'Orbitron',
                          }
                        },
                        control: () => {
                          return {
                            fontSize: 18,
                            paddingLeft: '0px',
                          }
                        },
                        dropdownIndicator: () => {
                          return {
                            right: 0,
                            cursor: 'pointer',
                            position: 'absolute',
                          }
                        },
                        input: () => {
                          return {
                            cursor: 'pointer',
                          }
                        },
                        menu: () => {
                          return {
                            width: '100%',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }
                        },
                        option: () => {
                          return {
                            cursor: 'pointer',
                          }
                        },
                      }}
                      size="md"
                      variant="classic"
                      options={map(miningPlanets, (opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                      onChange={onPlanetSelected}
                      defaultValue={
                        whereToMine && filteredPlanets.length > 0
                          ? {
                              label: find(filteredPlanets, { id: whereToMine }).planet_details
                                .title,

                              value: find(filteredPlanets, { id: whereToMine }).id,
                            }
                          : null
                      }
                    />
                  </Flex>
                )}
              </Flex>
            </Flex>
            <Flex
              w={{
                base: 'full',
                sm: 'full',
                md: 'fit-content',
                lg: 'fit-content',
                xl: 'fit-content',
                '2xl': 'fit-content',
              }}
              ml={{ base: 0, md: '-15px' }}
              mb={{
                base: '0',
                sm: '20px',
                md: '-125px',
                lg: '-85px',
                '2xl': '45px',
              }}
              p={{ base: 1 }}
              pt={{ md: 0, lg: '50px' }}
              justifyContent={{
                base: 'flex-end',
                xl: 'flex-start',
              }}
              alignItems={{
                base: 'flex-end',
              }}
            >
              <Flex
                gap={4}
                maxW={56}
                width="full"
                direction="column"
                mx={{ base: 'auto', md: 6 }}
                my={{ base: 6, md: 0 }}
              >
                <Text
                  fontFamily="orb"
                  fontWeight={600}
                  color={Colors.GRAY}
                  fontSize="md"
                  textAlign="center"
                >
                  <Box as="span">RARITY POOLS</Box>
                </Text>

                <RarityPoolsBarChart rarityPools={rarityPools} />
                <Button
                  fontWeight={700}
                  fontSize={14}
                  size="lg"
                  height="40px !important"
                  variant="info"
                  onClick={() =>
                    setPrimaryModalActive({
                      modalName: 'RarityPoolsPieChartModal',
                      value: true,
                    })
                  }
                >
                  Pool Details
                </Button>
              </Flex>
            </Flex>
          </Flex>
          {/* right section */}
          <Flex direction="column" w={{ base: 'full', '2xl': '95%' }} pr={{ '2xl': 6 }}>
            <Flex mb={6} w="100%" display={{ base: 'none', lg: 'flex' }}>
              <Flex justifyContent="start" alignItems="center" w="100%">
                <LandDescription title={whereToMine} />
              </Flex>
            </Flex>
            <Flex
              w="full"
              justifyContent="flex-start"
              direction={{
                base: 'column',
                md: 'row',
              }}
              mt={{
                md: 2,
              }}
            >
              <Flex w="100%" direction="column" gap={{ base: '0px', md: '10px' }}>
                <Flex w="100%" justifyContent="start" direction={{ base: 'column', sm: 'row' }}>
                  <Flex w={{ base: '100%', md: '90%' }} justifyContent="center">
                    <PlanetCoordinates
                      setFilterbarIsOpen={setFilterbarIsOpen}
                      filterbarIsOpen={filterbarIsOpen}
                    />
                  </Flex>
                  {/* filters button */}
                  <Hide below="md">
                    <HStack
                      zIndex={1400}
                      cursor="pointer"
                      alignItems="center"
                      flexDirection="row"
                      justifyContent={{ base: 'center', md: 'flex-end' }}
                      onClick={() => setFilterbarIsOpen(!filterbarIsOpen)}
                    >
                      <Text
                        fontFamily="tlm"
                        letterSpacing="0.1em"
                        whiteSpace="nowrap"
                        fontWeight={400}
                        fontSize={18}
                        filter="invert(0.2)"
                        color={filterbarIsOpen ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
                      >
                        Filters
                      </Text>
                      <Box filter="invert(0.2)" pl="10px">
                        <FilterNormalIcon
                          width="35px"
                          height="35px"
                          color={filterbarIsOpen ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
                        />
                      </Box>
                    </HStack>
                  </Hide>
                </Flex>

                <Flex p={0} m={0} mt="10px">
                  {filterbarIsOpen && <Divider borderColor={Colors.JUMBO} />}
                </Flex>
                <Flex p={2} m={0}>
                  {filterbarIsOpen && <LandsFilterbar />}
                </Flex>
              </Flex>
            </Flex>

            {sortedAssets && sortedAssets.length > 0 ? (
              <Flex
                ml={0}
                gap={8}
                justify="center"
                flexWrap="wrap"
                position="relative"
                w={{ base: 'full', '2xl': '100%' }}
              >
                {map(slice(sortedAssets, 0, 32), (card) => {
                  return (
                    <Box key={card.assetId?.name ?? card?.nftImage?.name}>
                      <NFTCard
                        title={card.type.name}
                        rarity={card.rarity.name}
                        shine={card.shine.name}
                        animate
                      >
                        <NFTInUseButton
                          altText="Selected"
                          onClick={() => null}
                          disable={
                            !isOnboarded || (landAsset && card.assetId.name !== landAsset.asset_id)
                          }
                        />
                        <NFTCardTopRightPanel>
                          <NFTCardTopRightPanelRender asset={card} />
                        </NFTCardTopRightPanel>
                        <NFTImage hideInnerRing={card.disableInnerRing} src={card.nftImage.name} />
                        <NFTCardDetailsPanel>
                          <NFTCardDetailPanelRender asset={card} />
                        </NFTCardDetailsPanel>
                        <NFTCardBottomPanel>
                          <NFTCardBottomPanelRender asset={card} />
                        </NFTCardBottomPanel>
                        <NFTPlanetComission
                          rarity={card.rarity.name}
                          disable={card.type.name !== ASSET_TYPE_LAND}
                          label={get(card, 'commission.name', 0)}
                        />
                        <NFTPlanetIndicator
                          hideInnerRing
                          solidColor={Colors.CARIBBEAN_GREEN}
                          disable={
                            !isOnboarded || (landAsset && card.assetId.name !== landAsset.asset_id)
                          }
                          src={getPlanetImage(planetSelectedForMining, PlanetImageSizes.SMALL)}
                          innerGradientColor={
                            Colors.planetGradient[toLower(planetSelectedForMining)]
                          }
                        />
                        <NFTOverlayPanel>
                          <NFTCardOverlayRender asset={card} />
                        </NFTOverlayPanel>
                      </NFTCard>
                    </Box>
                  )
                })}
              </Flex>
            ) : (
              <Flex justify="center" pt={8}>
                <Text fontSize={{ base: 12, md: 16 }} textAlign="center">
                  {loadingMessage}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </MiningTabPanelMotion>
      <PlanetDetailsDrawer
        planet={planetSelectedForMining}
        isOpen={planetDetailsDrawer.isOpen}
        onClose={() => closePlanetDetailsDrawer()}
      />
    </Flex>
  )
}

export { Land }
