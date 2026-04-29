import { FC } from 'react'

import { PlusIcon, LockIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { SlotVariant, SlotSize } from 'features/mining/types/LandownerTypes'
import { Colors } from 'shared/util/colors'

interface SlotNumberProps {
  number: String | Number
  variant: SlotVariant
  size: SlotSize
}

const SlotNumber: FC<SlotNumberProps> = ({ number, variant, size }) => {
  const color = {
    [SlotVariant.USED]: Colors.CARIBBEAN_GREEN,
    [SlotVariant.ADD]: Colors.ALTO,
    [SlotVariant.LOCKED]: Colors.RADICAL_RED,
    [SlotVariant.EMPTY]: Colors.ALTO,
  }

  const background = {
    [SlotVariant.USED]: null,
    [SlotVariant.ADD]: Colors.MID_GRAY,
    [SlotVariant.LOCKED]: null,
    [SlotVariant.EMPTY]: null,
  }

  const borderWeight = '3px solid'
  const border = {
    [SlotVariant.USED]: `${borderWeight} ${Colors.CARIBBEAN_GREEN}`,
    [SlotVariant.ADD]: `${borderWeight} ${Colors.MID_GRAY}`,
    [SlotVariant.LOCKED]: `${borderWeight} ${Colors.RADICAL_RED}`,
    [SlotVariant.EMPTY]: `${borderWeight} ${Colors.DOVE_GRAY}`,
  }

  const PlusSlotIconSize = {
    width: {
      [SlotSize.SM]: '30px',
      [SlotSize.MD]: '30px',
    },
    left: {
      [SlotSize.SM]: '10px',
      [SlotSize.MD]: '15px',
    },
  }

  const LockedSlotIconSize = {
    width: {
      [SlotSize.SM]: '42px',
      [SlotSize.MD]: '50px',
    },
    left: {
      [SlotSize.SM]: '4px',
      [SlotSize.MD]: '15px',
    },
  }

  const TextSize = {
    width: {
      [SlotSize.SM]: '50px',
      [SlotSize.MD]: '80px',
    },
    height: {
      [SlotSize.SM]: '50px',
      [SlotSize.MD]: '80px',
    },
    fontSize: {
      [SlotSize.SM]: '24px',
      [SlotSize.MD]: '24px',
    },
  }

  const SlotIcon = () => {
    switch (variant) {
      case SlotVariant.ADD:
        return (
          <Flex position="absolute" bottom="-15px" left={PlusSlotIconSize.left[size]}>
            <PlusIcon
              color={Colors.EDWARD}
              w={PlusSlotIconSize.width[size]}
              h={PlusSlotIconSize.width[size]}
            />
          </Flex>
        )
      case SlotVariant.LOCKED:
        return (
          <Flex position="absolute" bottom="-17px" left={LockedSlotIconSize.left[size]}>
            <LockIcon
              color={Colors.RADICAL_RED}
              w={LockedSlotIconSize.width[size]}
              h={LockedSlotIconSize.width[size]}
            />
          </Flex>
        )
      default:
        return null
    }
  }

  return (
    <Box position="relative">
      <Box>
        <Text
          w={TextSize.width[size]}
          h={TextSize.height[size]}
          color={color[variant]}
          paddingBottom={variant === SlotVariant.LOCKED ? '10px' : null}
          fontSize={TextSize.fontSize[size]}
          fontWeight={600}
          background={background[variant]}
          borderRadius="50%"
          border={border[variant]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {number?.toString()}
        </Text>
      </Box>

      <SlotIcon />
    </Box>
  )
}

export { SlotNumber }
