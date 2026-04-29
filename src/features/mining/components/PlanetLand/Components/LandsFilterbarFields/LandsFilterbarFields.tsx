import { VFC } from 'react'

import { Flex, Text } from '@chakra-ui/react'
import { FilterLandOwner } from 'features/mining/components/PlanetLand/Components/FilterLandOwner'
import { FilterLandRarity } from 'features/mining/components/PlanetLand/Components/FilterLandRarity'
import { FilterLandSortBy } from 'features/mining/components/PlanetLand/Components/FilterLandSortBy'
import { FilterLandTerrain } from 'features/mining/components/PlanetLand/Components/FilterLandTerrain'
import { FilterLandToggleSort } from 'features/mining/components/PlanetLand/Components/FilterLandToggleSort'
import { Colors } from 'shared/util/colors'

const LandsFilterbarFields: VFC = () => {
  return (
    <Flex
      mx={0}
      my={4}
      w="full"
      gap="15px"
      zIndex={1499}
      flexWrap="wrap"
      fontFamily="tlm"
      justifyContent="space-between"
    >
      <Flex gap={3} width={{ base: '100%', sm: 'fit-content' }}>
        <Text color={Colors.SNOW_WHITE} my="auto" mr={{ base: 'auto', xl: 0 }}>
          Terrain
        </Text>
        <FilterLandTerrain />
      </Flex>

      <Flex gap={3} width={{ base: '100%', sm: 'fit-content' }}>
        <Text color={Colors.SNOW_WHITE} my="auto" mr={{ base: 'auto', xl: 0 }}>
          Rarity
        </Text>
        <FilterLandRarity />
      </Flex>

      <Flex gap={3} width={{ base: '100%', sm: 'fit-content' }}>
        <Text color={Colors.SNOW_WHITE} my="auto" mr={{ base: 'auto', xl: 0 }}>
          Owner
        </Text>
        <FilterLandOwner />
      </Flex>

      <Flex gap={3} width={{ base: '100%', sm: 'fit-content' }}>
        <Text minW="50px" color={Colors.SNOW_WHITE} my="auto" mr={{ base: 'auto', xl: 0 }}>
          Sort by
        </Text>
        <FilterLandSortBy />
      </Flex>

      <Flex w="fit-content">
        <FilterLandToggleSort />
      </Flex>
    </Flex>
  )
}

export { LandsFilterbarFields }
