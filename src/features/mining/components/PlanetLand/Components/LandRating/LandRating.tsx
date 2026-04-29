import { LandRatingIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatLandRating } from 'shared/util/helpers'

import { Constants } from '../../../../../../shared/util/constants'

const LandRating = ({ land }) => {
  if (!land) return <></>

  return (
    <Flex alignItems="center" color={Colors.CARIBBEAN_GREEN}>
      <Box w="50px" mr="15px">
        <LandRatingIcon width="40px" height="40px" />
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
          {formatLandRating(
            land?.data?.landrating ? land?.data?.landrating : Constants.DEFAULT_LAND_RATING
          )}
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontWeight="bold"
          fontSize="sm"
          letterSpacing="0.1em"
          color={Colors.CARIBBEAN_GREEN}
        >
          Land Rating
        </Text>
      </Flex>
    </Flex>
  )
}

export { LandRating }
