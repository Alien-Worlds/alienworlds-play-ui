import { FC, useCallback, useMemo, useState } from 'react'

import { InfoIcon2 } from '@alien-worlds/icons'
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Text,
  SkeletonCircle,
  Skeleton,
} from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { SlotNumber } from 'features/mining/components/LandOwners/Components/SlotNumber/SlotNumber'
import { useLandBoostSlots } from 'features/mining/hooks/useLandBoostSlots'
import { LandSlot, SlotSize, SlotVariant } from 'features/mining/types/LandownerTypes'
import { map } from 'lodash'
import ScrollContainer from 'react-indiana-drag-scroll'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

interface BoostTableProps {
  onShowUnlockModal: () => void
  setSlotToUnlock: (slot: number) => void
}

interface SlotRowProps {
  slot: LandSlot
  firstAvailableSlot: number
  onSlotAction: (slotNumber: number) => void
  onUnlockSlot: (slotNumber: number) => void
}

const ThWrapper = styled(Th)({
  color: 'gray',
  fontFamily: 'Titillium Web',
  border: 'none',
  fontSize: '22px',
  fontWeight: 400,
  textTransform: 'none',
})

const TdWrapper = styled(Td)({
  border: 'none',
  fontSize: 24,
})

const UsedSlotRow = ({ slot }: SlotRowProps) => {
  return (
    <Tr border="none" height="60px">
      <TdWrapper w="75px">
        <SlotNumber number={slot.number} variant={SlotVariant.USED} size={SlotSize.SM} />
      </TdWrapper>
      <TdWrapper w="200px" fontWeight="semibold">
        <Text fontSize={18} letterSpacing="0.1em" fontWeight={400} fontFamily="tlm">
          {slot.name}
        </Text>
      </TdWrapper>
      <TdWrapper color={Colors.DI_SERRIA} textAlign="left">
        <Text fontSize={18} letterSpacing="0.1em" fontWeight={400} fontFamily="tlm">
          {slot.origin}
        </Text>
      </TdWrapper>
      <TdWrapper textAlign="right">
        <Text fontSize={18} letterSpacing="0.1em" fontWeight={400} fontFamily="Orbitron">
          {slot.percentage}%
        </Text>
      </TdWrapper>
    </Tr>
  )
}

const AddSlotRow = ({ slot, firstAvailableSlot, onSlotAction }: SlotRowProps) => {
  const isAvailable = slot.number === firstAvailableSlot

  return (
    <Tr border="none" height="60px">
      <Td w="75px" border="none" opacity={!isAvailable ? 0.3 : null}>
        <SlotNumber number={slot.number} variant={SlotVariant.ADD} size={SlotSize.SM} />
      </Td>
      <Td border="none" textAlign="center" colSpan={3}>
        <Button
          width={{ base: '60%', sm: '80%', lg: '100%' }}
          height="auto"
          paddingY="8px"
          borderRadius="25px"
          background={Colors.GRAY_ALPHA_50}
          border={`2px solid ${Colors.MID_GRAY}`}
          color={Colors.EDWARD}
          _hover={{ bg: Colors.MID_GRAY }}
          disabled={!isAvailable}
          fontSize="2xl"
          onClick={() => onSlotAction(slot.number)}
        >
          Add Boost
        </Button>
      </Td>
    </Tr>
  )
}

const UnlockSlotRow = ({ slot, onUnlockSlot }: SlotRowProps) => {
  return (
    <Tr border="none" height="60px">
      <Td border="none" w="75px">
        <SlotNumber number={slot.number} variant={SlotVariant.LOCKED} size={SlotSize.SM} />
      </Td>
      <Td border="none" textAlign="center" colSpan={3}>
        <Flex flexWrap="wrap" justifyContent="center" h="50px">
          <Button
            width={{ base: '60%', sm: '80%', lg: '100%' }}
            height="auto"
            background={Colors.TAWNY_PORT}
            border={`2px solid ${Colors.RADICAL_RED}`}
            borderRadius="25px"
            fontSize="2xl"
            paddingY="8px"
            _hover={{ bg: Colors.RADICAL_RED }}
            onClick={() => onUnlockSlot(slot.number)}
          >
            Unlock this Slot
          </Button>
          <Flex mt="30px" alignItems="center" flexDirection="column" justifyContent="center">
            <InfoIcon2 boxSize={40} />
            <Text
              mt="30px"
              fontSize="18px"
              fontWeight={400}
              fontFamily="tlm"
              textAlign="start"
              lineHeight="27.38px"
              letterSpacing="0.1em"
              color={Colors.SNOW_WHITE}
            >
              By holding a Land NFT, an Explorer receives Trillium based on its "Land Rating."
              Landowners must maintain this rating to sustain or increase their Daily Trillium
              Allocation (DTAL). Otherwise, the DTAL rate slowly decays over time. An Explorer can
              increase or maintain a Land's DTAL rate by spending Trillium to purchase a Boost,
              which lasts for one 25-hour period. For a Boost to be deployed, it must be positioned
              into an open Slot of a Land NFT. Slots can be purchased with Trillium and do not
              expire, though the Boosts deployed in them do. Landowners are not the only Explorers
              who can Boost Land. Anyone can purchase a Boost, and so long as the Land has an open
              Slot for it, it can become activated on a respective Land.
            </Text>
          </Flex>
        </Flex>
      </Td>
    </Tr>
  )
}

const EmptySlotRow = ({ slot }: SlotRowProps) => {
  return (
    <Tr border="none" height="60px">
      <Td w="75px" border="none">
        <SlotNumber number={slot.number} variant={SlotVariant.EMPTY} size={SlotSize.SM} />
      </Td>
      <Td border="none" colSpan={3}></Td>
    </Tr>
  )
}

const BoostSlotRow = ({ slot, firstAvailableSlot, onSlotAction, onUnlockSlot }: SlotRowProps) => {
  switch (slot.mod) {
    case SlotVariant.USED:
      return (
        <UsedSlotRow
          slot={slot}
          firstAvailableSlot={firstAvailableSlot}
          onSlotAction={onSlotAction}
          onUnlockSlot={onUnlockSlot}
        />
      )
    case SlotVariant.ADD:
      return (
        <AddSlotRow
          slot={slot}
          firstAvailableSlot={firstAvailableSlot}
          onSlotAction={onSlotAction}
          onUnlockSlot={onUnlockSlot}
        />
      )
    case SlotVariant.LOCKED:
      return (
        <UnlockSlotRow
          slot={slot}
          firstAvailableSlot={firstAvailableSlot}
          onSlotAction={onSlotAction}
          onUnlockSlot={onUnlockSlot}
        />
      )
    case SlotVariant.EMPTY:
      return (
        <EmptySlotRow
          slot={slot}
          firstAvailableSlot={firstAvailableSlot}
          onSlotAction={onSlotAction}
          onUnlockSlot={onUnlockSlot}
        />
      )
    default:
      return null
  }
}

const BoostTable: FC<BoostTableProps> = ({ onShowUnlockModal, setSlotToUnlock }) => {
  const {
    main: { setLandOwnerDrawerPayload, setIsLandOwnerAddSlotDrawerOpen },
  } = useActions()
  const [id] = useState(() => v4())
  const {
    wax: { managingLandBoostFullSlots, isLoadingManagingLandBoosts },
  } = useAppState()

  const { firstAvailableSlot } = useLandBoostSlots()

  const handleSlotAction = useCallback(
    (slotNumber: number) => {
      setLandOwnerDrawerPayload({ slotNumber })
      setIsLandOwnerAddSlotDrawerOpen(true)
    },
    [setLandOwnerDrawerPayload, setIsLandOwnerAddSlotDrawerOpen]
  )

  const handleUnlockSlot = useCallback(
    (slotNumber: number) => {
      setSlotToUnlock(slotNumber)
      onShowUnlockModal()
    },
    [setSlotToUnlock, onShowUnlockModal]
  )

  const LoadingSkeleton = useMemo(() => {
    return (
      <>
        {map(
          Array.from(Array(3), (_, index) => {
            return (
              <Tr border="none" height="60px" key={id + index}>
                <TdWrapper w="75px">
                  <SkeletonCircle boxSize="50px" />
                </TdWrapper>
                <TdWrapper>
                  <Skeleton height="30px" borderRadius="10px" />
                </TdWrapper>
                <TdWrapper>
                  <Skeleton height="30px" borderRadius="10px" />
                </TdWrapper>
                <TdWrapper>
                  <Skeleton height="30px" borderRadius="10px" />
                </TdWrapper>
              </Tr>
            )
          })
        )}
      </>
    )
  }, [id])

  return (
    <>
      <Box w="100%" overflowX="auto">
        <ScrollContainer className="scroll-container">
          <Table mx="auto" minWidth="450px">
            <Thead>
              <Tr>
                <ThWrapper textAlign="center">
                  <Text fontSize={20} fontWeight={600} letterSpacing="0.1em" fontFamily="tlm">
                    Slot
                  </Text>
                </ThWrapper>
                <ThWrapper w="250px">
                  <Text fontSize={20} fontWeight={600} fontFamily="tlm" letterSpacing="0.1em">
                    Boost
                  </Text>
                </ThWrapper>
                <ThWrapper textAlign="left">
                  <Text fontSize={20} fontWeight={600} letterSpacing="0.1em" fontFamily="tlm">
                    Origin
                  </Text>
                </ThWrapper>
                <ThWrapper textAlign="right">
                  <Text fontSize={20} fontWeight={600} letterSpacing="0.1em" fontFamily="tlm">
                    Percent
                  </Text>
                </ThWrapper>
              </Tr>
            </Thead>

            <Tbody>
              {!isLoadingManagingLandBoosts &&
                managingLandBoostFullSlots.map((slot: LandSlot) => {
                  return (
                    <BoostSlotRow
                      key={`slot-${slot.number}`}
                      slot={slot}
                      firstAvailableSlot={firstAvailableSlot}
                      onSlotAction={handleSlotAction}
                      onUnlockSlot={handleUnlockSlot}
                    />
                  )
                })}

              {isLoadingManagingLandBoosts && LoadingSkeleton}
            </Tbody>
          </Table>
        </ScrollContainer>
      </Box>
    </>
  )
}

export { BoostTable }
