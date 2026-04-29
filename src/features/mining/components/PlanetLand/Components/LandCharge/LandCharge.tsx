import { LightIcon2 } from '@alien-worlds/icons'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { Colors } from 'shared/util/colors'

export const LandCharge = ({ land }: { land: IAsset }) => {
  return (
    <Flex h="20px" position="relative" alignItems="center">
      <HStack mr={2}>
        <Text
          mr="-6px"
          mt="-2px"
          fontSize={18}
          fontWeight={600}
          fontFamily="orb"
          color={Colors.MALIBU}
        >
          <Box as="span" borderRadius={8}>
            {land?.data?.delay / 10}
          </Box>
        </Text>
        <Text
          fontSize={18}
          fontFamily="orb"
          fontWeight={600}
          textAlign="start"
          letterSpacing="0.1em"
          color={Colors.MALIBU}
        >
          <Box as="span" borderRadius={8}>
            x
          </Box>
        </Text>
      </HStack>

      <Box w="26px">
        <LightIcon2 color={Colors.MALIBU} boxSize={15} />
      </Box>
    </Flex>
  )
}
