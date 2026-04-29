import { Flex, Text } from '@chakra-ui/react'
import { LandSlot, SlotVariant } from 'features/mining/types/LandownerTypes'
import { filter } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

const LandBoosts = ({ land }) => {
  const {
    wax: { managingLandBoostFullSlots },
  } = useAppState()

  if (!land) return <></>

  const usedBoostSlots: number = filter(
    managingLandBoostFullSlots,
    (c: LandSlot) => c.mod === SlotVariant.USED
  )?.length
  const availableBoostSlots: number = filter(
    managingLandBoostFullSlots,
    (d: LandSlot) => d.mod === SlotVariant.ADD
  )?.length

  return (
    <Flex alignItems="center" color={Colors.CARIBBEAN_GREEN}>
      <Flex direction="column" alignItems="flex-start">
        <Text
          fontFamily="orb"
          fontWeight="normal"
          fontSize={20}
          letterSpacing="0.1em"
          textAlign="center"
          color={Colors.SNOW_WHITE}
        >
          {`${usedBoostSlots}/${usedBoostSlots + availableBoostSlots}`}
        </Text>
        <Text
          fontFamily="tlm"
          fontWeight="bold"
          fontSize="sm"
          letterSpacing="0.1em"
          color={Colors.SNOW_WHITE}
        >
          Boosts Active/Available
        </Text>
      </Flex>
    </Flex>
  )
}

export { LandBoosts }
