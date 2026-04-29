import { StackingIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

const LandCoordinates = ({ land }) => {
  if (!land) return <></>

  return (
    <Flex alignItems="center" color={Colors.DI_SERRIA}>
      <Box w="50px" mr="15px">
        <StackingIcon fill={Colors.DI_SERRIA} w="40px" h="40px" />
      </Box>
      <Flex direction="column" alignItems="flex-start">
        <Text
          fontFamily="Orbitron"
          fontWeight="normal"
          fontSize={18}
          letterSpacing="0.1em"
          textAlign="center"
          color={Colors.SNOW_WHITE}
        >
          {`${land?.data?.x}:${land?.data?.y}`}
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontWeight="bold"
          fontSize="sm"
          letterSpacing="0.1em"
          color={Colors.DI_SERRIA}
        >
          Land Coordinates
        </Text>
      </Flex>
    </Flex>
  )
}

export { LandCoordinates }
