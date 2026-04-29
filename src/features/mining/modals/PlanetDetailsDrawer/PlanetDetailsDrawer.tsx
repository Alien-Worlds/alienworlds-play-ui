import { FC } from 'react'

import { MiningIcon, StackingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { CardCharge } from 'features/mining/components/PlanetLand/Components/CardCharge'
import { CardIcons } from 'features/mining/components/PlanetLand/Components/CardIcons'
import { ChargeTime } from 'features/mining/components/PlanetLand/Components/ChargeTime'
import { LandImage } from 'features/mining/components/PlanetLand/Components/LandImage'
import { MiningPower } from 'features/mining/components/PlanetLand/Components/MiningPower'
import { NftLuck } from 'features/mining/components/PlanetLand/Components/NftLuck'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { PowReduction } from 'features/mining/components/PlanetLand/Components/PowReduction'
import { RarityPoolsGrid } from 'features/mining/components/RarityPoolsGrid'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import {
  RingPositionHelper,
  RingPositions,
} from 'shared/components/RingPositionHelper/RingPositionHelper'
import { useActivePath } from 'shared/hooks/useRouter'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

export interface PlanetDetailsDrawerProps {
  planet: string
  isOpen: boolean
  onClose?: () => void
}

const PlanetDetailsDrawer: FC<PlanetDetailsDrawerProps> = ({ isOpen, onClose, planet }) => {
  const {
    wax: { setPlanetSelectedForMiningIntent },
  } = useActions()
  const {
    wax: { planetSelectedForMining },
    atomic: { landAsset },
  } = useAppState()

  const isLandsPage = useActivePath([PagePath.Land])
  const { planetDetails: currentPlanet, loading } = usePlanetDetail(planet)
  if (loading) return <LoadingSpinner />
  return (
    <>
      {currentPlanet && (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} preserveScrollBarGap>
          <DrawerOverlay />
          <DrawerContent
            background={Colors.BLACK_SOLID_100}
            w="full"
            maxWidth={{ base: 'full', md: '75%', xl: '50%', '2xl': '45%' }}
            overflowY="auto"
          >
            <DrawerCloseButton />

            <DrawerBody p={8}>
              <SimpleGrid w="full" columns={{ base: 1, md: 2 }} mt={6}>
                <Box>
                  <Flex direction="column" alignItems="center" gap={3}>
                    {planetSelectedForMining === currentPlanet.dac_id && (
                      <Text
                        fontFamily="tlm"
                        fontSize="sm"
                        color={Colors.SECONDARY_GREEN}
                        m={0}
                        mt="-20px"
                        mb="-15px"
                      >
                        currently mining
                      </Text>
                    )}
                    <Text fontSize="36px" fontFamily="orb" mb={0} mt={0}>
                      {currentPlanet.planet_details.title}
                    </Text>
                    <Flex
                      w={{
                        base: 60,
                        lg: 72,
                      }}
                      position="relative"
                      mb={7}
                    >
                      <PlanetImage
                        w={{ base: 60, lg: 72 }}
                        maxW={{ base: 60, lg: 72 }}
                        dacId={currentPlanet.dac_id}
                      />
                      {planetSelectedForMining === currentPlanet?.dac_id && landAsset && (
                        <RingPositionHelper
                          posXY={RingPositions.BOTTOM_CENTER}
                          offsetBottom={-8}
                          zIndex={2000}
                        >
                          <LandImage
                            land={landAsset}
                            zIndex={1700}
                            m={0}
                            p={0}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            w={{ base: 24, sm: 32 }}
                            h={{ base: 24, sm: 32 }}
                            ringPosition={RingPositions.TOP_CENTER}
                          />
                        </RingPositionHelper>
                      )}
                    </Flex>
                    {planetSelectedForMining === currentPlanet?.dac_id && landAsset && (
                      <Flex width="full" ml="15px" mt="-10px" justifyContent="center" fontSize={18}>
                        <Text>(</Text>
                        <Text>{`${landAsset?.data.x || 0}:${landAsset?.data.y || 0}`}</Text>
                        <StackingIcon
                          boxSize={24}
                          style={{ marginLeft: 3, marginTop: 2 }}
                          color={Colors.SNOW_WHITE}
                        />
                        <Text>)</Text>
                      </Flex>
                    )}
                    {planetSelectedForMining === currentPlanet?.dac_id && landAsset && (
                      <CardCharge land={landAsset} />
                    )}
                    {planetSelectedForMining === currentPlanet?.dac_id && landAsset && (
                      <Flex
                        w="100%"
                        mt="-15px"
                        alignItems="center"
                        fill={Colors.DI_SERRIA}
                        color={Colors.SNOW_WHITE}
                        justifyContent="center"
                      >
                        <CardIcons land={landAsset} />
                      </Flex>
                    )}

                    {planetSelectedForMining === currentPlanet.dac_id && landAsset && (
                      <Text
                        mt="-10px"
                        fontSize="24px"
                        fontFamily="orb"
                        fontWeight={400}
                        alignSelf="center"
                        textAlign="center"
                        alignItems="center"
                        width="max-content"
                        color={Colors.SNOW_WHITE}
                      >
                        <Box as="span" borderRadius={8}>
                          {landAsset?.name.split(' on ')[0]}
                        </Box>
                      </Text>
                    )}
                    {planetSelectedForMining === currentPlanet?.dac_id && (
                      <Divider color={Colors.MID_GRAY} mx="auto" w="70%" mb="20px" />
                    )}
                    <Text
                      fontFamily="tlm"
                      fontSize="md"
                      pl="50px"
                      pr={planetSelectedForMining === currentPlanet.dac_id ? '10px' : '50px'}
                      mt="-20px"
                    >
                      {currentPlanet?.planet_details.metadata?.description}
                    </Text>

                    {!isLandsPage && (
                      <Button
                        size="md"
                        variant="warning"
                        alignSelf="center"
                        fontSize={16}
                        marginTop="10px"
                        leftIcon={<MiningIcon boxSize={20} />}
                        border={`2px solid ${Colors.SNOW_WHITE}`}
                        onClick={() => {
                          onClose()
                          setPlanetSelectedForMiningIntent(currentPlanet.dac_id)
                        }}
                      >
                        Explore
                      </Button>
                    )}
                  </Flex>
                </Box>
                <Box>
                  <Flex
                    direction="column"
                    gap={{ base: 4, sm: 6 }}
                    alignItems={{ base: 'center', md: 'start' }}
                  >
                    {currentPlanet && (
                      <RarityPoolsGrid planetName={currentPlanet.planet_details.planet_name} />
                    )}
                    <Divider mr={{ base: '', md: 'auto' }} w="70%" />
                    <HStack>
                      <MiningIcon boxSize={20} color={Colors.MID_GRAY} />
                      <Text
                        fontFamily="orb"
                        fontSize="md"
                        color={Colors.MID_GRAY}
                        fontWeight="bold"
                        mb={4}
                        mx={2}
                      >
                        Tools
                      </Text>
                    </HStack>

                    <SimpleGrid columns={2} spacing={5}>
                      <Box>
                        <ChargeTime />
                      </Box>
                      <Box>
                        <MiningPower />
                      </Box>
                      <Box>
                        <NftLuck />
                      </Box>
                      <Box>
                        <PowReduction />
                      </Box>
                    </SimpleGrid>
                  </Flex>
                </Box>
              </SimpleGrid>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

export { PlanetDetailsDrawer }
