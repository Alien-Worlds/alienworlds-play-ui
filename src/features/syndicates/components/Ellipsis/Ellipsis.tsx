import { FC } from 'react'

import { HelpIcon } from '@alien-worlds/icons'
import { Flex } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

type EllipsisProps = {
  boxSize: number
}

const Ellipsis: FC<EllipsisProps> = ({ boxSize }) => {
  return (
    <Flex gap="3px">
      <HelpIcon boxSize={boxSize} color={Colors.ROBIN_EGG_BLUE} />
      <HelpIcon boxSize={boxSize} color={Colors.DI_SERRIA} />
      <HelpIcon boxSize={boxSize} color={Colors.SNOW_WHITE} />
    </Flex>
  )
}

export { Ellipsis }
