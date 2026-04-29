import { useEffect, useState, VFC } from 'react'

import { LandIcon2, LightIcon2, MiningIcon, NFTOldIcon, StackingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Link, Text, useMediaQuery, HStack, Hide } from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { BagItemChooser } from 'features/mining/components/BagItemChooser'
import { MiningSelect } from 'features/mining/components/MiningSelect'
import { MiningTabPanelMotion, MiningTabs } from 'features/mining/components/MiningTabs/MiningTabs'
import { MiningToolsDrawer } from 'features/mining/components/MiningToolDrawer'
import { ChargeTime } from 'features/mining/components/PlanetLand/Components/ChargeTime'
import { LandImage } from 'features/mining/components/PlanetLand/Components/LandImage'
import { MiningPower } from 'features/mining/components/PlanetLand/Components/MiningPower'
import { NftLuck } from 'features/mining/components/PlanetLand/Components/NftLuck'
import { PlanetDetailsButton } from 'features/mining/components/PlanetLand/Components/PlanetDetailsButton'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { PowReduction } from 'features/mining/components/PlanetLand/Components/PowReduction'
import { RarityPoolsBarChart } from 'features/mining/components/RarityPoolsBarChart'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { PlanetDetailsDrawer } from 'features/mining/modals/PlanetDetailsDrawer'
import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { RingPositionHelper } from 'shared/components/RingPositionHelper/RingPositionHelper'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useActions, useAppState } from 'store'

import { RingPositions } from '../../../shared/components/RingPositionHelper/RingPositionHelper'

const CardIconsBox = styled(Box)`
  align-items: center;
  bottom: 0;
  color: #fff;
  display: flex;
  font-size: 0;
  justify-content: center;
  left: 0;
  position: relative;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 16px;
`

const CardIconWrap = styled(Box)`
  align-items: center;
  display: flex;
  font-family: 'Orbitron';
  font-size: 14px;
  font-weight: 700;
  vertical-align: middle;
  white-space: normal;
  width: 33.33%;
`

const CardIcon = styled(Box)`
  display: inline-block;
  width: 20px;
  color: #f6a800;
  margin-right: 5px;
  margin-left: 5px;
`

const MiningTitle: VFC = () => (
  <Box w="full" textAlign="start" gap={2}>
    <HStack mb={2}>
      <Text
        as="h2"
        fontFamily="orb"
        fontSize={{ base: 'md', md: '3xl' }}
        color="white"
        fontWeight={{ base: 'bold', md: 'normal' }}
      >
        Choose your Inventory to Mine
      </Text>

      <Flex display={{ base: 'none', md: 'initial' }}>
        <GlossaryInfoIcon
          ml={5}
          width={24}
          height={24}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.MINING_INVENTORY}
        />
      </Flex>
    </HStack>

    <Text fontFamily="Titillium Web" fontWeight="thin" color="#e0e0e0" maxWidth="100%">
      Everyone starts with a free shovel, but its Mining Power is limited. Tools with higher rarity
      and Mining Power extract more Trilium from the planet’s pool. Tools with NFT Power accumulate
      points while mining, which can be redeemed for NFTs in the Outpost. The more NFT Power your
      tools have, the more points you collect. You can equip up to three tools at once.{' '}
      <Link
        href={`${config.MediumUrl}/how-to-mine-on-alien-worlds-b8ee8e1b302`}
        target="_blank"
        color={Colors.WEB_ORANGE}
      >
        Read more.
      </Link>
    </Text>
  </Box>
)

const CardIcons: VFC<{ land: IAsset }> = ({ land }) => {
  if (!land) return <></>

  return (
    <Box display="flex" width="max-content">
      <CardIconWrap marginRight="20px">
        <CardIcon>
          <MiningIcon boxSize="20px" />
        </CardIcon>
        {land.data.ease / 10}
      </CardIconWrap>
      <CardIconWrap marginRight="20px">
        <CardIcon>
          <LandIcon2 boxSize="20px" />
        </CardIcon>
        {land.data.difficulty}
      </CardIconWrap>
      <CardIconWrap marginRight="20px">
        {land.data.luck / 10}
        <CardIcon>
          <NFTOldIcon boxSize="20px" />
        </CardIcon>
      </CardIconWrap>
    </Box>
  )
}

const CardCharge: VFC<{ land: IAsset }> = ({ land }) => {
  if (!land) return <></>

  const valueInt = land.data.delay / 10

  return (
    <Flex h="20px" mr={2} marginBottom="10px" alignItems="center" justifyContent="center" gap={1}>
      <LightIcon2 boxSize={20} />

      <Text fontFamily="orb" fontWeight={600} color={Colors.ELECTRIC_BLUE} fontSize="xl">
        {valueInt}
        <Text as="span" fontWeight={400} color={Colors.SNOW_WHITE} fontSize="small" ml={1}>
          x
        </Text>
      </Text>
    </Flex>
  )
}

const Mining: VFC = () => {
  const {
    atomic: { landAsset },
    wax: { planetSelectedForMining },
    main: { miningToolsDrawer, planetDetailsDrawer },
  } = useAppState()

  const {
    modal: { setPrimaryModalActive },
    main: {
      showMiningPage,
      mining: { openPlanetDetailsDrawer, closePlanetDetailsDrawer },
    },
  } = useActions()

  const [land, setLand] = useState<IAsset>(null)
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)

  const { data: rarityPools } = useRarityPools(planetDetails?.planet_details.planet_name)
  const [isLargerThanTablet] = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    if (landAsset) {
      setLand(landAsset)
    }
  }, [landAsset, planetSelectedForMining])

  useEffect(() => {
    showMiningPage()
  }, [])
  if (loading) return <LoadingSpinner />
  return (
    <Flex
      direction="column"
      alignItems="start"
      w={{ base: 'full', md: 'auto' }}
      px={{ base: '18px', md: 6 }}
    >
      <Box w="full" mb={5} display={{ base: 'block', md: 'none' }}>
        <MiningSelect />
      </Box>
      <Box textAlign="start" mb={5} display={{ base: 'none', md: 'block' }}>
        <MiningTabs />
      </Box>

      <MiningTabPanelMotion>
        <Flex
          w="full"
          justifyContent="center"
          gap={{ base: '25px', xl: 0 }}
          direction={{ base: 'column', xl: 'row' }}
        >
          <Hide below="md">
            <Flex display={{ lg: 'none' }} mb={{ base: '-10px', md: '0px' }}>
              <MiningTitle />
            </Flex>
          </Hide>
          <Flex
            direction={{
              base: 'column',
              md: 'row',
              xl: 'column',
            }}
            justifyContent={{
              base: 'center',
              xl: 'start',
            }}
            alignItems="center"
            gap={4}
          >
            {planetSelectedForMining && planetDetails && (
              <Flex
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                w={{ base: 'full', lg: '290px' }}
                minW="290px"
                maxW="290px"
              >
                <Flex
                  position="relative"
                  w={{ base: '100%', md: '256px' }}
                  h="fit-content"
                  maxW="72"
                  maxH="72"
                >
                  <PlanetImage
                    p="15px"
                    hasPlanetIcon
                    offsetTop={-4}
                    imageBoxSize={{ base: null, md: 64 }}
                    position="relative"
                    dacId={planetSelectedForMining}
                    showShadowGradient
                    titleDisplay={{ sm: 'none', '2xl': 'unset' }}
                  />

                  <RingPositionHelper posXY={RingPositions.CENTER} direction="row" zIndex={1500}>
                    <LandImage
                      land={land}
                      m={0}
                      p={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w={{ base: 20, sm: 28 }}
                      h={{ base: 20, sm: 28 }}
                    />
                  </RingPositionHelper>

                  <Box position="absolute" bottom={10} zIndex={2500} w="full" pointerEvents="none">
                    <Flex width="full" ml="3px" justifyContent="center" fontSize="14px">
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
                  <Box
                    display={{ base: 'none', md: 'flex' }}
                    position="absolute"
                    bottom={-3}
                    w="full"
                    mx="auto"
                    zIndex={2600}
                  >
                    <Flex justifyContent="center" w="full" ml="1px" pointerEvents="none">
                      <PlanetDetailsButton
                        onClick={() => openPlanetDetailsDrawer()}
                        pointerEvents="all"
                      />
                    </Flex>
                  </Box>
                </Flex>

                <Box
                  w="100%"
                  justifyContent="center"
                  alignItems="center"
                  pr={{ base: 0, md: '32px' }}
                  mt={{ base: 0, md: '35px' }}
                >
                  <CardCharge land={land} />
                </Box>

                <CardIconsBox
                  justifyContent="center"
                  alignItems="center"
                  pr={{ base: 0, md: '15px' }}
                >
                  <CardIcons land={land} />
                </CardIconsBox>

                <Flex w="full" direction="column">
                  <Text
                    fontFamily="Orbitron"
                    fontWeight={500}
                    pr={{ base: 0, md: '32px' }}
                    color="#fff"
                    fontSize={isLargerThanTablet ? 'xx-large' : 'x-large'}
                    textAlign="center"
                  >
                    {planetDetails.planet_details.title}
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
                    {land?.name.split(' on ')[0]}
                  </Text>
                </Flex>
              </Flex>
            )}

            <Flex
              w="full"
              pr={{ base: 0, md: '32px' }}
              maxW={{ base: 'full', sm: '220px', lg: 'full' }}
              justifyContent="center"
              mt={{ base: 6, lg: 6 }}
            >
              <Flex flexDirection="column" gap={4} alignItems="center" mx="auto">
                <Flex flexDirection="column" gap={3} px={{ base: 4, md: 0 }}>
                  <Text
                    fontFamily="orb"
                    fontWeight={600}
                    color={Colors.GRAY}
                    fontSize="md"
                    textAlign="center"
                  >
                    RARITY POOLS
                  </Text>
                  <Flex maxW="220px">
                    {!miningToolsDrawer.isOpen && <RarityPoolsBarChart rarityPools={rarityPools} />}
                  </Flex>
                  <Button
                    fontWeight={700}
                    fontSize={14}
                    size="lg"
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

                <Box width="max-content" pt={{ base: '30px', md: 0 }}>
                  <Flex alignItems="center" gap={1}>
                    <Text
                      paddingLeft="2px"
                      fontFamily="orb"
                      fontWeight={600}
                      color={Colors.GRAY}
                      fontSize="md"
                      textAlign="start"
                    >
                      TOOL & LAND STATS
                    </Text>
                    <GlossaryInfoIcon glossaryId={TooltipLocations.MINING_LAND_STATS_TITLE} />
                  </Flex>
                  <Box marginBlock="10px">
                    <ChargeTime />
                  </Box>
                  <Box marginBlock="10px">
                    <MiningPower />
                  </Box>
                  <Box marginBlock="10px">
                    <NftLuck />
                  </Box>
                  <Box marginBlock="10px">
                    <PowReduction />
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </Flex>

          <Flex direction="column" alignItems={{ base: 'center', md: 'initial' }}>
            <Flex mb={10} display={{ base: 'none', lg: 'flex' }}>
              <MiningTitle />
            </Flex>
            <Flex
              flexWrap="wrap"
              position="relative"
              justify="center"
              w="full"
              maxWidth="95%"
              sx={{ gap: 20 }}
            >
              <BagItemChooser index={MiningToolsActiveSlotNumber.SLOT_ONE} />
              <BagItemChooser index={MiningToolsActiveSlotNumber.SLOT_TWO} />
              <BagItemChooser index={MiningToolsActiveSlotNumber.SLOT_THREE} />
            </Flex>
          </Flex>
        </Flex>
      </MiningTabPanelMotion>

      <PlanetDetailsDrawer
        planet={planetSelectedForMining}
        isOpen={planetDetailsDrawer.isOpen}
        onClose={() => closePlanetDetailsDrawer()}
      />

      {miningToolsDrawer.isOpen && <MiningToolsDrawer />}
    </Flex>
  )
}

export { Mining }
