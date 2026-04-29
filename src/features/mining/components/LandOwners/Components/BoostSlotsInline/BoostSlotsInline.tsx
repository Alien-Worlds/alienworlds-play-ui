import { useCallback, useMemo } from 'react'

import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { SlotNumber } from 'features/mining/components/LandOwners/Components/SlotNumber/SlotNumber'
import { useLandBoostSlots } from 'features/mining/hooks/useLandBoostSlots'
import { LandSlot, SlotSize, SlotVariant } from 'features/mining/types/LandownerTypes'
import { map } from 'lodash'
import { useActions, useAppState } from 'store'

const BoostSlotsInlineComponent = () => {
  const {
    wax: { managingLandBoostFullSlots },
  } = useAppState()

  const {
    main: { setLandOwnerDrawerPayload },
  } = useActions()

  const { firstAvailableSlot } = useLandBoostSlots()

  const handleSlotClick = useCallback(
    (slotNumber: number) => {
      if (slotNumber === firstAvailableSlot) {
        setLandOwnerDrawerPayload({ slotNumber })
      }
    },
    [firstAvailableSlot, setLandOwnerDrawerPayload]
  )

  const inlineSlots = useMemo(() => {
    return map(managingLandBoostFullSlots, (slot: LandSlot) => {
      let variant: SlotVariant = slot.mod

      // BoostSlotsInline is used when the user open the drawer not in the landowner page
      // and there is no option for user to unlock the slot
      // so we need to change the coloration of the slot
      switch (slot.mod) {
        case SlotVariant.USED:
          variant = SlotVariant.LOCKED
          break
        case SlotVariant.ADD:
          variant = SlotVariant.USED
          break
        default:
          variant = SlotVariant.EMPTY
          break
      }

      return {
        ...slot,
        mod: variant,
      }
    })
  }, [managingLandBoostFullSlots])

  return (
    <VStack>
      <Box mb={2} w="full">
        <Text fontSize="xl" fontWeight="semibold">
          Available Slots to Boost
        </Text>
      </Box>
      <Flex
        w="full"
        direction="row"
        justifyContent="center"
        alignItems="center"
        gap={3}
        wrap="wrap"
      >
        {map(inlineSlots, (slot: LandSlot) => {
          const isAvailable = slot.number === firstAvailableSlot
          const isDisabled = slot.mod === SlotVariant.USED && !isAvailable

          return (
            <Box
              key={`slot-${slot.number}`}
              cursor={isAvailable ? 'pointer' : 'not-allowed'}
              opacity={isDisabled ? 0.3 : undefined}
              onClick={() => handleSlotClick(slot.number)}
            >
              <SlotNumber number={slot.number} variant={slot.mod} size={SlotSize.MD} />
            </Box>
          )
        })}
      </Flex>
    </VStack>
  )
}

const BoostSlotsInline = BoostSlotsInlineComponent

export { BoostSlotsInline }
