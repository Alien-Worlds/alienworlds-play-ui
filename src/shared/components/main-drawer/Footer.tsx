import { VFC } from 'react'

import { Box, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'

export const Footer: VFC = () => {
  return (
    <Box w="100%" textAlign="center">
      <Text
        fontSize={10}
        fontWeight={300}
        fontFamily="tlm"
        display="inline-block"
        color={Colors.SNOW_WHITE}
      >
        UI version: {config.AppVersion}
      </Text>
    </Box>
  )
}
