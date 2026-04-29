import { Text, Box } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

export const PlanetaryName = ({ name }: { name: string }) => {
  return (
    <Box mr="10px" minW="130px" pl="7px">
      <Text fontFamily="orb" textAlign="start" fontSize={20} color={Colors.SNOW_WHITE}>
        {name}
      </Text>
    </Box>
  )
}
