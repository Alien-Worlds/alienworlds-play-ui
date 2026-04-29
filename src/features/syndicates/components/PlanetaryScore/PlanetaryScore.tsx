import { VStack, Text, Box } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

export const PlanetaryScore = ({ score }: { score: number }) => {
  return (
    <VStack alignItems="start" w="130px" pl="7px">
      <Box mb="-12px">
        <Text
          w="120px"
          fontSize={20}
          fontFamily="orb"
          textAlign="start"
          marginInline="0px"
          color={Colors.DODGE_BLUE}
        >
          {formatNumber(score, 0, 0)}
        </Text>
      </Box>
      <Text
        h="20px"
        w="120px"
        fontSize={14}
        fontWeight={600}
        fontFamily="tlm"
        textAlign="start"
        color={Colors.SNOW_WHITE}
      >
        Score
      </Text>
    </VStack>
  )
}
