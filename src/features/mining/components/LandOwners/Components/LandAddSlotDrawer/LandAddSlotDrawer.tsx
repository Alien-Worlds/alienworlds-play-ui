import { useEffect, useState } from 'react'

import { TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  Flex,
  Image,
  Text,
  useDisclosure,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  css,
} from '@chakra-ui/react'
import boost1 from 'assets/images/boosts/boost1.jpg'
import boost2 from 'assets/images/boosts/boost2.jpg'
import boost3 from 'assets/images/boosts/boost3.jpg'
import boost4 from 'assets/images/boosts/boost4.jpg'
import boost5 from 'assets/images/boosts/boost5.jpg'
import { BoostSlotsInline } from 'features/mining/components/LandOwners/Components/BoostSlotsInline/BoostSlotsInline'
import { LandInfo } from 'features/mining/components/LandOwners/Components/LandInfo/LandInfo'
import { LandAddSlotModal } from 'features/mining/components/PlanetLand/Components/LandAddSlotModal'
import { LandBoostLevel } from 'features/mining/types/LandownerTypes'
import { BoostLevels } from 'features/mining/utils/constants'
import { find, map } from 'lodash'
import { useMatch } from 'react-router-dom'
import { AppModal } from 'shared/layouts'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../../../../shared/util/constants'

export const LandAddSlotDrawer = () => {
  const addDisclosure = useDisclosure()

  const [showAddModal, setShowAddModal] = useState(false)

  const {
    main: { setIsLandOwnerAddSlotDrawerOpen, setLandOwnerDrawerPayload },
  } = useActions()

  const {
    wax: { managingLandDetails },
    main: { isLandOwnerAddSlotDrawerOpen, landOwnerDrawerPayload },
  } = useAppState()

  const isLandMgtSubPage = useMatch(PagePath.LandMgtSubpage)

  const [minBoostPrice, setMinBoostPrice] = useState(null)
  const [boostsImgs, setBoostsImgs] = useState<string[]>([])
  const [selectedBoost, setSelectedBoost] = useState<LandBoostLevel | null>(null)
  const [selectedBoostImg, setSelectedBoostImg] = useState<string | null>(null)

  const selectedSlotNumber = landOwnerDrawerPayload?.slotNumber

  const onShowAddModal = () => {
    setShowAddModal(true)
    addDisclosure.onOpen()
  }

  useEffect(() => {
    const imgs = [boost1, boost2, boost3, boost4, boost5]
    setBoostsImgs(imgs)
  }, [])

  useEffect(() => {
    if (managingLandDetails && managingLandDetails?.data) {
      const minBoostValue =
        parseInt(
          managingLandDetails?.data?.MinBoostAmount ?? Constants.DEFAULT_LAND_MIN_BOOST_AMOUNT,
          10
        ) / 10000
      setMinBoostPrice(minBoostValue)
    }
  }, [managingLandDetails])

  const onCloseDrawer = () => {
    setIsLandOwnerAddSlotDrawerOpen(false)
    setLandOwnerDrawerPayload({ slotNumber: null })
  }

  const onReturnToSlot = () => {
    if (isLandMgtSubPage) {
      onCloseDrawer()
    } else {
      setLandOwnerDrawerPayload({ slotNumber: null })
    }
  }

  const isLevelApplicable = (boostLvl: LandBoostLevel) => {
    return boostLvl?.price >= minBoostPrice
  }

  const onBoost = (boostLvl: LandBoostLevel, img: string) => {
    setSelectedBoost(boostLvl)
    setSelectedBoostImg(img)
    onShowAddModal()
  }

  const BoostSelectionHeader = () => {
    return (
      <Flex mt={5} direction={{ base: 'column', lg: 'row' }}>
        <Flex>
          <Box
            h={10}
            w={10}
            border="2px solid"
            borderRadius="100%"
            bg={Colors.SNOW_WHITE}
            borderColor={Colors.DI_SERRIA}
          >
            <Text
              mt="5px"
              color="black"
              fontSize={18}
              fontWeight={500}
              textAlign="center"
              fontFamily="Orbitron"
            >
              {selectedSlotNumber}
            </Text>
          </Box>
          <Text
            mt={2}
            mb={2}
            ml={3}
            fontSize={18}
            fontWeight={500}
            cursor="pointer"
            fontFamily="Orbitron"
            onClick={() => onReturnToSlot()}
          >
            Return to Slots
          </Text>
        </Flex>

        <Flex ml="auto">
          <Text
            mt={2}
            mb={2}
            mr={2}
            fontSize={18}
            fontWeight={400}
            fontFamily="Orbitron"
            color={Colors.GRAY_CHATEAU}
          >
            Public Boost Limit:
          </Text>
          <Text mt={2} mb={2} fontWeight={500} fontFamily="Orbitron" fontSize={18}>
            {find(BoostLevels, (s) => s.price === minBoostPrice)?.name ?? BoostLevels[0].name}
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Drawer
      size="xxl"
      placement="right"
      preserveScrollBarGap
      isOpen={isLandOwnerAddSlotDrawerOpen}
      onClose={() => onCloseDrawer()}
    >
      <DrawerOverlay />
      <DrawerContent
        style={{
          padding: '20px',
          borderRadius: '6px 0px 0px 6px',
          background: Colors.BLACK_SOLID_90,
        }}
      >
        <DrawerCloseButton />

        <DrawerBody
          css={css({
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            overflowScrolling: 'touch',
            '::-webkit-scrollbar': { display: 'none' },
            boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
          })}
        >
          <Box w="full" mx="auto" position="relative" paddingInline="25px">
            <Flex mt={10} direction="column">
              <LandInfo />
              {!selectedSlotNumber && (
                <>
                  <Divider mt={12} />
                  <Box pt={5} pb={6}>
                    <BoostSlotsInline />
                  </Box>
                </>
              )}
            </Flex>

            {selectedSlotNumber && (
              <>
                <Divider mt="60px" mb="30px" />
                <BoostSelectionHeader />
                <Flex
                  w="full"
                  marginBlock={10}
                  textAlign="center"
                  color={Colors.SNOW_WHITE}
                  justifyContent="space-evenly"
                  direction={{ base: 'column', lg: 'row' }}
                >
                  {map(BoostLevels, (boostLvl, index) => {
                    return (
                      <Flex
                        key={index}
                        flexDirection="column"
                        alignItems="center"
                        mt={{ base: '20px', lg: '0px' }}
                        mb={{ base: '40px', lg: '0px' }}
                      >
                        <Image
                          w="125px"
                          h="125px"
                          src={boostsImgs[index]}
                          style={{
                            borderRadius: '100%',
                            border: `5px solid ${Colors.SILVER}`,
                            filter: isLevelApplicable(boostLvl) ? null : 'brightness(0.5)',
                          }}
                        />

                        <Text
                          mt={2}
                          mb={2}
                          fontSize={18}
                          fontWeight={500}
                          fontFamily="Orbitron"
                          color={
                            isLevelApplicable(boostLvl) ? Colors.SNOW_WHITE : Colors.GRAY_CHATEAU
                          }
                        >
                          {boostLvl.percentage}%
                        </Text>

                        <Text
                          fontSize={18}
                          fontWeight={500}
                          fontFamily="Orbitron"
                          color={
                            isLevelApplicable(boostLvl) ? Colors.SNOW_WHITE : Colors.GRAY_CHATEAU
                          }
                        >
                          {boostLvl.name}
                        </Text>

                        <Flex mt={{ base: 3, lg: 7 }} mb={{ base: 3, lg: 7 }} alignItems="center">
                          <Box w="25px" mr={2}>
                            <TriliumIcon
                              w="100%"
                              height="auto"
                              color={
                                isLevelApplicable(boostLvl)
                                  ? Colors.SNOW_WHITE
                                  : Colors.GRAY_CHATEAU
                              }
                            />
                          </Box>
                          <Text
                            fontSize={32}
                            fontWeight={500}
                            fontFamily="Orbitron"
                            color={
                              isLevelApplicable(boostLvl) ? Colors.SNOW_WHITE : Colors.GRAY_CHATEAU
                            }
                          >
                            {boostLvl.price}
                          </Text>
                        </Flex>

                        {isLevelApplicable(boostLvl) && (
                          <Flex padding={2}>
                            <Button
                              size="md"
                              fontSize={16}
                              variant="negative"
                              onClick={() => onBoost(boostLvl, boostsImgs[index])}
                            >
                              Boost
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    )
                  })}
                </Flex>
              </>
            )}
          </Box>
          {showAddModal && (
            <AppModal onClose={() => {}} isOpen={addDisclosure.isOpen}>
              <LandAddSlotModal
                onClose={addDisclosure.onClose}
                selectedBoost={selectedBoost}
                selectedImg={selectedBoostImg}
              />
            </AppModal>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
