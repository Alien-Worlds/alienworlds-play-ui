import { VFC } from 'react'

import { Flex, Text, Tooltip, useMediaQuery } from '@chakra-ui/react'
// import { TooltipLocations } from 'components/glossary/glossaryConst'
// import { GlossaryInfoIcon } from 'components/glossary/GlossaryInfoIcon'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { PlanetDetailsResponse } from 'graphql/types'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'

import { RarityPoolColors } from '../../utils/constants'

export interface RarityPollsBarProps {
  planet: PlanetDetailsResponse
}

export const RarityPoolsHorizontalBar: VFC<RarityPollsBarProps> = ({ planet }) => {
  const { data: rarityPools } = useRarityPools(planet?.planet_details.planet_name)
  const [isGreaterThan768] = useMediaQuery('(min-width: 768px)')
  return (
    <Flex w="full" alignItems="center" justifyContent="flex-start" my={8} pr="15px">
      <Flex w="full" flex="1 1 auto" flexWrap="nowrap">
        {isGreaterThan768 && (
          <Flex flexWrap="nowrap" alignItems="center" gap={2}>
            {/* note: pending to add the correct Glossary link here */}
            {/* <GlossaryInfoIcon
              width={23}
              height={23}
              glossaryId={TooltipLocations.MINING_LAND_STATS_TITLE}
              mr={3}
            /> */}
            <Text fontFamily="orb" fontSize={18} fontWeight="bold" whiteSpace="nowrap" mr={4}>
              Global Pool Ratios
            </Text>
          </Flex>
        )}
        {map(rarityPools, (rp, index) => (
          <Tooltip label={rp.rarityName} placement="top" key={index}>
            <Flex
              boxSizing="content-box"
              borderLeft={8}
              bg={RarityPoolColors[rp.rarityName]}
              borderRadius={index === 0 ? '4px' : '0 4px 4px 0'}
              borderWidth={index === 0 ? '2px' : '0 2px 0 0'}
              w={`${rp.percentage}%`}
              borderColor={Colors.SNOW_WHITE}
              mr={-3}
              zIndex={rarityPools.length - index + 2000}
              justifyContent="flex-end"
              alignItems="center"
              color={rp.rarityName === 'Abundant' ? Colors.BLACK_SOLID_100 : Colors.SNOW_WHITE}
              minW="fit-content"
              pl={2}
              key={rp.rarityName}
            >
              <Text fontFamily="tlm" fontSize="xs" fontWeight="bold" mx={2}>
                {rp.percentage}%
              </Text>
            </Flex>
          </Tooltip>
        ))}
      </Flex>
    </Flex>
  )
}
