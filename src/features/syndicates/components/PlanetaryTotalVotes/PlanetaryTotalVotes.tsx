import { VStack, Text, Box } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

export const PlanetaryTotalVotes = ({ votes }: { votes: number }) => {
  return (
    <VStack alignItems="start" minW="50px">
      <Box mb="-15px">
        <Text
          fontSize={20}
          fontFamily="orb"
          textAlign="start"
          marginInline="0px"
          color={Colors.SNOW_WHITE}
        >
          {formatNumber(votes, 0, 0)}
        </Text>
      </Box>
      <Text
        pt="3px"
        h="33px"
        fontSize={14}
        fontWeight={400}
        fontFamily="tlm"
        textAlign="start"
        color={Colors.GRAY_CHATEAU}
      >
        Total Votes
      </Text>
    </VStack>
  )
}
