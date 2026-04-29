import { VStack, Text, Box } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { pluralize } from 'shared/util/helpers'

export const PlanetaryVoteDecay = ({ voteDecay }: { voteDecay: number }) => {
  return (
    <VStack alignItems="start" minW="75px">
      <Box mb="-15px">
        <Text
          w="auto"
          minW="100px"
          fontSize={20}
          fontFamily="orb"
          textAlign="start"
          marginInline="0px"
          color={Colors.SNOW_WHITE}
        >
          {voteDecay || 0}
          <Text
            as="span"
            fontSize={14}
            paddingLeft={1}
            fontFamily="tlm"
            fontWeight={500}
            position="absolute"
            color={Colors.SNOW_WHITE}
          >
            {pluralize(voteDecay, 'Day')}
          </Text>
        </Text>
      </Box>
      <Text
        pt="3px"
        h="33px"
        mr="auto"
        minW="100px"
        fontSize={14}
        fontWeight={400}
        fontFamily="tlm"
        textAlign="start"
        color={Colors.CORN}
      >
        Vote Decay
      </Text>
    </VStack>
  )
}
