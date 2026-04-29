import { VFC } from 'react'

import { RarityPoolsIcon } from '@alien-worlds/icons'
import { Box, HStack, Text, SimpleGrid } from '@chakra-ui/react'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'

import { RarityPoolColors } from '../../utils/constants'

interface RarityPollsGridProps {
  planetName: string
}
const RarityPoolsGrid: VFC<RarityPollsGridProps> = ({ planetName }) => {
  const { data: rarityPools } = useRarityPools(planetName)

  return (
    <>
      <HStack mt={{ base: 8, sm: 4 }}>
        <RarityPoolsIcon boxSize={20} color={Colors.MID_GRAY} />
        <Text
          width="150px"
          fontFamily="orb"
          fontSize="md"
          color={Colors.MID_GRAY}
          fontWeight="bold"
          mx={2}
        >
          Rarity Pools
        </Text>
      </HStack>
      {planetName && (
        <SimpleGrid columns={2} gap="2" pb="10px">
          {rarityPools &&
            map(rarityPools, (rp) => (
              <Box key={rp?.rarityName} display="flex" alignItems="center" py="5px">
                <Box
                  mx={2}
                  borderRadius={4}
                  width={4}
                  height="40px"
                  bg={RarityPoolColors[rp.rarityName]}
                ></Box>
                <Box display="flex" flexDirection="column">
                  <Text fontFamily="tlm" color={Colors.MID_GRAY} fontSize="md">
                    {rp.rarityName}
                  </Text>
                  <Text fontFamily="orb" fontSize="md">
                    {rp.amount}
                  </Text>
                </Box>
              </Box>
            ))}
        </SimpleGrid>
      )}
    </>
  )
}

export { RarityPoolsGrid }
