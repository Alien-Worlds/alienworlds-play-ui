import React, { FC } from 'react'

import { CheckIcon, MinusIcon } from '@alien-worlds/icons'
import { Box, Flex } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

type MemberTermsStatusBadgeProps = {
  isTermsSigned: boolean
  children?: React.ReactNode
  positionOffset: number
}

export const MemberTermsStatusBadge: FC<MemberTermsStatusBadgeProps> = ({
  isTermsSigned,
  positionOffset,
  children,
}: MemberTermsStatusBadgeProps) => {
  return (
    <Box position="relative">
      {children}
      <Flex
        p={0.5}
        zIndex={3}
        width="30px"
        height="30px"
        border="6px solid"
        borderRadius="50%"
        bottom={positionOffset}
        right={positionOffset}
        position="absolute"
        bg={isTermsSigned ? Colors.OCEAN_GREEN : Colors.TANGERINE}
        borderColor={Colors.BLACK_SOLID_65}
        backgroundClip="padding-box"
      >
        {isTermsSigned ? (
          <CheckIcon width="14px" height="14px" />
        ) : (
          <MinusIcon width="14px" height="14px" />
        )}
      </Flex>
    </Box>
  )
}
