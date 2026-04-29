import { ProfitsIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { Colors } from 'shared/util/colors'

const LandCommission = ({
  land,
  size,
  isReversed,
  showLabel,
}: {
  land: IAsset
  size?: string
  isReversed?: boolean
  showLabel?: boolean
}) => {
  if (!land) return <></>

  return (
    <Flex
      alignItems="center"
      color={Colors.SNOW_WHITE}
      direction={isReversed ? 'row-reverse' : 'row'}
    >
      <Flex direction="column" alignItems="flex-start" pr="5px">
        <Text
          fontFamily="Orbitron"
          fontWeight="normal"
          fontSize={18}
          letterSpacing="0.1em"
          textAlign="center"
          color={Colors.SNOW_WHITE}
        >
          {land.mutable_data.commission / 100 || 0}%
        </Text>
        {showLabel && (
          <Text
            fontFamily="Titillium Web"
            fontWeight="bold"
            fontSize="sm"
            letterSpacing="0.1em"
            color={Colors.SNOW_WHITE}
          >
            Commission
          </Text>
        )}
      </Flex>
      <Box mr="25px">
        <ProfitsIcon boxSize={size || '40px'} color={Colors.SNOW_WHITE} />
      </Box>
    </Flex>
  )
}

export { LandCommission }
