import { useEffect, useState } from 'react'

import { TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Center, Flex, Image, Text, useBreakpointValue } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoostLevel } from 'features/mining/types/LandownerTypes'
import { MainBoostLevels } from 'features/mining/utils/constants'
import { filter, find } from 'lodash'
import { useInterval } from 'react-use'
import { Colors } from 'shared/util/colors'
import { getDiffToStartOfNext25hDay } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

type SlotModalType = {
  selectedBoost: LandBoostLevel
  onClose: () => void
  selectedImg: string
}

export const LandAddSlotModal = ({ selectedBoost, onClose, selectedImg }: SlotModalType) => {
  const {
    modal: { setPrimaryModalActive },
    wax: { boostSlot, applyMainBoost, loadManagingLandDetailsAndBoostsWithDelay },
  } = useActions()
  const {
    atomic: { ownedLandBoostsAssets },
    wax: { managingLandId, isDemoUser },
    main: { landOwnerDrawerPayload },
  } = useAppState()

  const [isMainBoost, setIsMainBoost] = useState<boolean>(false)
  const [timer, setTimer] = useState(getDiffToStartOfNext25hDay())

  const currentSlot = landOwnerDrawerPayload?.slotNumber

  useEffect(() => {
    if (!selectedBoost) return

    if (find(MainBoostLevels, (x) => x.name === selectedBoost.name)) {
      setIsMainBoost(true)
    } else {
      setIsMainBoost(false)
    }
  }, [selectedBoost])

  useInterval(() => {
    setTimer(getDiffToStartOfNext25hDay())
  }, 1000)

  const onApplyMainBoost = async (boostType: string) => {
    let boostNFTs: IAsset[]

    switch (boostType) {
      case MainBoostLevels[0].name:
        boostNFTs = filter(ownedLandBoostsAssets, (b) => b.name === MainBoostLevels[0].name)
        break
      case MainBoostLevels[1].name:
        boostNFTs = filter(ownedLandBoostsAssets, (b) => b.name === MainBoostLevels[1].name)
        break
      default:
        return
    }

    const isSuccess = await applyMainBoost({ landId: managingLandId, boost: boostNFTs[0] })

    if (isSuccess) {
      loadManagingLandDetailsAndBoostsWithDelay()
      onClose()
    }
  }

  const onBoostSlot = async () => {
    const isSuccess = await boostSlot({ landId: managingLandId, price: selectedBoost?.price })

    if (isSuccess) {
      loadManagingLandDetailsAndBoostsWithDelay()
      onClose()
    }
  }
  const currentBreakpointWidth = useBreakpointValue({ base: '100%', lg: '275px' })
  return (
    <Center minH="80vh">
      <Flex
        align="center"
        color={Colors.SNOW_WHITE}
        textAlign="center"
        w="full"
        flexDirection="column"
      >
        <Flex>
          <Flex flexDirection="column" alignItems="center" mr={5}>
            {/* SLOT INDICATOR */}
            {!isMainBoost && (
              <Box
                mt="-20px"
                boxSize="40px"
                border="2px solid"
                borderRadius="100%"
                position="absolute"
                bg={Colors.SNOW_WHITE}
                borderColor={Colors.DI_SERRIA}
              >
                <Flex flexDirection="column">
                  <Text
                    mt="3px"
                    fontSize={12}
                    fontWeight={700}
                    textAlign="center"
                    fontFamily="Orbitron"
                    color={Colors.BLACK_SOLID_100}
                  >
                    Slot
                  </Text>
                  <Text
                    mt="-5px"
                    fontSize={14}
                    fontWeight={900}
                    textAlign="center"
                    fontFamily="Orbitron"
                    color={Colors.BLACK_SOLID_100}
                  >
                    {currentSlot}
                  </Text>
                </Flex>
              </Box>
            )}
            <Image
              h="125px"
              w="125px"
              mb="10px"
              style={{
                borderRadius: '100%',
                border: `5px solid ${Colors.SILVER}`,
              }}
              src={selectedImg}
            />
            <Text fontWeight="medium" fontFamily="Orbitron" fontSize={16}>
              {selectedBoost?.name}
            </Text>
          </Flex>

          {!isMainBoost && (
            <Flex flexDirection="column" ml={5} mt={5} alignItems="center">
              <Text fontWeight="medium" fontFamily="Orbitron" fontSize={28}>
                {selectedBoost?.percentage}%
              </Text>
              <Text
                color={Colors.GRAY_CHATEAU}
                fontWeight="medium"
                fontFamily="Orbitron"
                fontSize={12}
                mt="-10px"
              >
                Boost Multiplier
              </Text>

              {/* note: hidden until further notice */}
              {/* <Text fontWeight="medium" fontFamily="Orbitron" fontSize={28}>
              XXXXX
            </Text>
            <Text color="grey" fontWeight="medium" fontFamily="Orbitron" fontSize={12} mt="-10px">
              Next Total Rating
            </Text> */}

              <Flex mt={2} alignItems="center">
                <Box w="30px" mr={2}>
                  <TriliumIcon boxSize="25px" />
                </Box>
                <Text fontWeight="medium" fontFamily="Orbitron" fontSize={28}>
                  {selectedBoost?.price}
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>

        <Flex sx={{ gap: '30px' }} mt={10} direction={{ base: 'column-reverse', lg: 'row' }}>
          <Button
            size="lg"
            fontSize={16}
            variant="tertiary"
            onClick={() => onClose()}
            width={currentBreakpointWidth}
          >
            Cancel
          </Button>
          {!isMainBoost ? (
            <Button
              size="lg"
              fontSize={16}
              variant="negative"
              onClick={() => {
                if (isDemoUser) {
                  setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                } else {
                  onBoostSlot()
                }
              }}
              width={currentBreakpointWidth}
            >
              Yes, Boost Slot {currentSlot}
            </Button>
          ) : (
            <Button
              size="lg"
              fontSize={16}
              variant="negative"
              onClick={() => {
                if (isDemoUser) {
                  setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                } else {
                  onApplyMainBoost(selectedBoost.name)
                }
              }}
              width={currentBreakpointWidth}
            >
              Yes, apply {selectedBoost?.name}
            </Button>
          )}
        </Flex>

        {!isMainBoost && (
          <Flex mt={5} mb={5} alignItems="center">
            <Text
              color={Colors.GRAY_CHATEAU}
              fontFamily="tlm"
              fontSize={16}
              fontWeight={700}
              mr={1}
            >
              Next Boost Application:
            </Text>
            <Text color={Colors.SNOW_WHITE} fontFamily="tlm" fontSize={16} fontWeight={500} ml={1}>
              {timer}
            </Text>
          </Flex>
        )}
      </Flex>
    </Center>
  )
}
